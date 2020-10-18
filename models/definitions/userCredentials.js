const moment = require('moment');
const config = require('../../config/server');
const bcrypt = require("bcrypt");


module.exports = function (sequelize, DataTypes) {
    const userCredentials = sequelize.define('UserCredentials', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                autoIncrement: true
            },
            userId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                references: {
                    model: 'User',
                    key: 'id'
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            activateDatetime: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: function () {
                    return moment().format();
                }
            },
            lostPasswordKey: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            lastPassword: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            requireChangePassword: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            resetPasswordToken: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            createdBy: {
                type: DataTypes.STRING,
                allowNull: false
            },
            apiKey: {
                type: DataTypes.STRING,
                allowNull: true
            },
            apiSecret: {
                type: DataTypes.STRING,
                allowNull: true
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
            }
        },

        {
            tableName: 'userCredentials',
            hasTrigger: true,
            hooks: {
                beforeCreate: async function (user) {
                    const salt = await bcrypt.genSalt(10); //whatever number you want
                    const salt2 = await bcrypt.genSalt(5);
                    const salt3 = await bcrypt.genSalt(12);

                    user.password = await bcrypt.hash(user.password, salt);

                    var current_date = (new Date()).valueOf().toString();
                    var random = Math.random().toString();

                    user.apiKey = await bcrypt.hash(current_date + random, salt2);
                    user.apiSecret = await bcrypt.hash(current_date + random, salt3);

                }
            }
        }
    );

    userCredentials.prototype.validPassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    userCredentials.prototype.updatePassword = async function (password) {
        console.log('userCredentials.prototype.updatePassword', password)
        const salt = await bcrypt.genSalt(10); //whatever number you want
        return await bcrypt.hash(password, salt);
    };

    return userCredentials;
};
