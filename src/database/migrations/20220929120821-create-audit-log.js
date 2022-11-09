'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auditLogs', {
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
      userId: {
        references: {
          model: {
            tableName: 'users'
          },
          key: 'id'
        },
        allowNull: false,
        type: Sequelize.INTEGER
      },
      auditableType: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },      
      auditableId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      event: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      oldValues: {
        allowNull: true,
        type: Sequelize.JSON
      },
      newValues: {
        allowNull: true,
        type: Sequelize.JSON
      },
      url: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      userAgent: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      ipAddress: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      channel: {
        allowNull: false,
        type: Sequelize.ENUM("Web", "Api", "Mobile")
      },
      returnData: {
        allowNull: true,
        type: Sequelize.JSON
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
    await queryInterface.dropTable('auditLogs');
  }
};