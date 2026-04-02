const FinancialRecord = require('../models/FinancialRecord');
const User = require('../models/User');

/**
 * Dashboard Service
 * Contains all business logic for dashboard summary calculations
 */
class DashboardService {
  /**
   * Get overall financial summary for a user (or all records if admin)
   */
  static async getSummary(userId, isAdmin = false) {
    // Build query based on permissions
    const query = isAdmin ? {} : { userId };

    const records = await FinancialRecord.find(query).lean();
    const recordsCount = records.length;

    let totalIncome = 0;
    let totalExpenses = 0;

    records.forEach(record => {
      const amount = parseFloat(record.amount);
      if (record.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }
    });

    const netBalance = totalIncome - totalExpenses;

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netBalance: Math.round(netBalance * 100) / 100,
      recordCount: recordsCount
    };
  }

  /**
   * Get totals grouped by category
   */
  static async getCategoryTotals(userId, isAdmin = false) {
    const query = isAdmin ? {} : { userId };

    const records = await FinancialRecord.find(query).lean();

    // Group by category and type
    const categoryMap = {};

    records.forEach(record => {
      const category = record.category;
      const amount = parseFloat(record.amount);
      const type = record.type;

      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          income: 0,
          expense: 0,
          net: 0
        };
      }

      if (type === 'income') {
        categoryMap[category].income += amount;
      } else {
        categoryMap[category].expense += amount;
      }

      categoryMap[category].net = categoryMap[category].income - categoryMap[category].expense;
    });

    // Convert to array and round values
    return Object.values(categoryMap).map(cat => ({
      category: cat.category,
      income: Math.round(cat.income * 100) / 100,
      expense: Math.round(cat.expense * 100) / 100,
      net: Math.round(cat.net * 100) / 100
    })).sort((a, b) => b.net - a.net); // Sort by net descending
  }

  /**
   * Get monthly trends (income vs expense by month)
   */
  static async getMonthlyTrends(userId, isAdmin = false, months = 12) {
    const query = isAdmin ? {} : { userId };

    const records = await FinancialRecord.find(query).lean();

    // Group by year-month
    const monthlyMap = {};

    // Initialize last N months
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = {
        month: key,
        income: 0,
        expense: 0,
        recordCount: 0
      };
    }

    records.forEach(record => {
      const date = new Date(record.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          month: key,
          income: 0,
          expense: 0,
          recordCount: 0
        };
      }

      const amount = parseFloat(record.amount);
      if (record.type === 'income') {
        monthlyMap[key].income += amount;
      } else {
        monthlyMap[key].expense += amount;
      }
      monthlyMap[key].recordCount += 1;
    });

    return Object.values(monthlyMap).map(month => ({
      month: month.month,
      income: Math.round(month.income * 100) / 100,
      expense: Math.round(month.expense * 100) / 100,
      net: Math.round((month.income - month.expense) * 100) / 100,
      recordCount: month.recordCount
    }));
  }

  /**
   * Get recent activity (latest transactions)
   */
  static async getRecentActivity(userId, isAdmin = false, limit = 10) {
    const query = isAdmin ? {} : { userId };

    const records = await FinancialRecord.find(query)
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return records.map(record => ({
      id: record._id,
      amount: parseFloat(record.amount),
      type: record.type,
      category: record.category,
      date: record.date,
      description: record.description,
      user: record.user ? {
        id: record.user._id,
        username: record.user.username
      } : null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));
  }

  /**
   * Get comprehensive dashboard data in a single call
   */
  static async getFullDashboard(userId, isAdmin = false) {
    const [
      summary,
      categoryTotals,
      monthlyTrends,
      recentActivity
    ] = await Promise.all([
      this.getSummary(userId, isAdmin),
      this.getCategoryTotals(userId, isAdmin),
      this.getMonthlyTrends(userId, isAdmin),
      this.getRecentActivity(userId, isAdmin, 10)
    ]);

    return {
      summary,
      categoryTotals,
      monthlyTrends,
      recentActivity
    };
  }
}

module.exports = DashboardService;
