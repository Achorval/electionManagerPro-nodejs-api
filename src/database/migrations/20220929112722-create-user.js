'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      firstName: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      lastName: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      userName: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(100)
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(100)
      },
      phone: {
        unique: true,
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      roleId: {
        references: {
          model: {
            tableName: 'roles'
          },
          key: 'id'
        },
        allowNull: false,
        type: Sequelize.INTEGER
      },
      blocked: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      blockedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      blockedReason: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};