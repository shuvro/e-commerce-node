const moment = require('moment');
const config = require('../../config/server');


module.exports = function (sequelize, DataTypes) {
  return sequelize.define('User', {
          id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
            // validate: validations.validate('Organization ID', validations.presets.GUID)
          },
          organizationId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
            references: {
              model: 'Organization',
              key: 'id'
            },
            // validate: validations.validate('Organization ID', validations.presets.GUID)
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          lastname: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          secondlastname: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          type: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          email: {
            type: DataTypes.STRING,
            allowNull: false
          },
          telephone: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          cellular: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          extension: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
          image: {
            type: DataTypes.STRING,
            allowNull: true
          },
          createdBy: {
            type: DataTypes.STRING,
            allowNull: false
          },
          updatedBy: {
            type: DataTypes.STRING,
            allowNull: true
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: function () {
              return moment().format();
            }
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
          },
          isLocked: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
        },
        {
          tableName: 'user',
          hasTrigger: true,
        }
    );
};
