'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // AuditLog.belongsTo(models.user);
    }
  }
  AuditLog.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    uuid: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      references: {
        model: {
          tableName: 'users'
        },
        key: 'id'
      },
      allowNull: false,
      type: DataTypes.INTEGER
    },
    auditableType: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    auditableId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    event: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    oldValues: {
      allowNull: true,
      type: DataTypes.JSON
    },
    newValues: {
      allowNull: true,
      type: DataTypes.JSON
    },
    url: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    userAgent: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    ipAddress: {
      allowNull: false,
      type: DataTypes.STRING(50)
    },
    channel: {
      allowNull: false,
      type: DataTypes.ENUM("Web", "Api", "Mobile")
    },
    returnData: {
      allowNull: true,
      type: DataTypes.JSON
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'auditLog',
    paranoid: true,
    timestamps: true
  });
  return AuditLog;
};