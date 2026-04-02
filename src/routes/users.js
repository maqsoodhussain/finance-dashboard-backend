const express = require('express');
const router = express.Router();

const { createUserSchema, updateUserSchema } = require('../validators/user');
const UserService = require('../services/user');
const authMiddleware = require('../middleware/auth');
const { requireRole, requireUserManagement } = require('../middleware/rbac');
const { successResponse, createdResponse } = require('../utils/response');

/**
 * Get all users
 * GET /api/users
 * Admin only
 */
router.get('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    return successResponse(res, { users, count: users.length });
  } catch (error) {
    next(error);
  }
});

/**
 * Get user by ID
 * GET /api/users/:id
 * Admin or self
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Non-admins can only access their own profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const user = await UserService.getUserById(id);
    return successResponse(res, { user });
  } catch (error) {
    next(error);
  }
});

/**
 * Create new user
 * POST /api/users
 * Admin only
 */
router.post('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    // Validate request body
    const { error } = createUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
      throw error;
    }

    const user = await UserService.createUser(req.body);
    return createdResponse(res, { user }, 'User created successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * Update user
 * PUT /api/users/:id
 * Admin or self (limited fields)
 */
router.put('/:id', authMiddleware, requireUserManagement, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error } = updateUserSchema.validate(req.body, { abortEarly: false });
    if (error) {
      throw error;
    }

    // Non-admins cannot change role or status
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.status;
    }

    const user = await UserService.updateUser(id, req.body);
    return successResponse(res, { user }, 'User updated successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * Delete user
 * DELETE /api/users/:id
 * Admin only
 */
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await UserService.deleteUser(id);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
