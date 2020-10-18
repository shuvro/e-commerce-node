const express = require('express');
const router = express.Router();
const dashboard = require('../controllers/dashboard');
const reports = require('../controllers/reports');
const auth = require('../controllers/auth');
const projects = require('../controllers/projects');
const kyc = require('../controllers/kyc');
const contracargos = require('../controllers/contracargos');
const evicertia = require('../controllers/evicertia');
const cabletica = require('../controllers/cabletica');
const dashboardKYC = require('../controllers/kyc/dashboard');
const dashboardKYB = require('../controllers/kyb/tuidentidad');
const cic = require('../controllers/cic');
const apiV1 = require('../controllers/apiv1');
const multer = require('multer')
const path = require('path');
const moment = require('moment');
moment.locale('es');
const methodValidator = require('../validator/methodValidator');
const userDB = require('../models/users');
const _ = require('lodash');
const authUtils = require('../utils/auth-utils');
const ExpressBrute = require("express-brute");
const MongooseStore = require("express-brute-mongoose");
const BruteForceSchema = require("express-brute-mongoose/dist/schema");
const mongoose = require("mongoose");
const disputes = require("../controllers/disputes")
const fs = require('fs');
const ApiHelper = require('../bin/helpers/api-helper');
const garantias = require('../controllers/garantias');

const model = mongoose.model(
    "bruteforce",
    new mongoose.Schema(BruteForceSchema)
);
const store = new MongooseStore(model);

const KYC = require('../controllers/kyc/index');

var failCallback = function (req, res, next, nextValidRequestDate) {
    const msg = "Ha excedido el numero de intentos, pruebe de nuevo " + moment(nextValidRequestDate).fromNow();
    const rst = Buffer.from(msg).toString('base64')
    res.redirect('/?err=' + rst); // brute force protection triggered, send them back to the login page
};
var handleStoreError = function (error) {
    console.log(error); // log this error so we can figure out what went wrong
    // cause node to exit, hopefully restarting the process fixes the problem
}

// Start slowing requests after 5 failed attempts to do something for the same user
var userBruteforce = new ExpressBrute(store, {
    freeRetries: 3,
    minWait: 10 * 60 * 1000, // 5 minutes
    maxWait: 10 * 60 * 1000, // 1 hour,
    failCallback: failCallback,
    handleStoreError: handleStoreError
});

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.redirect('/?err=invalid-login');
    }
}

function requiresEntitlement(componentName, accessType) {
    return async function (req, res, next) {
        let getRoleById = await userDB.getRoleById(req.session.usertype).catch(err => res.json({
            error: err,
            msg: "getRoleById>getIndex"
        }));
        if (getRoleById) {
            let getEntitlements = await userDB.getEntitlements(getRoleById[0].id).catch(err => res.json({
                error: err,
                msg: "getEntitlements>getIndex"
            }));

            let canSeeThisPage = _.find(getEntitlements, {
                'role': getRoleById[0].id,
                'Component.name': componentName,
                [accessType]: 1
            });

            if (!canSeeThisPage) {
                return res.redirect('/404?err=violation-access') //TODO mover a un 401 de hubex
            } else {
                req.entitlements = authUtils.setEntitlements(getEntitlements);
                req.activeRole = getRoleById;
                return next();
            }
        } else {
            res.json({error: "Role is not found"});
        }
    };
}

async function validateViolationAccess(req, res, next) {
    //check for access
    const access = await auth.violationAccess(req, res);
    console.log('access', access)
    if (access) {
        return next();
    } else {
        return res.redirect('/404?err=violation-access');
    }
}

async function userAccessPermissions(req, res, next) {
    //check for access

    var canSeeThisPage = auth.userAccessPermissions(req, res);

    if (!canSeeThisPage) {
        return res.redirect('/') //TODO mover a un 401 de hubex
    } else {
        return next();
    }

}

