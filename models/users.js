const _ = require('lodash');
const mongoose = require('mongoose');
const mongodb = require('../config/mongoserver');
const path = require('path');
const moment = require('moment');
const database = require('../config/database');
const server = require('../config/server');
const Sequelize = require('sequelize');
const ApiHelper = require('../bin/helpers/api-helper');

const getUserList = async function (org, raw) {

    var args = {};
    args.include = [database.Organization, database.Roles];
    // args.attributes = [Sequelize.fn('date_format', Sequelize.col('User.createdAt'), '%d %b %y'), 'User.createdAt']

    if (org) {
        args.where = {organizationId: org};
    }
    if (raw) {
        args.raw = true;
    }

    return database.User.findAll(args)
}


const getUserDetailsById = async function (id) {
    var args = {};
    args.raw = true;
    args.where = {id: id};

    return database.User.findOne(args)
}


const getEntitlements = (role) => {
    const args = {};
    args.raw = true;
    args.where = {role: role};
    args.include = [{
        model: database.Components,
        attributes: ['name']
    }];
    return database.Entitlements.findAll(args);

};

const getRoleById = roleId => {
    var args = {};
    args.raw = true;
    args.where = {id: roleId};


    return database.Roles.findAll(args)
};

const getEntitlement = (role, component) => {
    var args = {};
    args.raw = true;
    args.where = {role: role, component};
    return database.Entitlements.findOne(args)
};

const getComponentPermission = (obj) => {
    var args = {};
    args.where = {role: obj.role, component: obj.component};

    return database.Entitlements.count(args)
};

const checkIfEmailAlreadyExists = function (email) {
    let args = {};
    args.where = {email: email};
    return database.User.count(args);
};

const getUserDetailByEmail = function (email) {
    let args = {};
    args.where = {email: email};
    return database.User.findOne(args);
};

const addTokenToUser = function (userId, resetToken, reqSession = null) {
    let args = {};
    let data = {resetPasswordToken: resetToken};
    args.where = {userId: userId};
    args.individualHooks = true;
    args.context = reqSession;
    return database.UserCredentials.update(data, args);
};
const checkIfResetTokenAndUserIdValid = function (userId, resetToken) {
    let args = {};
    args.where = {resetPasswordToken: resetToken, userId: userId};
    return database.UserCredentials.count(args);
};
module.exports = {
    getUserList: getUserList,
    getUserDetailsById: getUserDetailsById,
    getEntitlements: getEntitlements,
    getComponentPermission: getComponentPermission,
    getEntitlement: getEntitlement,
    getRoleById: getRoleById,
    checkIfEmailAlreadyExists: checkIfEmailAlreadyExists,
    getUserDetailByEmail: getUserDetailByEmail,
    addTokenToUser: addTokenToUser,
    checkIfResetTokenAndUserIdValid: checkIfResetTokenAndUserIdValid
};
