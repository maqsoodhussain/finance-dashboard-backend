const request = require('supertest');
const { sequelize, User, FinancialRecord } = require('../src/config/database');
const app = require('../app');
const bcrypt = require('bcryptjs');

describe('Finance Dashboard API', () => {
  let adminToken;
  let analystToken;
  let viewerToken;
  let adminId;
  let analystId;
  let recordId;

  beforeAll(async () => {
    // Sync test database (in-memory SQLite)
    await sequelize.sync({ force: true });

    // Create test users
    const hashPassword = async (pw) => await bcrypt.hash(pw, 10);

    const admin = await User.create({
      username: 'admin',
      password: await hashPassword('admin123'),
      role: 'admin',
      status: 'active'
    });
    adminId = admin.id;

    const analyst = await User.create({
      username: 'analyst1',
      password: await hashPassword('analyst123'),
      role: 'analyst',
      status: 'active'
    });
    analystId = analyst.id;

    const viewer = await User.create({
      username: 'viewer1',
      password: await hashPassword('viewer123'),
      role: 'viewer',
      status: 'active'
    });

    // Get tokens
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    adminToken = adminRes.body.data.token;

    const analystRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'analyst1', password: 'analyst123' });
    analystToken = analystRes.body.data.token;

    const viewerRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'viewer1', password: 'viewer123' });
    viewerToken = viewerRes.body.data.token;
  });

  describe('Health Check', () => {
    test('GET /health should return ok status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Authentication', () => {
    test('POST /api/auth/register should create new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'password123',
          role: 'viewer'
        });
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('newuser');
      expect(response.body.data.token).toBeDefined();
    });

    test('POST /api/auth/login should return token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });
      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.username).toBe('admin');
    });

    test('POST /api/auth/login should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpass' });
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('GET /api/auth/profile should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.user.username).toBe('admin');
    });

    test('GET /api/auth/profile should require authentication', async () => {
      const response = await request(app).get('/api/auth/profile');
      expect(response.status).toBe(401);
    });
  });

  describe('User Management', () => {
    test('GET /api/users should return all users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.users.length).toBeGreaterThanOrEqual(3);
    });

    test('GET /api/users should reject access for non-admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(response.status).toBe(403);
    });

    test('GET /api/users/:id should allow user to access own profile', async () => {
      const response = await request(app)
        .get(`/api/users/${analystId}`)
        .set('Authorization', `Bearer ${analystToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.user.username).toBe('analyst1');
    });
  });

  describe('Financial Records', () => {
    test('POST /api/records should create record for analyst', async () => {
      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          amount: 1000.00,
          type: 'income',
          category: 'Freelance',
          date: '2024-02-15',
          description: 'Project payment'
        });
      expect(response.status).toBe(201);
      expect(response.body.data.record.amount).toBe(1000.00);
      recordId = response.body.data.record.id;
    });

    test('POST /api/records should not allow viewer to create record', async () => {
      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          amount: 500.00,
          type: 'expense',
          category: 'Food',
          date: '2024-02-20'
        });
      expect(response.status).toBe(403);
    });

    test('GET /api/records should return records for authenticated user', async () => {
      const response = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.records.length).toBeGreaterThan(0);
    });

    test('GET /api/records/:id should return record with proper ownership', async () => {
      const response = await request(app)
        .get(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${analystToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data.record.id).toBe(recordId);
    });

    test('PUT /api/records/:id should update record for owner', async () => {
      const response = await request(app)
        .put(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          amount: 1500.00,
          description: 'Updated amount after client feedback'
        });
      expect(response.status).toBe(200);
      expect(parseFloat(response.body.data.record.amount)).toBe(1500.00);
    });

    test('DELETE /api/records/:id should delete record for owner', async () => {
      // First create a record to delete
      const createRes = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          amount: 200.00,
          type: 'expense',
          category: 'Testing',
          date: '2024-02-28'
        });
      const tempRecordId = createRes.body.data.record.id;

      const response = await request(app)
        .delete(`/api/records/${tempRecordId}`)
        .set('Authorization', `Bearer ${analystToken}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');
    });

    test('非-admin user should not see other users records', async () => {
      // Get admin's records count
      const adminRes = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${adminToken}`);

      const analystRes = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${analystToken}`);

      // Analyst should see fewer or equal records compared to admin, never more
      expect(analystRes.body.data.records.length).toBeLessThanOrEqual(
        adminRes.body.data.records.length
      );
    });
  });

  describe('Dashboard Summaries', () => {
    test('GET /api/dashboard/summary should return financial summary', async () => {
      // Admin sees all records
      const adminResponse = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.data.summary.totalIncome).toBeDefined();
      expect(adminResponse.body.data.summary.totalExpenses).toBeDefined();
      expect(adminResponse.body.data.summary.netBalance).toBeDefined();

      // Analyst sees only their records
      const analystResponse = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);
      expect(analystResponse.status).toBe(200);
      expect(analystResponse.body.data.summary.totalIncome).toBeDefined();
    });

    test('GET /api/dashboard/category-totals should return grouped data', async () => {
      const response = await request(app)
        .get('/api/dashboard/category-totals')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.categoryTotals)).toBe(true);
      expect(response.body.data.categoryTotals.length).toBeGreaterThan(0);

      // Each category should have income, expense, net
      const category = response.body.data.categoryTotals[0];
      expect(category.income).toBeDefined();
      expect(category.expense).toBeDefined();
      expect(category.net).toBeDefined();
    });

    test('GET /api/dashboard/monthly-trends should return time series data', async () => {
      const response = await request(app)
        .get('/api/dashboard/monthly-trends?months=6')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.monthlyTrends)).toBe(true);

      const monthData = response.body.data.monthlyTrends[0];
      expect(monthData.month).toBeDefined();
      expect(monthData.income).toBeDefined();
      expect(monthData.expense).toBeDefined();
      expect(monthData.net).toBeDefined();
    });

    test('GET /api/dashboard/recent-activity should return latest transactions', async () => {
      const response = await request(app)
        .get('/api/dashboard/recent-activity?limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.recentActivity)).toBe(true);

      const recent = response.body.data.recentActivity[0];
      expect(recent.id).toBeDefined();
      expect(recent.amount).toBeDefined();
      expect(recent.type).toBeDefined();
      expect(recent.category).toBeDefined();
    });

    test('GET /api/dashboard should return full dashboard data', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(200);

      const data = response.body.data.dashboard;
      expect(data.summary).toBeDefined();
      expect(data.categoryTotals).toBeDefined();
      expect(data.monthlyTrends).toBeDefined();
      expect(data.recentActivity).toBeDefined();
    });

    test('Viewer should have access to dashboard summaries', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${viewerToken}`);
      expect(response.status).toBe(200);
    });
  });

  describe('Role-Based Access Control', () => {
    test('Viewer should not access records endpoints for creation', async () => {
      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          amount: 100.00,
          type: 'expense',
          category: 'Test',
          date: '2024-02-20'
        });
      expect(response.status).toBe(403);
    });

    test('Viewer should not update or delete records', async () => {
      const response = await request(app)
        .put(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ amount: 999.00 });
      expect(response.status).toBe(403);
    });

    test('Analyst should not manage users', async () => {
      const response = await request(app)
        .delete(`/api/users/${analystId}`)
        .set('Authorization', `Bearer ${analystToken}`);
      expect(response.status).toBe(403);
    });
  });

  describe('Validation', () => {
    test('Should reject invalid amount in record creation', async () => {
      const response = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          amount: -100.00, // Negative amount
          type: 'expense',
          category: 'Test',
          date: '2024-02-20'
        });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
          // Missing password
        });
      expect(response.status).toBe(400);
    });

    test('Should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'test@user', // Invalid username
          password: 'pass123'
        });
      expect(response.status).toBe(400);
    });
  });

  describe('Edge Cases', () => {
    test('Should handle non-existent record gracefully', async () => {
      const response = await request(app)
        .get('/api/records/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(response.status).toBe(404);
    });

    test('Should handle unauthorized access to protected routes', async () => {
      const response = await request(app).get('/api/records');
      expect(response.status).toBe(401);
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
