const User = require('../models/User');

class UserService {
  /**
   * Get all users (admin only)
   */
  static async getAllUsers() {
    const users = await User.find({}).select('-password');
    return users;
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw {
        message: 'User not found',
        statusCode: 404
      };
    }

    return user;
  }

  /**
   * Create user (admin only)
   */
  static async createUser(userData) {
    // Password will be hashed by pre-save middleware
    const user = await User.create(userData);

    return user;
  }

  /**
   * Update user
   */
  static async updateUser(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) {
      throw {
        message: 'User not found',
        statusCode: 404
      };
    }

    // If password provided, it will be hashed by pre-save middleware
    if (updateData.password) {
      user.password = updateData.password;
    }

    // Apply updates
    Object.keys(updateData).forEach(key => {
      if (key !== 'password') { // password already handled
        user[key] = updateData[key];
      }
    });

    await user.save();

    return user;
  }

  /**
   * Delete user
   */
  static async deleteUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw {
        message: 'User not found',
        statusCode: 404
      };
    }

    await user.deleteOne();

    return {
      message: 'User deleted successfully',
      id: userId
    };
  }
}

module.exports = UserService;
