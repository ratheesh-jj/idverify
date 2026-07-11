const IdentityRequest = require('../models/IdentityRequest');
const { deleteFromCloudinary } = require('../config/cloudinary');
const { createAuditLog } = require('../utils/auditLog');

/**
 * POST /identity/create - Create a new identity verification request
 */
const createRequest = async (req, res) => {
  try {
    const { fullName, age, gender, mobile, email, address } = req.body;

    // Validate uploaded files
    if (!req.files || !req.files.aadhaarFront || req.files.aadhaarFront.length === 0) {
      return res.status(400).json({ message: 'Aadhaar front image is required.' });
    }

    // Check for existing requests with same email or mobile
    const existingRequest = await IdentityRequest.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingRequest) {
      if (existingRequest.email === email) {
        return res.status(400).json({ message: 'A request with this email already exists.' });
      }
      return res.status(400).json({ message: 'A request with this mobile number already exists.' });
    }

    const aadhaarFrontUrl = req.files.aadhaarFront[0].path;
    const aadhaarBackUrl = req.files.aadhaarBack ? req.files.aadhaarBack[0].path : null;
    const passportUrl = req.files.passport ? req.files.passport[0].path : null;

    const identityRequest = await IdentityRequest.create({
      makerId: req.user._id,
      fullName,
      age: parseInt(age, 10),
      gender,
      mobile,
      email,
      address,
      aadhaarFrontUrl,
      aadhaarBackUrl,
      passportUrl,
      status: 'pending',
    });

    // Audit log
    await createAuditLog({
      action: 'REQUEST_CREATED',
      performedBy: req.user._id,
      targetType: 'IdentityRequest',
      targetId: identityRequest._id,
      details: { fullName, age, mobile },
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Identity verification request submitted successfully.',
      request: identityRequest,
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error while creating request.' });
  }
};

/**
 * GET /identity/my - Get all requests for the current maker
 */
const getMyRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;
    const search = req.query.search;
    const sort = req.query.sort === 'oldest' ? 1 : -1;

    const query = { makerId: req.user._id };
    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      query.status = status;
    }
    if (search) {
      query.fullName = { $regex: search, $options: 'i' };
    }

    const total = await IdentityRequest.countDocuments(query);
    const requests = await IdentityRequest.find(query)
      .sort({ createdAt: sort })
      .skip((page - 1) * limit)
      .limit(limit)
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
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /identity/:id - Get a single request by ID
 */
const getRequestById = async (req, res) => {
  try {
    const request = await IdentityRequest.findById(req.params.id)
      .populate('makerId', 'name email')
      .populate('verifiedBy', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    // Makers can only view their own requests
    if (req.user.role === 'maker' && request.makerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getRequestById,
};
