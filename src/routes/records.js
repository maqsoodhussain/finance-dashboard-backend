const express = require('express');
const router = express.Router();

const { createRecordSchema, updateRecordSchema } = require('../validators/financialRecord');
const FinancialRecordService = require('../services/financialRecord');
const authMiddleware = require('../middleware/auth');
const { requireRole, requireOwnershipOrAdmin } = require('../middleware/rbac');
const { successResponse, createdResponse } = require('../utils/response');

/**
 * Get all financial records with optional filtering
 * GET /api/records
 * Requires authentication
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    // Build filters from query parameters
    const filters = { ...req.query };

    // Non-admins can only see their own records
    if (req.user.role !== 'admin') {
      filters.userId = req.user._id.toString();
    }

    const records = await FinancialRecordService.getAllRecords(filters);
    return successResponse(res, { records, count: records.length });
  } catch (error) {
    next(error);
  }
});

/**
 * Get single record by ID
 * GET /api/records/:id
 * Requires authentication (owner or admin)
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await FinancialRecordService.getRecordById(id);

    // Check permissions: admin can view all, users can only view their own
    if (req.user.role !== 'admin' && record.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view this record'
      });
    }

    return successResponse(res, { record });
  } catch (error) {
    next(error);
  }
});

/**
 * Create new financial record
 * POST /api/records
 * Requires analyst or admin role
 */
router.post('/', authMiddleware, requireRole('analyst', 'admin'), async (req, res, next) => {
  try {
    // Validate request body
    const { error } = createRecordSchema.validate(req.body, { abortEarly: false });
    if (error) {
      throw error;
    }

    // Set userId to authenticated user
    const userId = req.user._id;

    const record = await FinancialRecordService.createRecord(userId, req.body);
    return createdResponse(res, { record }, 'Record created successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * Update financial record
 * PUT /api/records/:id
 * Requires ownership or admin role
 */
router.put('/:id', authMiddleware, requireOwnershipOrAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error } = updateRecordSchema.validate(req.body, { abortEarly: false });
    if (error) {
      throw error;
    }

    const record = await FinancialRecordService.updateRecord(id, req.body);
    return successResponse(res, { record }, 'Record updated successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * Delete financial record
 * DELETE /api/records/:id
 * Requires ownership or admin role
 */
router.delete('/:id', authMiddleware, requireOwnershipOrAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await FinancialRecordService.deleteRecord(id);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
