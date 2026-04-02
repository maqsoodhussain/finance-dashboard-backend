const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Never return password in queries by default
  },
  role: {
    type: String,
    enum: {
      values: ['viewer', 'analyst', 'admin'],
      message: 'Role must be one of: viewer, analyst, admin'
    },
    default: 'viewer'
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive'],
      message: 'Status must be one of: active, inactive'
    },
    default: 'active'
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes for faster queries
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
// username field has unique: true which creates an index automatically

// Instance methods
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

userSchema.methods.canWrite = function() {
  return this.role === 'analyst' || this.role === 'admin';
};

userSchema.methods.canManageUsers = function() {
  return this.role === 'admin';
};

// Pre-save middleware to hash password (only on changes to password field)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output (override toJSON)
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
