const Sequelize = require('sequelize');
const serverCfg = require('./server');
const _ = require('lodash');

const sequelize = new Sequelize(serverCfg.mysqlsvr.database, serverCfg.mysqlsvr.user, serverCfg.mysqlsvr.pass, {
    host: serverCfg.mysqlsvr.host,
    port: serverCfg.mysqlsvr.port,
    dialect: serverCfg.mysqlsvr.dialect,
    define: {
        hooks: {
            beforeBulkUpdate: function (model, options) {
                if (!_.isEmpty(model)) {
                    // console.log('before bulk update');
                    // console.log(model);
                }
            },
            beforeBulkDestroy: function (model) {
                // console.log('delete in bulk');
                // console.log(model);
            },
            beforeCreate: function (model, options) {

            }
        }
    },
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});


var sequelizeModels = {
    sequelize,
    User: sequelize.import('../models/definitions/user'),
    UserCredentials: sequelize.import('../models/definitions/userCredentials'),
    Login: sequelize.import('../models/definitions/login')
};


// sequelizeModels.ProjectOwnered.belongsTo(sequelizeModels.User, {
//     foreignKey: 'userId',
//     sourceKey: 'id'
// });
module.exports = sequelizeModels;

sequelize
    .authenticate()
    .then(() => {
        console.log('MYSQL Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
