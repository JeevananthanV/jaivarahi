// Migration: Add date_of_birth column to admin_users table
// Run: node -e "require('./pool.js').then(p => p.execute('ALTER TABLE admin_users ADD COLUMN date_of_birth DATE')).then(() => console.log('Done')).catch(console.error)"

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('admin_users', 'date_of_birth', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    console.log('✅ date_of_birth column added to admin_users');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('admin_users', 'date_of_birth');
    console.log('🗑️ date_of_birth column removed from admin_users');
  },
};