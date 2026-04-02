const FinancialRecord = require('../models/FinancialRecord');
const User = require('../models/User');

class FinancialRecordService {
  /**
   * Get all records with optional filtering
   */
  static async getAllRecords(filters = {}) {
    const { type, category, startDate, endDate, minAmount, maxAmount, userId } = filters;

    const query = {};

    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (userId) query.userId = userId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      query.amount = {};
      if (minAmount !== undefined) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount !== undefined) query.amount.$lte = parseFloat(maxAmount);
    }

    const records = await FinancialRecord.find(query)
      .populate('user', 'username')
      .sort({ date: -1, createdAt: -1 });

    return records;
  }

  /**
   * Get single record by ID
   */
  static async getRecordById(recordId) {
    const record = await FinancialRecord.findById(recordId)
      .populate('user', 'username');

    if (!record) {
      throw {
        message: 'Record not found',
        statusCode: 404
      };
    }

    return record;
  }

  /**
   * Create new financial record
   */
  static async createRecord(userId, recordData) {
    const record = await FinancialRecord.create({
      ...recordData,
      userId
    });

    return this.getRecordById(record._id);
  }

  /**
   * Update financial record
   */
  static async updateRecord(recordId, updateData) {
    const record = await FinancialRecord.findById(recordId);

    if (!record) {
      throw {
        message: 'Record not found',
        statusCode: 404
      };
    }

    // Apply updates
    Object.keys(updateData).forEach(key => {
      record[key] = updateData[key];
    });

    await record.save();

    return this.getRecordById(recordId);
  }

  /**
   * Delete financial record
   */
  static async deleteRecord(recordId) {
    const record = await FinancialRecord.findById(recordId);

    if (!record) {
      throw {
        message: 'Record not found',
        statusCode: 404
      };
    }

    await record.deleteOne();

    return {
      message: 'Record deleted successfully',
      id: recordId
    };
  }
}

module.exports = FinancialRecordService;
