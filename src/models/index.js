const User = require('./User');
const FinancialRecord = require('./FinancialRecord');

// Define associations
User.hasMany(FinancialRecord, {
  foreignKey: 'userId',
  as: 'records',
  onDelete: 'CASCADE'
});

FinancialRecord.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  User,
  FinancialRecord
};
