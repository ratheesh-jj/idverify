const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  createRequest,
  getMyRequests,
  getRequestById,
} = require('../controllers/identityController');

const router = express.Router();

// All identity routes require authentication
router.use(authenticate);

// Maker routes
router.post(
  '/create',
  authorize('maker', 'admin'),
  upload.fields([
    { name: 'aadhaarFront', maxCount: 1 },
    { name: 'aadhaarBack', maxCount: 1 },
    { name: 'passport', maxCount: 1 },
  ]),
  createRequest
);

router.get('/my', authorize('maker', 'admin'), getMyRequests);
router.get('/:id', authorize('maker', 'checker', 'admin'), getRequestById);

module.exports = router;
