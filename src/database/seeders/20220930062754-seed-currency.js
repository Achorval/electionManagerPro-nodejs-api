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
     await queryInterface.bulkInsert('Currencies', [{
      uuid: Uuid.v4(),
      countryId: 1,
      name: 'Naira',
      iso: 'NGN',
      symbolUrl: 'naira symbol url',
      type: 'Fiat',
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
     await queryInterface.bulkDelete('Currencies', null, {});
  }
};
