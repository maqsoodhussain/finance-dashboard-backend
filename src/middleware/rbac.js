/**
 * Role-Based Access Control Middleware
 *
 * Usage examples:
 * - requireRole('admin') - Only admins
 * - requireRole('analyst', 'admin') - Analyst or Admin
 * - requireRole('viewer', 'analyst', 'admin') - Any authenticated user
 */

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // User is already attached to req by auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        currentRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Resource ownership check for financial records
 * Allows access if:
 * - User is admin, OR
 * - User owns the resource
 */
const requireOwnershipOrAdmin = async (req, res, next) => {
  try {
    const { id: recordId } = req.params;
    const FinancialRecord = require('../models/FinancialRecord');

    if (req.user.isAdmin()) {
      return next();
    }

    const record = await FinancialRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    if (record.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only modify your own records'
      });
    }

    next();
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error checking resource ownership',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Check if user can manage other users (admin only for non-self operations)
 */
const requireUserManagement = (req, res, next) => {
  const { id: userId } = req.params;

  // Users can update their own profile (except role changes which require admin)
  if (userId === req.user.id.toString()) {
    return next();
  }

  // For operations on other users, require admin
  if (!req.user.isAdmin()) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions to manage other users'
    });
  }

  next();
};

module.exports = {
  requireRole,
  requireOwnershipOrAdmin,
  requireUserManagement
};
