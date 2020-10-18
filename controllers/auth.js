const database = require('../config/database');
const server = require('../config/server');
const bcrypt = require("bcrypt");
const orgDB = require('../models/organizations');
const userDB = require('../models/users');
const projectsDB = require('../models/projects');
const emailUtils = require('../utils/email-utils');

const getIpAddressFromRequest = (request) => {
    let ipAddr = request.connection.remoteAddress;

    if (request.headers && request.headers['x-forwarded-for']) {
        [ipAddr] = request.headers['x-forwarded-for'].split(',');
    }

    return ipAddr;
};

const getLogin = function (req, res) {

    if (req.session.userId) {
        return res.redirect('/dashboard');
    }

    const err = (req.query.err);
    let errMessage = '';
    if (err)
        errMessage = Buffer.from(err, 'base64').toString('ascii');

    const success = (req.query.successToken);
    let successMessage = '';
    if (success)
        successMessage = Buffer.from(success, 'base64').toString('ascii');

    res.render('login', {
        layout: false,
        hasError: err,
        hasSuccess: success,
        errMessage: errMessage,
        successMessage: successMessage
    });
};

const login = async function (req, res) {
    let ip = getIpAddressFromRequest(req);

    let email = req.body.email;
    let password = req.body.password;
    try {
        let user = await database.User.findOne({where: {email: email}});
        if (!user) {
            console.log('invalid user')
            let rst = Buffer.from('El usuario no existe en el sistema').toString('base64')
            res.redirect('/?err=' + rst);
        } else {
            if (user.isLocked === 1) {
                console.log('user is blocked from the system')
                let rst = Buffer.from('You have been blocked by the Administrator. Please contact your Admin to reactivate the account').toString('base64')
                res.redirect('/?err=' + rst);
            }
        }

        let userCredentials = await database.UserCredentials.findOne({where: {userId: user.id}})

        if (!userCredentials) {
            console.log('invalid user credentials')
            let rst = Buffer.from('Password incorrecto').toString('base64')
            res.redirect('/?err=' + rst);
        }

        let validpassword = await userCredentials.validPassword(password);

        if (!validpassword) {
            try {
                let login = await database.Login.create({
                    userid: user.id,
                    ip: ip,
                    status: 'FAILED',
                    isActive: 0
                });

            } catch (e) {
                console.log('err user login failed', e)
            }
            let rst = Buffer.from('Password incorrecto').toString('base64')
            res.redirect('/?err=' + rst);
        } else {
            try {
                let invalidateAllSession = await database.Login.update({
                    isActive: 0
                }, {where: {userid: user.id, isActive: 1}, individualHooks: true, context: req.session});
                let login = await database.Login.create({
                    userid: user.id,
                    ip: ip,
                    status: 'Success',
                    isActive: 1
                });
                let projects = '';
                let orgs = '';
                try {
                    projects = await projectsDB.getFormOwneredByUser(user.id);
                    orgs = await orgDB.getOrgById(user.organizationId);
                    // console.log('orgs',orgs)
                } catch (e) {
                    console.log(e)
                }
                // console.log('userCredentials',userCredentials)
                req.brute.reset(function () {
                    req.session.userId = user.id;
                    req.session.email = user.email;
                    req.session.name = user.name;
                    req.session.usertype = user.type;
                    req.session.userorg = user.organizationId;
                    req.session.fullname = user.name + ' ' + user.lastname;
                    req.session.requireChangePassword = userCredentials.requireChangePassword
                    req.session.orgname = orgs[0].name;
                    req.session.orgHasBranding = (orgs[0].hasBranding == 1) ? true : false;
                    req.session.orgLogo = orgs[0].logo;

                    req.session.projectsOwnered = projects;
                    req.session.loginSequence = login.id;
                    // req.capabilities = capabilities;

                    let redir = '';

                    // TODO - Hacer una funcion que redirecciones al componente principal
                    // switch(user.type){
                    //     case 'cableticaAdmin':
                    //         redir = '/dashboard/cabletica/contratos'
                    //         break;
                    //     case 'contracargosAdmin':
                    //     case 'contracargosOperator':
                    //         redir = '/dashboard/promerica/contracargos'
                    //         break;
                    //     case 'cicAdmin':
                    //         redir = '/dashboard/its/cic'
                    //         break;
                    //     case 'csAdmin':
                    //         redir = '/dashboard/its/cic'
                    //         break;
                    //     case 'carisadmin':
                    //     case 'superAdmin':
                    //         redir = '/dashboard'
                    //         break;
                    //     default:
                    //         redir = '/404'
                    //         break;
                    // }
                    redir = `/dashboard/${user.organizationId}/project`;
                    res.redirect(redir);
                });

            } catch (e) {
                console.log('err user login', e)
            }

        }
    } catch (e) {
        console.log('e', e)
    }
};

