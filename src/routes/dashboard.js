const express = require('express');
const router = express.Router();

const DashboardService = require('../services/dashboard');
const authMiddleware = require('../middleware/auth');
const { successResponse } = require('../utils/response');

/**
 * Get overall financial summary
 * GET /api/dashboard/summary
 * Requires authentication
 */
router.get('/summary', authMiddleware, async (req, res, next) => {
  try {
    const summary = await DashboardService.getSummary(req.user._id, req.user.isAdmin());
    return successResponse(res, { summary });
  } catch (error) {
    next(error);
  }
});

/**
 * Get category-wise totals
 * GET /api/dashboard/category-totals
 * Requires authentication
 */
router.get('/category-totals', authMiddleware, async (req, res, next) => {
  try {
    const categoryTotals = await DashboardService.getCategoryTotals(req.user._id, req.user.isAdmin());
    return successResponse(res, { categoryTotals });
  } catch (error) {
    next(error);
  }
});

/**
 * Get monthly trends
 * GET /api/dashboard/monthly-trends?months=12
 * Requires authentication
 */
router.get('/monthly-trends', authMiddleware, async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const monthlyTrends = await DashboardService.getMonthlyTrends(req.user._id, req.user.isAdmin(), months);
    return successResponse(res, { monthlyTrends });
  } catch (error) {
    next(error);
  }
});

/**
 * Get recent activity
 * GET /api/dashboard/recent-activity?limit=10
 * Requires authentication
 */
router.get('/recent-activity', authMiddleware, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recentActivity = await DashboardService.getRecentActivity(req.user._id, req.user.isAdmin(), limit);
    return successResponse(res, { recentActivity });
  } catch (error) {
    next(error);
  }
});

/**
 * Get full dashboard data
 * GET /api/dashboard
 * Requires authentication
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const dashboard = await DashboardService.getFullDashboard(req.user._id, req.user.isAdmin());
    return successResponse(res, { dashboard });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
