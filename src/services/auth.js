const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  /**
   * Register a new user
   */
  static async register(userData) {
    // Check if username already exists
    const existingUser = await User.findOne({ username: userData.username });

    if (existingUser) {
      throw {
        message: 'Username already exists',
        statusCode: 409
      };
    }

    // Create user (password automatically hashed by pre-save middleware)
    const user = await User.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return {
      user,
      token
    };
  }

  /**
   * Login user
   */
  static async login(username, password) {
    // Find user with password included
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      throw {
        message: 'Invalid credentials',
        statusCode: 401
      };
    }

    if (user.status !== 'active') {
      throw {
        message: 'Account is inactive',
        statusCode: 403
      };
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw {
        message: 'Invalid credentials',
        statusCode: 401
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return {
      user,
      token
    };
  }

  /**
   * Get user profile
   */
  static async getProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw {
        message: 'User not found',
        statusCode: 404
      };
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) {
      throw {
        message: 'User not found',
        statusCode: 404
      };
    }

    // If password is provided, it will be hashed by pre-save middleware
    // Set password field to update it
    if (updateData.password) {
      user.password = updateData.password;
    }

    await user.save();

    return user;
  }
}

module.exports = AuthService;
