const express = require('express');
const router = express.Router();

const { registerSchema, loginSchema, updateProfileSchema } = require('../validators/auth');
const AuthService = require('../services/auth');
const authMiddleware = require('../middleware/auth');
const { successResponse, createdResponse } = require('../utils/response');

/**
 * Register new user
 * POST /api/auth/register
 * Public endpoint
 */
router.post('/register', async (req, res, next) => {
  try {
    // Validate request body
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      throw error;
    }

    const result = await AuthService.register(req.body);
    return createdResponse(res, result, 'User registered successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * Login user
 * POST /api/auth/login
 * Public endpoint
 */
router.post('/login', async (req, res, next) => {
  try {
    // Validate request body
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      throw error;
    }

    const result = await AuthService.login(req.body.username, req.body.password);
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
});

/**
 * Get current user profile
 * GET /api/auth/profile
 * Requires authentication
 */
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const user = await AuthService.getProfile(req.user._id);
    return successResponse(res, { user });
  } catch (error) {
    next(error);
  }
});

/**
 * Update current user profile
 * PUT /api/auth/profile
 * Requires authentication
 */
router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    // Validate request body
    const { error } = updateProfileSchema.validate(req.body, { abortEarly: false });
    if (error) {
      throw error;
    }

    // Prevent role change via profile endpoint (admin only)
    if (req.body.role) {
      delete req.body.role;
    }

    const user = await AuthService.updateProfile(req.user._id, req.body);
    return successResponse(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
