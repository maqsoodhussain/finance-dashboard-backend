const mongoose = require('mongoose');

const financialRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    get: function(value) {
      // Return as fixed 2 decimal places
      return Number(value.toFixed(2));
    }
  },
  type: {
    type: String,
    enum: {
      values: ['income', 'expense'],
      message: 'Type must be either income or expense'
    },
    required: [true, 'Type is required'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters'],
    index: true
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  }
}, {
  timestamps: true,
  collection: 'financial_records',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
financialRecordSchema.index({ userId: 1, date: -1 });
financialRecordSchema.index({ date: -1 });
// type and category have index: true in schema definition

// Virtual for net amount (negative for expense)
financialRecordSchema.virtual('signedAmount').get(function() {
  return this.type === 'expense' ? -this.amount : this.amount;
});

module.exports = mongoose.model('FinancialRecord', financialRecordSchema);
