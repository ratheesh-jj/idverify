const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getRequestsByStatus,
  getRequestForVerification,
  approveRequest,
  rejectRequest,
} = require('../controllers/checkerController');

const router = express.Router();

// All checker routes require authentication and checker/admin role
router.use(authenticate);
router.use(authorize('checker', 'admin'));

router.get('/pending', getRequestsByStatus);
router.get('/request/:id', getRequestForVerification);
router.put('/approve/:id', approveRequest);
router.put('/reject/:id', rejectRequest);

module.exports = router;
