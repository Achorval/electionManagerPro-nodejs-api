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
     await queryInterface.bulkInsert('Countries', [{
      uuid: Uuid.v4(),
      name: 'Nigeria',
      capital: 'Abuja',
      region: 'West Africa',
      alpha2Code: 'ISO 3166',
      tariff: 0,
      flagUrl: 'Nigerian flag url',
      active: true,
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
    await queryInterface.bulkDelete('Countries', null, {});
  }
};
