const User = require('../models/User');
const IdentityRequest = require('../models/IdentityRequest');
const AuditLog = require('../models/AuditLog');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { createAuditLog } = require('../utils/auditLog');

/**
 * GET /admin/dashboard - Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalMakers,
      totalCheckers,
      totalAdmins,
      pendingRequests,
      verifiedRequests,
      rejectedRequests,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'maker' }),
      User.countDocuments({ role: 'checker' }),
      User.countDocuments({ role: 'admin' }),
      IdentityRequest.countDocuments({ status: 'pending' }),
      IdentityRequest.countDocuments({ status: 'verified' }),
      IdentityRequest.countDocuments({ status: 'rejected' }),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('performedBy', 'name email role'),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalMakers,
        totalCheckers,
        totalAdmins,
        pendingRequests,
        verifiedRequests,
        rejectedRequests,
        totalRequests: pendingRequests + verifiedRequests + rejectedRequests,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /admin/users - Get all users with pagination
 */
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const role = req.query.role;
    const search = req.query.search;

    const query = {};
    if (role && ['maker', 'checker', 'admin'].includes(role)) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * POST /admin/user - Create a new user (admin can assign any role)
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, role: role || 'maker' });

    await createAuditLog({
      action: 'USER_CREATED',
      performedBy: req.user._id,
      targetType: 'User',
      targetId: user._id,
      details: { name, email, role: user.role, createdByAdmin: true },
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'User created successfully.', user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * PUT /admin/user/:id - Update user details
 */
const updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const oldRole = user.role;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ['maker', 'checker', 'admin'].includes(role)) user.role = role;
    if (password) user.password = password;

    await user.save();

    // Log role change specifically
    if (role && role !== oldRole) {
      await createAuditLog({
        action: 'ROLE_CHANGED',
        performedBy: req.user._id,
        targetType: 'User',
        targetId: user._id,
        details: { oldRole, newRole: role, userName: user.name },
        ipAddress: req.ip,
      });
    }

    if (password) {
      await createAuditLog({
        action: 'PASSWORD_RESET',
        performedBy: req.user._id,
        targetType: 'User',
        targetId: user._id,
        details: { userName: user.name, resetByAdmin: true },
        ipAddress: req.ip,
      });
    }

    await createAuditLog({
      action: 'USER_UPDATED',
      performedBy: req.user._id,
      targetType: 'User',
      targetId: user._id,
      details: { name, email, role },
      ipAddress: req.ip,
    });

    res.json({ message: 'User updated successfully.', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * DELETE /admin/user/:id - Delete a user
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    // Delete user's identity requests and associated images
    const requests = await IdentityRequest.find({ makerId: user._id });
    for (const request of requests) {
      await deleteFromCloudinary(request.aadhaarFrontUrl);
      await deleteFromCloudinary(request.aadhaarBackUrl);
      await deleteFromCloudinary(request.passportUrl);
      await request.deleteOne();
    }

    await createAuditLog({
      action: 'USER_DELETED',
      performedBy: req.user._id,
      targetType: 'User',
      targetId: user._id,
      details: { name: user.name, email: user.email, role: user.role },
      ipAddress: req.ip,
    });

    await user.deleteOne();

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /admin/audit-logs - Get audit logs
 */
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const action = req.query.action;

    const query = {};
    if (action) query.action = action;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('performedBy', 'name email role');

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /admin/requests - Get all requests (admin view)
 */
const getAllRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    const search = req.query.search;
    const sort = req.query.sort === 'oldest' ? 1 : -1;

    const query = {};
    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await IdentityRequest.countDocuments(query);
    const requests = await IdentityRequest.find(query)
      .sort({ createdAt: sort })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('makerId', 'name email')
      .populate('verifiedBy', 'name');

    res.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getAuditLogs,
  getAllRequests,
};
