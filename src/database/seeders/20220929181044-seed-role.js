const Uuid = require('uuid');
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */    
    await queryInterface.bulkInsert('Roles', [{
      uuid: Uuid.v4(),
      name: 'Admin',
      description: 'System Administrator',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    },
    {
      uuid: Uuid.v4(),
      name: 'User',
      description: 'System Users',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    }], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
