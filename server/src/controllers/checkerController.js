const IdentityRequest = require('../models/IdentityRequest');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLog');
const { sendStatusNotification } = require('../utils/email');

/**
 * GET /checker/pending - Get requests by status
 */
const getRequestsByStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status || 'pending';
    const search = req.query.search;
    const sort = req.query.sort === 'oldest' ? 1 : -1;

    const query = {};
    if (['pending', 'verified', 'rejected'].includes(status)) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : undefined },
      ].filter((q) => Object.values(q)[0] !== undefined);
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
    console.error('Get requests by status error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /checker/request/:id - Get detailed request for verification
 */
const getRequestForVerification = async (req, res) => {
  try {
    const request = await IdentityRequest.findById(req.params.id)
      .populate('makerId', 'name email')
      .populate('verifiedBy', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Get request for verification error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * PUT /checker/approve/:id - Approve a request
 */
const approveRequest = async (req, res) => {
  try {
    const { remarks } = req.body;

    const request = await IdentityRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (request.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ message: `Request is already ${request.status}.` });
    }

    request.status = 'verified';
    request.remarks = remarks || '';
    request.verifiedBy = req.user._id;
    request.verifiedAt = new Date();
    await request.save();

    // Audit log
    await createAuditLog({
      action: 'REQUEST_APPROVED',
      performedBy: req.user._id,
      targetType: 'IdentityRequest',
      targetId: request._id,
      details: { remarks, applicantName: request.fullName },
      ipAddress: req.ip,
    });

    // Send email notification to maker
    const maker = await User.findById(request.makerId);
    if (maker) {
      await sendStatusNotification(maker.email, maker.name, 'verified', remarks);
    }

    res.json({ message: 'Request approved successfully.', request });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * PUT /checker/reject/:id - Reject a request
 */
const rejectRequest = async (req, res) => {
  try {
    const { remarks } = req.body;

    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ message: 'Remarks are required when rejecting a request.' });
    }

    const request = await IdentityRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (request.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ message: `Request is already ${request.status}.` });
    }

    request.status = 'rejected';
    request.remarks = remarks;
    request.verifiedBy = req.user._id;
    request.verifiedAt = new Date();
    await request.save();

    // Audit log
    await createAuditLog({
      action: 'REQUEST_REJECTED',
      performedBy: req.user._id,
      targetType: 'IdentityRequest',
      targetId: request._id,
      details: { remarks, applicantName: request.fullName },
      ipAddress: req.ip,
    });

    // Send email notification to maker
    const maker = await User.findById(request.makerId);
    if (maker) {
      await sendStatusNotification(maker.email, maker.name, 'rejected', remarks);
    }

    res.json({ message: 'Request rejected.', request });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getRequestsByStatus,
  getRequestForVerification,
  approveRequest,
  rejectRequest,
};
