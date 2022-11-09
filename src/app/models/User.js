'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
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
    firstName: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    lastName: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    userName: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING(100)
    },
    email: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING(100)
    },
    phone: {
      unique: true,
      allowNull: false,
      type: DataTypes.STRING(20)
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING(100)
    },
    roleId: {
      references: {
        model: {
          tableName: 'roles'
        },
        key: 'id'
      },
      allowNull: false,
      type: DataTypes.INTEGER
    },
    blocked: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
    blockedAt: {
      allowNull: true,
      type: DataTypes.DATE
    },
    blockedReason: {
      allowNull: false,
      type: DataTypes.TEXT
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
    modelName: 'user',
    paranoid: true,
    timestamps: true
  });
  return User;
};