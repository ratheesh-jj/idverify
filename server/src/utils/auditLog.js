const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 */
const createAuditLog = async ({ action, performedBy, targetType, targetId, details = {}, ipAddress = '' }) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetType,
      targetId,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error.message);
  }
};

module.exports = { createAuditLog };