const routes = function (app, csrfProtection, __basedir) {

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __basedir + '/public/uploads/contracargos'); // Absolute path. Folder must exist, will not be created for you.
        },
        filename: function (req, file, cb) {
            console.log('file', file)
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    })

    var storageCC = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __basedir + '/public/uploads/cabletica'); // Absolute path. Folder must exist, will not be created for you.
        },
        filename: function (req, file, cb) {
            console.log('file', file)
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    })

    var storageCIC = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __basedir + '/public/uploads/cic/'); // Absolute path. Folder must exist, will not be created for you.
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    })
    let storageUser = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __basedir + '/public/uploads/users/'); // Absolute path. Folder must exist, will not be created for you.
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });

    let storageProjectLogo = multer.diskStorage({
        destination: function (req, file, cb) {
            let projectId = req.body.projectId;
            const dir = __basedir + `/public/uploads/${projectId}/`;
            fs.exists(dir, exist => {
                if (!exist) {
                    return fs.mkdir(dir,{recursive: true},error => cb(error, dir))
                }
                return cb(null, dir)
            });
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });
    let storageOrganizationLogo = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __basedir + '/public/uploads/organization/'); // Absolute path. Folder must exist, will not be created for you.
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });

    let upload = multer({storage: storage});
    let uploadCC = multer({storage: storageCC});
    let uploadCIC = multer({storage: storageCIC});
    let uploadUser = multer({storage: storageUser});
    let uploadProjectLogo = multer({storage: storageProjectLogo});
    let uploadOrgLogo = multer({storage: storageOrganizationLogo})

    app.get('/', auth.getLogin);
    app.get('/dashboard', requiresLogin, dashboard.getIndex);
    app.post('/dashboard/login',
        userBruteforce.getMiddleware({
            key: function (req, res, next) {
                next(req.body.email);
            }
        })
        , auth.login);
    app.post('/forgot-password', auth.sendResetToken);
    app.get('/reset-password', auth.resetPasswordForm);
    app.post('/reset-password', auth.resetPassword);
    app.get('/checkLoginValidity', requiresLogin, auth.checkIfSingleSessionValid);


    /* ------------ API  Routes  -----------------------------------------*/
    app.post('/api/createuser', dashboard.createuser);
    app.get('/api/contracargos/form/:id', contracargos.getform);
    app.post('/api/contracargos/updateOwner', contracargos.updateOwnerAPI);
    app.post('/api/contracargos/saveRejectReason', contracargos.updateDetailsAPI);
    app.post('/api/contracargos/reject', contracargos.rejectAPI);
    app.post('/api/contracargos/aprove', contracargos.approvedAPI);
    app.post('/api/contracargos/reopen', contracargos.reopenAPI);
    app.post('/api/contracargos/finish', contracargos.finishAPI);
    app.get('/api/roles/:orgId', apiV1.getRolesByOrgId);


    app.get('/api/cabletica/form/:id', cabletica.getform);
    app.get('/api/cic/form/:id', cic.getform);

    app.post('/api/v1/:company/:project/uniqueUrl', ApiHelper.basicAuth, apiV1.createUniqueUrl);

    /* ------------ Cabletica  Routes  -----------------------------------------*/
    app.get('/dashboard/cabletica/contratos', requiresLogin, cabletica.getDashboard);

    /* ------------ CIC  Routes  -----------------------------------------*/
    app.get('/dashboard/its/cic', requiresLogin, cic.getDashboard);

    /* ------------ KYC  Routes  -----------------------------------------*/
    app.get('/dashboard/:orgid/project', requiresLogin, requiresEntitlement("dashboard", 'hasView'), dashboard.getIndex);
    app.get('/kyc/:orgid/:projectid/list', requiresLogin, requiresEntitlement("process", 'hasView'), dashboardKYC.getKYCDashboard);
    app.get('/kyc/:orgid/:projectid/list/:status', requiresLogin, requiresEntitlement("process", 'hasView'), dashboardKYC.getKYCDashboard);
    // app.get('/kyc/:orgid/:projectid/:customerId/view', requiresLogin, requiresEntitlement("kyc", 'hasView'), dashboardKYC.getKYCCustomer);
    app.get('/kyc/:orgid/:projectid/:customerId/:idNumber/view', requiresLogin, requiresEntitlement("kyc", 'hasView'), dashboardKYC.getKYCCustomer);
    app.get('/kyc/:orgid/:projectid/:customerId/edit', requiresLogin, requiresEntitlement("kyc", 'hasCreate'), dashboardKYC.editKYCCustomer);
    app.post('/kyc/update', requiresLogin, requiresEntitlement("kyc", 'hasCreate'), dashboardKYC.updateKYCCustomer);

    app.post('/kyc/:orgid/:projectid/setOwner', requiresLogin, requiresEntitlement("kyc", 'hasCreate'), dashboardKYC.setOwner);
    app.post('/kyc/:orgid/:projectid/setApproved', requiresLogin, requiresEntitlement("kyc", 'hasCreate'), dashboardKYC.setApproved);
    app.post('/kyc/:orgid/:projectid/setDone', requiresLogin, requiresEntitlement("kyc", 'hasCreate'), dashboardKYC.setDone);
    app.post('/kyc/:orgid/:projectid/requestMoreInfo', requiresLogin, requiresEntitlement("kyc", 'hasCreate'), dashboardKYC.requestMoreInfo);
    app.post('/kyc/:orgid/:projectid/setRejects', requiresLogin, requiresEntitlement("kyc", 'hasDelete'), dashboardKYC.requestReject);
    app.get('/kyc/:orgid/:projectid/getPdfInfo/:customerId', requiresLogin, requiresEntitlement("kyc", 'hasView'), dashboardKYC.getPdfInfo);
    app.get('/kycGarantias/:orgid/:projectid/:identityToken/view', requiresLogin, requiresEntitlement("kyc", 'hasView'), dashboardKYC.getGarantiasCustomer);
    app.post('/kycGarantias/:orgid/:projectid/setOwner', requiresLogin, requiresEntitlement("kyc", 'hasCreate'), dashboardKYC.setGarantiasOwner);
    app.post('/kycGarantias/:orgid/:projectid/requestMoreInfo', requiresLogin, requiresEntitlement("kyc", 'hasCreate'), dashboardKYC.requestMoreGarantiasInfo);
    app.post('/kycGarantias/:orgid/:projectid/setApproved', requiresLogin, requiresEntitlement("kyc", 'hasCreate'), dashboardKYC.setGarantiasApproved);
    app.post('/kycGarantias/:orgid/:projectid/setRejects', requiresLogin, requiresEntitlement("kyc", 'hasDelete'), dashboardKYC.requestGarantiasReject);

    /* ------------ KYC  Routes  -----------------------------------------*/
    app.get('/dashboard/:org/kyc', requiresLogin, requiresEntitlement("kyc", 'hasView'), dashboard.getKYCDashboard);

    /* ------------ KYB Tuidentidad  Routes  -----------------------------------------*/
    app.get('/kyb/:orgid/:projectid/list', requiresLogin, requiresEntitlement("kyc", 'hasView'), dashboardKYB.getKYBDashboard);
    app.get('/kyb/:orgid/:projectid/:customerId/view', requiresLogin, requiresEntitlement("kyc", 'hasView'), dashboardKYB.getKYBCustomer);
    app.post('/kyb/:orgid/:projectid/:customerId/view/accionistas/:formId', requiresLogin, requiresEntitlement("kyc", 'hasView'), dashboardKYB.getKYBAccionariaSingleInfo);
    app.post('/kyb/:orgid/:projectid/:customerId/view/apoderados/:formId', requiresLogin, requiresEntitlement("kyc", 'hasView'), dashboardKYB.getKYBApoderadosSingleInfo);
    app.post('/kyb/:orgid/:projectid/setApproved', requiresLogin, requiresEntitlement("kyc", 'hasCreate'), dashboardKYB.setApproved);
    app.post('/kyb/:orgid/:projectid/setRejected', requiresLogin, requiresEntitlement("kyc", 'hasCreate'), dashboardKYB.setRejected);
    app.post('/kyb/:orgid/:projectid/requestMoreInfo', requiresLogin, requiresEntitlement("kyc", 'hasCreate'), dashboardKYB.requestMoreInfo);
    app.get('/KYBTuIdentidad/fetchUnreadIncomingMsgsFromKYBtuidentidadClients', requiresLogin, dashboardKYB.fetchUnreadIncomingMsgsFromKYBtuidentidadClients);
    app.post('/kyb/:orgid/:projectid/markReadOfClientMailboxMsgs', requiresLogin, requiresEntitlement("kyc", 'hasView'), dashboardKYB.markReadOfClientMailboxMsgs);
    app.get('/kyb/:orgid/:projectid/getPdfInfo/:customerId', requiresLogin, requiresEntitlement("kyc", 'hasView'), dashboardKYB.getPdfInfo);
    /* ------------ KYB Tuidentidad Routes  -----------------------------------------*/


    /* ------------ Promerica  Routes  -----------------------------------------*/
    app.get('/dashboard/promerica/contracargos', requiresLogin, requiresEntitlement("contracargos", 'hasView'), contracargos.getDashboard);
    app.get('/dashboard/promerica/contracargos/requestPDF/:processId', requiresLogin, requiresEntitlement("contracargos", 'hasView'), contracargos.pdfGenerate);

    /* ------------ Dashboard  Routes  -----------------------------------------*/
    app.get('/reportes/:formId', requiresLogin, requiresEntitlement('reports', 'hasView'), dashboard.getReports);
    // app.get('/reportes', requiresLogin, requiresEntitlement('reports', 'hasView'), dashboard.getReports);
    app.get('/reportes/:orgId/:projectId/:status', requiresLogin, requiresEntitlement('reports', 'hasView'), dashboard.getReportsByStatus);
    app.get('/dashboard/logout', auth.logout);

    app.get('/dashboard/users', requiresLogin, requiresEntitlement("users", 'hasView'), dashboard.getUsers);
    app.get('/dashboard/users/create', requiresLogin, requiresEntitlement("users", 'hasCreate'), dashboard.createUsers);
    app.post('/dashboard/users/create', requiresLogin, requiresEntitlement("users", 'hasCreate'), methodValidator.validate('createUser'), dashboard.createuser);
    app.get('/dashboard/users/edit/:userId', requiresLogin, requiresEntitlement("users", 'hasCreate'), dashboard.editUsers);
    app.post('/dashboard/users/update', requiresLogin, requiresEntitlement("users", 'hasCreate'), methodValidator.validate('updateUser'), dashboard.updateUsers);
    app.post('/dashboard/users/updateBlockStatus', requiresLogin, requiresEntitlement("users", 'hasCreate'), dashboard.blockOrUnblockUser);
    app.post('/dashboard/users/updatePassword', requiresLogin, requiresEntitlement("users", 'hasCreate'), dashboard.updatePassword);
    app.post('/dashboard/users/delete', requiresLogin, requiresEntitlement("users", 'hasDelete'), dashboard.deleteUser);
    app.post('/dashboard/users/uploadProfilePicture', requiresLogin, requiresEntitlement("users", 'hasCreate'), uploadUser.any(), dashboard.uploadProfilePicture);
    app.post('/dashboard/users/getFormsByOrganizationId', requiresLogin, requiresEntitlement("users", 'hasCreate'), dashboard.getFormsByOrganizationId);

    //Component
    app.get('/dashboard/components', requiresLogin, requiresEntitlement("components", 'hasView'), dashboard.getComponents);
    app.post('/dashboard/components/create', requiresLogin, requiresEntitlement("components", 'hasCreate'), dashboard.createComponent);
    app.get('/dashboard/components/create', requiresLogin, requiresEntitlement("components", 'hasCreate'), dashboard.getComponentForm);
    app.get('/dashboard/components/edit/:componentId', requiresEntitlement("components", 'hasCreate'), requiresLogin, dashboard.editComponent);
    app.post('/dashboard/components/update', requiresLogin, requiresEntitlement("components", 'hasCreate'), dashboard.updateComponent);
    app.get('/dashboard/components/delete/:componentId', requiresEntitlement("components", 'hasDelete'), requiresLogin, dashboard.deleteComponent);

    //Roles
    app.get('/dashboard/roles', requiresLogin, requiresEntitlement("roles", 'hasView'), dashboard.getRoles);
    app.post('/dashboard/roles/create', requiresLogin, requiresEntitlement("roles", 'hasCreate'), methodValidator.validate('createRoles'), dashboard.createRoles);
    app.get('/dashboard/roles/create', requiresLogin, requiresEntitlement("roles", 'hasCreate'), dashboard.createRoleForm);
    app.get('/dashboard/roles/edit/:roleId', requiresLogin, requiresEntitlement("roles", 'hasCreate'), dashboard.editRole);
    app.post('/dashboard/roles/update', requiresLogin, requiresEntitlement("roles", 'hasCreate'), methodValidator.validate('editRoles'), dashboard.updateRoles);
    app.get('/dashboard/roles/delete/:roleId', requiresLogin, requiresEntitlement("roles", 'hasDelete'), dashboard.deleteRoles);
    app.post('/dashboard/roles/updaterolestatus', requiresLogin, requiresEntitlement("roles", 'hasCreate'), dashboard.updateRoleStatus);
    app.post('/dashboard/getOrganizationComponents', requiresLogin, requiresEntitlement("roles", 'hasCreate'), dashboard.getOrganizationComponentsById);

    //organization
    app.get('/dashboard/organizations', requiresLogin, requiresEntitlement("organizations", 'hasView'), dashboard.getOrgs);
    app.get('/dashboard/organizations/create', requiresLogin, requiresEntitlement("organizations", 'hasCreate'), dashboard.createOrganizationsForm);
    app.post('/dashboard/organizations/create', requiresLogin, requiresEntitlement("organizations", 'hasCreate'), methodValidator.validate('createOrganization'), dashboard.createOrganization);
    app.get('/dashboard/organizations/edit/:organizationId', requiresLogin, requiresEntitlement('organizations', 'hasCreate'), dashboard.editOrganization);
    app.post('/dashboard/organizations/update', requiresLogin, requiresEntitlement("organizations", 'hasCreate'), methodValidator.validate('editOrganization'), dashboard.updateOrganization);
    app.post('/dashboard/organizations/delete', requiresLogin, requiresEntitlement("organizations", 'hasDelete'), dashboard.deleteOrganizations);
    app.post('/dashboard/organizations/updateBlockStatus', requiresLogin, requiresEntitlement("organizations", 'hasCreate'), dashboard.blockOrUnblockOrganization);
    app.post('/dashboard/organizations/uploadOrgLogo', requiresLogin, requiresEntitlement("organizations", 'hasCreate'), uploadOrgLogo.any(), dashboard.uploadOrganizationLogo);

    //projects
    app.get('/dashboard/projects', requiresLogin, requiresEntitlement("projects", 'hasView'), dashboard.getProjects);
    app.get('/dashboard/profile', requiresLogin, requiresEntitlement("profile", 'hasView'), dashboard.getProfile);
    app.post('/dashboard/changepassword', requiresLogin, auth.changePassword);
    app.get('/dashboard/projects/create', requiresLogin, requiresEntitlement("projects", 'hasCreate'), dashboard.getCreateProjects);
    app.post('/dashboard/projects/create', requiresLogin, requiresEntitlement("projects", 'hasCreate'), methodValidator.validate('createProject'), projects.createNewProject);
    app.post('/dashboard/projects/createOrUpdateProjectSetup', requiresLogin, requiresEntitlement("projects", 'hasCreate'), methodValidator.validate('createOrUpdateProjectSetup'), projects.createOrUpdateProjectSetup);
    app.post('/dashboard/projects/createOrUpdateProjectDetails', requiresLogin, requiresEntitlement("projects", 'hasCreate'), methodValidator.validate('createOrUpdateProjectDetails'), projects.createOrUpdateProjectDetails);
    app.get('/dashboard/projects/:formId/edit', requiresLogin, requiresEntitlement("projects", 'hasCreate'), dashboard.getEditProjects);
    app.post('/dashboard/projects/delete', requiresLogin, requiresEntitlement("projects", 'hasDelete'), projects.deleteProject);
    app.post('/dashboard/projects/updateBlockStatus', requiresLogin, requiresEntitlement("projects", 'hasCreate'), projects.blockOrUnblockProjects);
    app.post('/dashboard/projects/uploadProjectLogo', requiresLogin, requiresEntitlement("projects", 'hasCreate'), uploadProjectLogo.any(), projects.uploadProjectLogo);
    app.post('/dashboard/projects/update', requiresLogin, requiresEntitlement("projects", 'hasCreate'), methodValidator.validate('updateProject'), projects.updateProject);
    app.post('/dashboard/projects/duplicateProject', requiresLogin, requiresEntitlement("projects", 'hasCreate'), projects.duplicateProject);

    //forms ( form builders)
    app.get('/dashboard/forms', requiresLogin, requiresEntitlement("forms", 'hasView'), dashboard.getProjectForms);
    app.get('/dashboard/forms/create', requiresLogin, requiresEntitlement("forms", 'hasCreate'), dashboard.getCreateProjectForm);
    app.post('/dashboard/forms/create', requiresLogin, requiresEntitlement("forms", 'hasCreate'), methodValidator.validate('createProjectForm'), dashboard.createProjectForm);
    app.get('/dashboard/forms/:formId/edit', requiresLogin, requiresEntitlement('forms', 'hasCreate'), dashboard.editProjectForm);
    app.post('/dashboard/forms/update', requiresLogin, requiresEntitlement("forms", 'hasCreate'), methodValidator.validate('editProjectForm'), dashboard.updateProjectForm);
    app.post('/dashboard/forms/delete', requiresLogin, requiresEntitlement("forms", 'hasDelete'), dashboard.deleteProjectForm);
    app.post('/dashboard/forms/getFormsByOrganizationId', requiresLogin, requiresEntitlement("forms", 'hasCreate'), dashboard.getFormsByOrganizationId);
    app.post('/dashboard/forms/checkIfFormNameIsValid', requiresLogin, requiresEntitlement("forms", 'hasCreate'), methodValidator.validate('editProjectForm'), dashboard.checkIfProjectFormNameIsValid);
    app.post('/dashboard/forms/saveGeneratedProjectForm', requiresLogin, requiresEntitlement("forms", 'hasCreate'), dashboard.saveGeneratedProjectForm);


    //invitation
    app.get('/dashboard/uniqueUrls', requiresLogin, requiresEntitlement("uniqueUrlUI", 'hasView'), dashboard.getUniqueUrls);
    app.get('/dashboard/invitation/:invitationid', requiresLogin, requiresEntitlement("uniqueUrl", 'hasCreate'), dashboard.editInvitation);
    app.get('/dashboard/invitations', requiresLogin, requiresEntitlement("uniqueUrl", 'hasView'), dashboard.listInvitations);

    app.post('/dashboard/process/:orgId/createInvitation', requiresLogin, requiresEntitlement("uniqueUrl", 'hasCreate'), dashboard.createInvitation);

    app.get('/dashboard/settings', requiresLogin, requiresEntitlement('settings', 'hasView'), dashboard.getSettings);
    app.get('/dashboard/information', requiresLogin, requiresEntitlement('information', 'hasView'), dashboard.getInformation);
    app.get('/customerdetails/:id', dashboard.getCustomerDetails);
    /* ------------ Reports  Routes  -----------------------------------------*/

    app.get('/reports/:org/:project/dashboard', validateViolationAccess, requiresEntitlement("reports", 'hasCreate'), dashboard.reportRouter);


    app.get('/reports/:org/:project/:reportType', validateViolationAccess, userAccessPermissions, requiresEntitlement("reports", 'hasCreate'), reports.getReport);

    app.get('/bi/:org/:project/:processId', validateViolationAccess, userAccessPermissions, requiresEntitlement("bi", 'hasCreate'), dashboard.getBICenter);


    /* ------------ Auth  Routes  -----------------------------------------*/

    app.get('/forms/kyc/:org/:userkey/login', csrfProtection, projects.caliban, projects.getKYCLogin);
    app.get('/forms/kyc/:org/:userkey/:key/:stepid', csrfProtection, projects.caliban, projects.getKYC);

    app.post('/forms/kyc/auth', csrfProtection, kyc.auth);
    app.post('/forms/kyc/token', csrfProtection, kyc.validateOtp)



    /* ------------ Forms  Routes  -----------------------------------------*/
    // app.get('/forms/:org/kyc/start', kyc.getIndex);
    // app.get('/forms/:org/kyc/:formid/:step', kyc.getStep);
    // app.get('/forms/kyc/:org/:userkey/:stepid', projects.getIndex);

    // app.get('/forms/contracargos/pdf/:formid', requiresLogin, contracargos.generatePDF);
    app.get('/forms/contracargos/:indem/:org', csrfProtection, projects.getContracargos);
    app.get('/forms/contracargos/:indem/:org/:idform/update', csrfProtection, projects.getContracargosUpdate);
    app.get('/forms/contracargos/:org', csrfProtection, projects.getContracargos);
    app.get('/forms/contracargos/:org/:idform/update', csrfProtection, projects.getContracargosUpdate);

    app.post('/forms/contracargos/process', upload.any(), disputes.process);
    app.post('/forms/contracargos/update', upload.any(), contracargos.update);

    app.get('/forms/evicertia/requestPDF', evicertia.requestPDFServer);
    app.post('/forms/evicertia/assa/process', upload.any(), evicertia.AssaProcess);
    app.post('/forms/evicertia/assa/previewPdf', evicertia.pdfGenerate);

    app.get('/forms/evicertia/assa/thankyou', projects.getThankyouAssa);
    // app.get('/forms/evicertia/assa/demo', csrfProtection, projects.getEvicertiaAssaForm);
    app.get('/forms/:company/:project/expired', projects.getExpired);
    app.get('/forms/:org/:project/thankyou', projects.getThankyou);
    app.get('/forms/evicertia/assa/:formId',
        csrfProtection,
        projects.getEvicertiaAssaForm);

//CIC
    app.post('/forms/its/cic/process', uploadCIC.any(), cic.process);
    app.get('/forms/its/cic/:formId',
        csrfProtection,
        projects.caliban,
        projects.uniqueUrl,
        projects.getITSCicForm);

    app.get('/forms/its/cic/pdf/:id', cic.generatePDF);


    // app.get('/forms/evicertia/assa', csrfProtection, projects.getEvicertiaAssaForm);

    app.get('/forms/cabletica/demo', csrfProtection, projects.getCableticaForm);
    app.get('/forms/cabletica/requestPDF', cabletica.requestPDFServer);
    app.post('/forms/cabletica/process', uploadCC.any(), cabletica.process);

    app.get('/forms/garantias-request/creditExecutive/:identityToken',requiresLogin, requiresEntitlement('dashboard', 'hasView'), garantias.validateGarantiasRequestByCreditExecutive)


    // app.get('forms/test/formbuilder', projects.getTest )


    /* ------------ Others  Routes  -----------------------------------------*/
    app.get('/thankyou', projects.getThankyou);

    app.get('/500', projects.getErrorPage);
    app.get('/404', projects.getNotFoundPage);

    app.get('*', projects.getNotFoundPage);
}

module.exports = routes;
