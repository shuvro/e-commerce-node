const moment = require('moment');
const config = require('../../config/server');
const bcrypt = require("bcrypt");


module.exports = function(sequelize, DataTypes) {
  // userCredentials.prototype.validPassword = async function(password) {
  //     return await bcrypt.compare(password, this.password);
  // }

  return sequelize.define('Login', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        userid: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'User',
            key: 'id'
          },
          // validate: validations.validate('Organization ID', validations.presets.GUID)
        },
        ip: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        isActive: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        status: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        CreatedBy: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'Admin'
        },

      },

      {
        tableName: 'logins',
        // hasTrigger: true,
        // hooks: {
        //   beforeCreate: async function(user) {
        //       const salt = await bcrypt.genSalt(10); //whatever number you want
        //       user.password = await bcrypt.hash(user.password, salt);
        //   }
        // }
      }
  );
};
