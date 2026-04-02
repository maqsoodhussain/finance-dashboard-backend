const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FinancialRecord = require('../models/FinancialRecord');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear collections
    await FinancialRecord.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Database cleared');

    // Hash passwords
    const hashPassword = async (pw) => await bcrypt.hash(pw, 10);

    // Create users
    const [adminUser, analystUser, viewerUser] = await Promise.all([
      User.create({
        username: 'admin',
        password: await hashPassword('admin123'),
        role: 'admin',
        status: 'active'
      }),
      User.create({
        username: 'analyst1',
        password: await hashPassword('analyst123'),
        role: 'analyst',
        status: 'active'
      }),
      User.create({
        username: 'viewer1',
        password: await hashPassword('viewer123'),
        role: 'viewer',
        status: 'active'
      })
    ]);
    console.log('👥 Users created:');
    console.log(`   - admin (id: ${adminUser._id})`);
    console.log(`   - analyst1 (id: ${analystUser._id})`);
    console.log(`   - viewer1 (id: ${viewerUser._id})`);

    // Create sample financial records for analyst and admin
    const today = new Date();
    const formatDate = (daysAgo) => {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString().split('T')[0];
    };

    const sampleRecords = [
      // Admin's records (mix of income and expense)
      {
        userId: adminUser._id,
        amount: 5000.00,
        type: 'income',
        category: 'Salary',
        date: formatDate(30),
        description: 'Monthly salary from Acme Corp'
      },
      {
        userId: adminUser._id,
        amount: 1200.50,
        type: 'expense',
        category: 'Rent',
        date: formatDate(25),
        description: 'Monthly rent payment'
      },
      {
        userId: adminUser._id,
        amount: 300.00,
        type: 'expense',
        category: 'Utilities',
        date: formatDate(20),
        description: 'Electric and water bills'
      },
      {
        userId: adminUser._id,
        amount: 150.75,
        type: 'expense',
        category: 'Food',
        date: formatDate(15),
        description: 'Grocery shopping'
      },
      {
        userId: adminUser._id,
        amount: 250.00,
        type: 'income',
        category: 'Freelance',
        date: formatDate(10),
        description: 'Side project completion'
      },

      // Analyst's records
      {
        userId: analystUser._id,
        amount: 3500.00,
        type: 'income',
        category: 'Salary',
        date: formatDate(30),
        description: 'Monthly salary'
      },
      {
        userId: analystUser._id,
        amount: 800.00,
        type: 'expense',
        category: 'Rent',
        date: formatDate(25),
        description: 'Apartment rent'
      },
      {
        userId: analystUser._id,
        amount: 200.00,
        type: 'expense',
        category: 'Transportation',
        date: formatDate(18),
        description: 'Gas and maintenance'
      },
      {
        userId: analystUser._id,
        amount: 150.00,
        type: 'income',
        category: 'Investment',
        date: formatDate(5),
        description: 'Dividend payout'
      },
      {
        userId: analystUser._id,
        amount: 120.30,
        type: 'expense',
        category: 'Food',
        date: formatDate(3),
        description: 'Restaurant dinner'
      },
      {
        userId: analystUser._id,
        amount: 100.00,
        type: 'expense',
        category: 'Entertainment',
        date: formatDate(1),
        description: 'Netflix and Spotify'
      }
    ];

    await FinancialRecord.insertMany(sampleRecords);
    console.log(`📊 Created ${sampleRecords.length} financial records`);

    // Add some data from previous months to show trends
    const lastMonthDate = (monthOffset) => {
      const date = new Date(today);
      date.setMonth(date.getMonth() - monthOffset);
      date.setDate(15);
      return date.toISOString().split('T')[0];
    };

    const lastMonthRecords = [
      {
        userId: adminUser._id,
        amount: 4500.00,
        type: 'income',
        category: 'Salary',
        date: lastMonthDate(1),
        description: 'Previous month salary'
      },
      {
        userId: adminUser._id,
        amount: 1100.00,
        type: 'expense',
        category: 'Rent',
        date: lastMonthDate(1),
        description: 'Previous month rent'
      },
      {
        userId: analystUser._id,
        amount: 3200.00,
        type: 'income',
        category: 'Salary',
        date: lastMonthDate(1),
        description: 'Previous month salary'
      },
      {
        userId: analystUser._id,
        amount: 750.00,
        type: 'expense',
        category: 'Rent',
        date: lastMonthDate(1),
        description: 'Previous month rent'
      }
    ];

    await FinancialRecord.insertMany(lastMonthRecords);
    console.log(`📈 Created ${lastMonthRecords.length} records from previous months for trends`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📋 Test Credentials:');
    console.log('─────────────────────────────────────');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  Role: admin (full access)');
    console.log('');
    console.log('Analyst:');
    console.log('  Username: analyst1');
    console.log('  Password: analyst123');
    console.log('  Role: analyst (can create/update own records)');
    console.log('');
    console.log('Viewer:');
    console.log('  Username: viewer1');
    console.log('  Password: viewer123');
    console.log('  Role: viewer (read-only dashboard)');
    console.log('─────────────────────────────────────');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = { seedDatabase };