const logout = async function (req, res) {
    if (req.session) {
        // delete session object
        await database.Login.update({
            isActive: 0,
        }, {
            where: {id: req.session.loginSequence, userid: req.session.userId},
            individualHooks: true,
            context: req.session
        });
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
};


const changePassword = async function (req, res) {
    var password = req.body.password;
    if (!password) {
        // return res.redirect('/');
    }
    try {


        const salt = await bcrypt.genSalt(10); //whatever number you want
        const pwd = await bcrypt.hash(password, salt);

        let updatePwd = await database.UserCredentials.update({
            password: pwd,
            requireChangePassword: 0
        }, {where: {userId: req.session.userId}, individualHooks: true, context: req.session});

        req.session.requireChangePassword = 0;
        res.redirect('/dashboard');

    } catch (e) {
        console.log(e)
    }

};

const violationAccess = async (req, res) => {
    const _org = await orgDB.getOrgById(req.session.userorg);
    return _org[0].name === req.params.org;
};

const userAccessPermissions = async (req, res) => {
    return await userDB.getComponentPermission({role: req.session.usertype, component: "reports"})
};

const sendResetToken = async function (req, res) {
    let body = req.body;
    let reqSession = req.session;
    try {
        let existingEmail = body.email;
        let getUserDetailsByEmail = await userDB.getUserDetailByEmail(existingEmail);
        if (getUserDetailsByEmail.dataValues.id) {
            const salt = await bcrypt.genSalt(10);
            const resetToken = await bcrypt.hash(existingEmail, salt);
            let addTokenToUser = await userDB.addTokenToUser(getUserDetailsByEmail.id, resetToken, reqSession);
            if (addTokenToUser) {
                let serverUrl = process.env.SERVER_URL;
                let subject = "Reset Password - Hubex";
                let body = `Hello, <br> We have received your reset password request. Please use the following link to reset your password. <br>` +
                    `<a href='${serverUrl}/reset-password/?resetToken=${resetToken}&userId=${getUserDetailsByEmail.id}' target='_blank'>RESET PASSWORD</a> <br>` +
                    `Thanks & Regards, <br>` +
                    `<b>HUBEX TEAM</b><br>`;
                let emailResponse = await emailUtils.sendEmail(existingEmail, subject, body);
                if (emailResponse[0].statusCode >= 200 || emailResponse[0].statusCode <= 204) {
                    let rst = Buffer.from('An email with a password recovery link has been sent to your associated email. Please follow the instruction and reset your password from there. Thank You').toString('base64');
                    res.redirect('/?successToken=' + rst);
                }
            }
        } else {
            let rst = Buffer.from('No user exists in the system by this email').toString('base64');
            res.redirect('/?err=' + rst);
        }
    } catch (e) {
        console.log(e);
        let rst = Buffer.from('Technical Error. Please try again later.').toString('base64');
        res.redirect('/?err=' + rst);
    }
};
const resetPasswordForm = function (req, res) {
    let resetToken = req.query.resetToken;
    let userId = req.query.userId;
    try {
        let checkIfResetTokenAndUserIdValid = userDB.checkIfResetTokenAndUserIdValid(userId, resetToken);
        if (checkIfResetTokenAndUserIdValid) {
            let initialInfo = {userId: userId, resetToken: resetToken};
            res.render('reset', {
                initialInfo: initialInfo,
                action: 'update',
                method: 'post',
            });
        } else {
            let rst = Buffer.from('Invalid Reset Token').toString('base64');
            res.redirect('/?err=' + rst);
        }
    } catch (e) {
        let rst = Buffer.from('Technical Error. Try with valid Reset Token again.').toString('base64');
        res.redirect('/?err=' + rst);
    }
};
const resetPassword = async function (req, res) {
    let resetToken = req.body.resetToken;
    let userId = req.body.userId;
    let newPassword = req.body.password;
    try {
        let userCredentials = await database.UserCredentials.findOne({
            where: {
                userId: userId,
                resetPasswordToken: resetToken
            }
        });
        if (userCredentials.dataValues.id) {
            try {
                let updatedPassword = await userCredentials.updatePassword(newPassword);
                let status = await database.UserCredentials.update({
                    password: updatedPassword,
                }, {
                    where: {userId: userId, resetPasswordToken: resetToken},
                    individualHooks: true,
                    context: req.session
                });
                if (status) {
                    let removeOldToken = await database.UserCredentials.update({
                        resetPasswordToken: null,
                    }, {where: {userId: userId}, individualHooks: true, context: req.session});
                    if (removeOldToken) {
                        let rst = Buffer.from('Password Updated Successfully. Please login to continue').toString('base64');
                        res.redirect('/?successToken=' + rst);
                    }
                } else {
                    let rst = Buffer.from('Password Update Failed. Try again.').toString('base64');
                    res.redirect('/?err=' + rst);
                }
            } catch (e) {
                let rst = Buffer.from('Password Update Failed. Request Again for new Reset Token.').toString('base64');
                res.redirect('/?err=' + rst);
            }
        } else {
            let rst = Buffer.from('Invalid Reset Token Or User').toString('base64');
            res.redirect('/?err=' + rst);
        }
    } catch (e) {
        let rst = Buffer.from('Password Update Failed. Request Again for new Reset Token.').toString('base64');
        res.redirect('/?err=' + rst);
    }
};
const checkIfSingleSessionValid = async function (req, res) {
    let userId = req.session.userId;
    let loginSequence = req.session.loginSequence;
    try {
        let data;
        let sessionStatus = await database.Login.findOne({where: {userId: userId, id: loginSequence, isActive: 1}});
        if(sessionStatus) {
            data = {
                success: true,
                message: "Session is valid.",
            };
            return res.json(data);
        } else {
            data = {
                success: false,
                message: "Login in from another device is detected.. Your session is ended.",
            };
            return res.json(data);
        }
    } catch (e) {
        console.log('e', e);
        let data = {
            success: false,
            message: "Technical Error",
            error: e
        };
        res.json({data: data})
    }
};
module.exports = {
    getLogin: getLogin,
    login: login,
    logout: logout,
    changePassword: changePassword,
    violationAccess: violationAccess,
    userAccessPermissions: userAccessPermissions,
    sendResetToken: sendResetToken,
    resetPasswordForm: resetPasswordForm,
    resetPassword: resetPassword,
    checkIfSingleSessionValid: checkIfSingleSessionValid
};
