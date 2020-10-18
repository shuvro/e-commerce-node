const database = require('../config/database');
const server = require('../config/server');
const contracargosDB = require('../models/contracargos');
const userDB = require('../models/users');
const cableticaDB = require('../models/cabletica');
const orgDB = require('../models/organizations');
const projectsDB = require('../models/projects');
const authUtils = require('../utils/auth-utils');
const uniqueUrlDB = require('../models/uniqueUrls');
const invitationDB = require('../models/invitations');
const KycDB = require('../models/kyc');
const componentDB = require('../models/components');
const roleDB = require('../models/roles');
const transactionDB = require('../models/transaction');
const entitlementDB = require('../models/entitlements');
const organizationComponentsEntitlementsDB = require('../models/organizationComponentsEntitlements')
const projectFormDB = require('../models/projectForms');
const _ = require('lodash');
const moment = require('moment');
const reportsHelper = require('../bin/helpers/reports-helper');
const client = require('../bin/helpers/client-helper');
const api = require('../bin/helpers/api-helper');
// const projectsDB = require('../models/projects');
const uuidv4 = require('uuid/v4');
const KYCDashboard = require('../controllers/kyc/dashboard');
const axios = require("axios");
const {validationResult} = require('express-validator');
const projectFormSchema = require('../schemas/projectForms');
let mongoose = require('mongoose');
let formMatcher = require('../helpers/formJsonMatch');

const handleError = (err, res) => {
    console.log(err);
    // return res.json({'success': false, err: err})
};
const getIndex = async function (req, res) {

    let initialInfo = [];
    let getRoleById = await userDB.getRoleById(req.session.usertype).catch(err => res.json({
        error: err,
        msg: "getRoleById>getIndex"
    }));

    let getEntitlements = await userDB.getEntitlements(getRoleById[0].id).catch(err => res.json({
        error: err,
        msg: "getEntitlements>getIndex"
    }));
    let entitlements = authUtils.setEntitlements(getEntitlements);

    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: getRoleById[0].roleName,
        org: req.session.userorg,
    };


    switch (user.usertype) {
        case 'cableticaAdmin':

            break;
        case 'contracargosAdmin':
            return res.redirect('/dashboard/promerica/contracargos');
            break;
        case 'cicAdmin':
            return res.redirect('/dashboard/its/cic');
            break;
        case 'csAdmin':
            return res.redirect('/dashboard/cs/kyc');
            break;
    }
    const defaultProject = api.getDefaultProject(req.session);
    const stats = await getReportDashboardByOrgAndProj(defaultProject);

    const getProcessByOwner = await getallByProcessByOwner(user.id, defaultProject.formId);
    let processList = [];

    if (getProcessByOwner && getProcessByOwner.data && getProcessByOwner.data.list) {
        processList = getProcessByOwner.data.list;
        console.log(processList)
    }

    initialInfo.reports = [];
    initialInfo.chart = [];
    initialInfo.reports.totalTransaction = await transactionDB.getTotalTransaction(defaultProject.formId);
    initialInfo.reports.totalTransactionToday = await transactionDB.getTotalTransactionToday(defaultProject.formId);
    initialInfo.reports.totalTransactoinForLastWeek = await transactionDB.getTotalTransactionForLastWeek(defaultProject.formId);
    initialInfo.reports.totalTransactionForLastMonth = await transactionDB.getTotalTransactionForLastMonth(defaultProject.formId);
    initialInfo.chart.allTransactionForLastMonth = await transactionDB.getAllTransactionForLastMonth(defaultProject.formId);
    initialInfo.chart.allTransactionForLastMonth = JSON.stringify(initialInfo.chart.allTransactionForLastMonth);

    res.render('dashboard', {
        user: user,
        isHubex: true,
        initialInfo: initialInfo,
        permissions: entitlements,
        isDashboard: true,
        projects: req.session.projectsOwnered,
        processList: processList,
        currentProjectId: defaultProject.formId,
        hasBranding: true
    });
};


const getUsers = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    let initialInfo = {};

    let userOrg;
    if (user.usertype === 'carisadmin') {
        userOrg = null;
    } else {
        userOrg = user.org
    }


    initialInfo.userList = await userDB.getUserList(userOrg);

    res.render('userlist', {
        user: user,
        initialInfo: initialInfo,
        org: req.session.userorg,
        permissions: req.entitlements,
        projects: req.session.projectsOwnered,
        isUser: true,
        useDataTables: true
    });
};


const getProfile = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    let error = false;
    let initialInfo = {};
    let userId = user.id;

    initialInfo.userList = await userDB.getUserList(user.org);

    let orgDetails;
    let assignedToOrg;

    if (user.usertype === 'carisadmin') {
        orgDetails = await orgDB.getOrgList(true);
        assignedToOrg = await orgDB.getOrgById(user.org);
    } else {
        orgDetails = await orgDB.getOrgById(user.org);
        assignedToOrg = orgDetails;
    }
    //get org roles
    const orgRoles = await orgDB.getOrgRoles(user.org);

    let userInfo = await userDB.getUserDetailsById(userId);

    if (!userInfo) {
        error = true;
    }
    if (userInfo && userInfo.organizationId !== user.org) {
        if (req.activeRole[0].roleName !== 'carisadmin') {
            error = true;
            userInfo = null;
            return res.json({error: 'Invalid Access'})
        }

    }
    let imageUrl = "";
    if (userInfo.image == '') {
        imageUrl = "/img/default-user-image.png";
    } else {
        imageUrl = "/uploads/users/" + userInfo.image;
    }
    res.render('userProfile', {
        user: user,
        initialInfo: initialInfo,
        org: req.session.userorg,
        permissions: req.entitlements,
        projects: req.session.projectsOwnered,
        isUser: true,
        orgDetails: orgDetails,
        assignedToOrg: assignedToOrg[0],
        roles: orgRoles,
        action: 'update',
        method: 'post',
        error: error,
        userInfo: userInfo,
        imageUrl: imageUrl,
        isEdit: true
    });
};

const createUsers = async function (req, res) {

    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    let initialInfo = {};


    render = 'userCreate';
    initialInfo.userList = await userDB.getUserList(user.org);

    //get org details
    let orgDetails;

    if (user.usertype === 'carisadmin') {
        orgDetails = await orgDB.getOrgList(true);
    } else {
        orgDetails = await orgDB.getOrgById(user.org)
    }

    //get org roles
    const orgRoles = await orgDB.getOrgRoles(user.org);

    res.render(render, {
        user: user,
        initialInfo: initialInfo,
        org: req.session.userorg,
        permissions: req.entitlements,
        isUser: true,
        orgDetails: orgDetails,
        projects: req.session.projectsOwnered,
        roles: orgRoles,
        action: 'create',
        method: 'POST'
    });
};

const editUsers = async function (req, res) {

    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    let error = false;

    let initialInfo = {};

    let userId = req.params.userId;

    let render = 'userCreate';
    initialInfo.userList = await userDB.getUserList(user.org);

    let orgDetails;
    let assignedToOrg;
    let formOwned;

    let carisOrgId;
    if (user.usertype === 'carisadmin') {
        orgDetails = await orgDB.getOrgList(true);
        assignedToOrg = await orgDB.getOrgById(user.org);
        carisOrgId = user.org;
    } else {
        orgDetails = await orgDB.getOrgById(user.org);
        formOwned = await projectsDB.getFormByUserId(userId);
        assignedToOrg = orgDetails;
    }
    const orgRoles = await orgDB.getOrgRoles(user.org);

    let userInfo = await userDB.getUserDetailsById(userId);

    if (!userInfo) {
        error = true;
    }

    if (userInfo && userInfo.organizationId !== user.org) {
        if (req.activeRole[0].roleName !== 'carisadmin') {
            error = true;
            userInfo = null;
            return res.json({error: 'Invalid Access'})
        }

    }
    let imageUrl = "";
    if (userInfo.image == '') {
        imageUrl = "/img/default-user-image.png";
    } else {
        imageUrl = "/uploads/users/" + userInfo.image;
    }

    userInfo.formOwned = [];
    if (formOwned) {
        for (let i = 0; i < formOwned.length; i++) {
            userInfo.formOwned[i] = formOwned[i].formId;
        }
    }
    res.render(render, {
        user: user,
        initialInfo: initialInfo,
        org: req.session.userorg,
        permissions: req.entitlements,
        isUser: true,
        orgDetails: orgDetails,
        assignedToOrg: assignedToOrg[0],
        projects: req.session.projectsOwnered,
        roles: orgRoles,
        action: 'update',
        method: 'post',
        error: error,
        userInfo: userInfo,
        imageUrl: imageUrl,
        isEdit: true,
        carisOrgId: carisOrgId
    });
};

const updateUsers = async function (req, res) {

    let userType = req.activeRole[0].roleName;
    const body = req.body;

    let organizationId;
    if (userType === 'carisadmin') {
        organizationId = body.organizationId
    } else {
        organizationId = req.session.userorg;
    }

    let userId = body.userId;
    let name = body.name;
    let lastname = body.lastname;
    let secondlastname = body.secondlastname;
    let telephone = body.telephone;
    let cellular = body.cellular;
    let ext = body.ext;
    let image = body.image;
    let email = body.email;
    let type = body.type;
    let formIds = body.formIds;
    let getUserDetails = await userDB.getUserDetailsById(userId);
    if (getUserDetails.email !== email) {
        let checkIfEmailAlreadyExists = await userDB.checkIfEmailAlreadyExists(email);
        if (checkIfEmailAlreadyExists) {
            let data;
            data = {
                success: false,
                message: "Another user with same email exists!",
                data: checkIfEmailAlreadyExists
            };
            return res.json(data);
        }
    }
    // let password = body.password;
    let isApi = body.isApi;
    try {
        let data = {};
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            data = {
                success: false,
                message: "Validation Error",
                errors: errors.array()
            };
            res.json(data);
            return;
        }

        let user = await database.User.update({
            organizationId: organizationId,
            name: name,
            lastname: lastname,
            secondlastname: secondlastname,
            telephone: telephone,
            cellular: cellular,
            extension: ext,
            image: image,
            type: type,
            email: email,
            updatedBy: userType,
        }, {where: {id: userId}, individualHooks: true, context: req.session});
        if (user) {
            if (formIds) {
                let savedAssignedForms = await projectsDB.getFormByUserId(userId);
                let savedAssignedFormsArray = [];
                for (let i = 0; i < savedAssignedForms.length; i++) {
                    savedAssignedFormsArray[i] = savedAssignedForms[i].formId;
                }
                let formsNeedToBeRemoved = _.difference(savedAssignedFormsArray, formIds);
                if (formsNeedToBeRemoved.length > 0) {
                    formIds = _.remove(formIds, formsNeedToBeRemoved);
                }
                for (let i = 0; i < formsNeedToBeRemoved.length; i++) {
                    await database.ProjectOwnered.destroy({
                        where: {
                            formId: formsNeedToBeRemoved[i],
                            userId: userId
                        },
                        individualHooks: true, context: req.session
                    });
                }
                let assignedForms = {};
                for (let i = 0; i < formIds.length; i++) {
                    let checkIfFormIdAssigned = await projectsDB.getAssignedFormById(formIds[i], userId);
                    if (checkIfFormIdAssigned) {
                        let updateAssigned = await database.ProjectOwnered.update({
                            formId: formIds[i],
                            userId: userId,
                            updatedBy: req.activeRole[0].roleName
                        }, {where: {id: checkIfFormIdAssigned.id}, individualHooks: true, context: req.session});
                    } else {
                        let newAssignForms = await database.ProjectOwnered.create({
                            userId: userId,
                            formId: formIds[i],
                            createdBy: req.activeRole[0].roleName
                        }, {individualHooks: true, context: req.session});
                    }
                }
                data = {
                    success: true,
                    message: "Successfully Updated",
                };
                return res.json(data);
            } else {
                data = {
                    success: true,
                    message: "Successfully Updated",
                };
                return res.json(data);
            }
        } else {
            data = {
                success: false,
                message: "User Update Failed",
            };
            return res.json(data);
        }

        // try {
        //     let userCredentials = await database.UserCredentials.create({
        //         userId: user.id,
        //         password: password,
        //         createdBy: 'admin'
        //     });
        //     if (isApi) {
        //         res.json({user: user.id})
        //     } else {
        //         return res.redirect('/dashboard/users')
        //     }
        //
        //
        // } catch (e) {
        //     console.log('err user credential', e)
        //     res.json({err: e})
        // }
    } catch (e) {
        console.log('e', e)
        let data = {
            success: false,
            message: "Technical Error",
            error: e
        };
        res.json({data: data})
    }

};

const getReports = async (req, res) => {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    switch (user.usertype) {
        case 'cableticaAdmin':
            return res.redirect('/reports/cabletica/contratos/dashboard');
            break;
        case 'contracargosAdmin':
            return res.redirect('/reports/promerica/contracargos/dashboard');
            break;
        case 'cathayAdmin':
            return res.redirect('/reports/its/cic/dashboard');
            break;
    }
    let formId = req.params.formId;

    const defaultProject = await projectsDB.getFormOwneredByUserAndFormId(user.id, formId);
    // const defaultProject = api.getDefaultProject(req.session);
    const stats = await getReportDashboardByOrgAndProj(defaultProject);

    let initialInfo = [];
    initialInfo.reports = [];
    initialInfo.chart = [];
    initialInfo.reports.totalTransaction = await transactionDB.getTotalTransaction(defaultProject.formId);
    initialInfo.reports.totalTransactionToday = await transactionDB.getTotalTransactionToday(defaultProject.formId);
    initialInfo.reports.totalTransactoinForLastWeek = await transactionDB.getTotalTransactionForLastWeek(defaultProject.formId);
    initialInfo.reports.totalTransactionForLastMonth = await transactionDB.getTotalTransactionForLastMonth(defaultProject.formId);
    initialInfo.chart.allTransactionForLastMonth = await transactionDB.getAllTransactionForLastMonth(defaultProject.formId);
    initialInfo.chart.allTransactionForLastMonth = JSON.stringify(initialInfo.chart.allTransactionForLastMonth);

    res.render('reports', {
        user: user,
        org: req.session.userorg,
        permissions: req.entitlements,
        initialInfo: initialInfo,
        isReports: true,
        count: stats.data.data,
        defaultProj: defaultProject,
        projects: req.session.projectsOwnered,
        currentFormId: defaultProject.formId
    });
};
const getReportDashboardByOrgAndProj = async (defaultProject) => {
    // const org = params.userorg;
    // const proj = params.projectId;

    const formSettings = await projectsDB.getFormSettingsByFormID(defaultProject.formId).catch(handleError)
    // console.log('formSettings', formSettings);
    if (!formSettings) {
        return {
            data: {
                data: {}
            }
        };
    }
    const _url = `${formSettings.apiUrl}:${formSettings.apiPort}/${formSettings.sufix}`
    return await client.get(_url, 'getCountStatus');

};

const getallByProcessByOwner = async (owner, projectid) => {

    // console.log('setOwner',responseObj)
    //TODO check if projecid is in session | permissions

    const formSettings = await projectsDB.getFormSettingsByFormID(projectid);
    //TODO if nor form settings error

    console.log('formSettings', formSettings)

    if (!formSettings) {
        return {};
    }

    const url = `${formSettings.apiUrl}:${formSettings.apiPort}/${formSettings.sufix}/${server.configUrls.methods['getAllByOwner']}/${owner}`;

    // const url = `${baseUrl}/${config.configUrls.methods.setSignature}`;
    const _config = {
        method: 'get',
        url: url,
    }

    // console.log('_config',_config)

    try {

        const axios_request = await axios(_config);
        console.log('axios_request', axios_request.data)

        return axios_request;
    } catch (err) {
        console.log('err', err)
        // return res.status(401).json({"success": false, "msg": err});
    }
}

const reportRouter = async (req, res) => {

    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,

    };

    let render = `reports_${req.params.org}_${req.params.project}`;
    let initialInfo = [];
    initialInfo.reports = await reportsHelper.getReportDashboard(req.params.org, req.params.project);

    res.render(render, {
        user: user,
        org: req.session.userorg,
        permissions: req.entitlements,
        initialInfo: initialInfo,
        isReports: true
    });
};

const getReportsByStatus = async (req, res) => {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    const status = req.params.status;
    const projectId = req.params.projectId;

    const projects = req.session.projectsOwnered;
    // const selectedProject = _.find(projects, 'id', projectId);
    const result = projects.filter(obj => {
        return obj.formId === projectId
    });
    const selectedProject = result[0];

    let list = [];
    const formSettings = await projectsDB.getFormSettingsByFormID(selectedProject.formId).catch(handleError)
    const _url = `${formSettings.apiUrl}:${formSettings.apiPort}/${formSettings.sufix}`
    //TODO
    // This needs to be refactored to get reports based in org and project id
    if (status) {
        switch (status) {
            case 'pending':
                list = await client.get(_url, 'getAllByPending');
                break;
            case 'all':
                list = await client.get(_url, 'getAllKYC');
                break;
            case 'inProgress':
                list = await client.get(_url, 'getAllByInProgress');
                break;
            case 'inReview':
                list = await client.get(_url, 'getAllBySigned');
                break;
            case 'approved':
                list = await client.get(_url, 'getAllByApproved');
                break;
            case 'signed':
                list = await client.get(_url, 'getAllBySigned');
                break;
            case 'open':
                list = await client.get(_url, 'getAllByOpened');
                break;
            case 'done':
                list = await client.get(_url, 'getAllByDone');
                break;
        }
        selected = status
    } else {
        list = await client.get('getAllKYC');
    }

    res.render('reportsDetail', {
        user: user,
        org: req.session.userorg,
        permissions: req.entitlements,
        isReports: true,
        projectName: selectedProject['Form.name'],
        projectId: selectedProject.formId,
        data: list.data.data,
        projects: req.session.projectsOwnered,
        status: status,
        useDataTables: true
    });
};


const getCustomerDetails = function (req, res) {
    res.render('customerdetail', {});
};

const createuser = async function (req, res, next) {

    let userType = req.activeRole[0].roleName;
    const body = req.body;

    let organizationId;
    if (userType === 'carisadmin') {
        organizationId = body.organizationId
    } else {
        organizationId = req.session.userorg;
    }

    let name = body.name;
    let lastname = body.lastname;
    let secondlastname = body.secondlastname;
    let telephone = body.telephone;
    let cellular = body.cellular;
    let ext = body.ext;
    let image = body.image;
    let email = body.email;
    let type = body.type;
    let password = body.password;
    let formIds = body.formIds;
    let isApi = body.isApi;

    let checkIfEmailAlreadyExists = await userDB.checkIfEmailAlreadyExists(email);
    if (checkIfEmailAlreadyExists) {
        let data;
        data = {
            success: false,
            message: "User is already registered!",
            data: checkIfEmailAlreadyExists
        };
        return res.json(data);
    }

    try {
        let data = {};
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            data = {
                success: false,
                message: "Validation Error",
                errors: errors.array()
            };
            res.json(data);
            return;
        }

        let user = await database.User.create({
            organizationId: organizationId,
            name: name,
            lastname: lastname,
            secondlastname: secondlastname,
            telephone: telephone,
            cellular: cellular,
            extension: ext,
            image: image,
            type: type,
            email: email,
            createdBy: 'admin',
        }, {individualHooks: true, context: req.session});
        if (user.dataValues.id !== "") {
            try {
                let userCredentials = await database.UserCredentials.create({
                    userId: user.id,
                    password: password,
                    createdBy: 'admin'
                }, {individualHooks: true, context: req.session});
                if (userCredentials.dataValues.id !== "") {
                    if (isApi) {
                        data = {
                            success: true,
                            message: "Successfully Created",
                            user: user.id
                        };
                    } else {
                        data = {
                            success: true,
                            message: "Successfully Created",
                        };
                    }
                    for (let i = 0; i < formIds.length; i++) {
                        let assignedForms = await database.ProjectOwnered.create({
                            userId: user.id,
                            formId: formIds[i],
                            createdBy: req.activeRole[0].roleName
                        }, {individualHooks: true, context: req.session});
                    }
                    return res.json(data);
                } else {
                    data = {
                        success: false,
                        message: "User Credentials Creation Failed!",
                    };
                    return res.json(data);
                }
            } catch (e) {
                console.log('err user credential', e)
                let data = {
                    success: false,
                    message: "User Credentials Creation Failed!",
                    error: e
                };
                res.json({data: data})
            }
        } else {
            data = {
                success: false,
                message: "User Creation Failed!",
                user: user
            };
            return res.json(data);
        }
    } catch (e) {
        let data = {
            success: false,
            message: "User Creation Failed!",
            error: e
        };
        res.json({data: data})
    }
};


const getOrgs = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };
    let initialInfo = {};

    initialInfo.orgList = await orgDB.getOrgList();
    res.render('orglist', {
        user: user,
        initialInfo: initialInfo,
        permissions: req.entitlements,
        isOrganization: true,
        useDataTables: true,
    });
};
const getProjects = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };
    let initialInfo = {};
    initialInfo.formList = await projectsDB.getFormList();

    res.render('project_list', {
        user: user,
        initialInfo: initialInfo,
        permissions: req.entitlements,
        isProjects: true,
        useDataTables: true,
    });
};

const getCreateProjects = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    let initialInfo = {};

    initialInfo.orgList = await orgDB.getOrgList();

    let forms = await projectsDB.getFormList();

    res.render('project', {
        user: user,
        isCaris: true,
        isHubex: true,
        initialInfo: initialInfo,
        formlist: forms,
        permissions: req.entitlements,
        action: 'create',
        method: 'POST',
        isProjects: true
    });
};


const getUniqueUrls = async (req, res) => {

    let initialInfo = {};
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };
    const forms = await invitationDB.getFormOwneredByUser(user.id);

    let projects = await projectsDB.getFormById(forms[0].formId);

    if (req.session.requireChangePassword) {
        hideNavbar = true;
        render = 'reset';
    }
    res.render('uniqueUrlCreate', {
        user: user,
        org: req.session.userorg,
        isCIC: true,
        projects: projects,
        initialInfo: initialInfo,
        permissions: req.entitlements,
        isInvitation: true
    });
}


const getEditProjects = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    let formId = req.params.formId;
    let form = await projectsDB.getFormById(formId);
    let formSettings = await projectsDB.getFormSettingsByFormID(formId);
    let formDetails = await projectsDB.getFormDetailsById(formId);
    let initialInfo = {};

    initialInfo.orgList = await orgDB.getOrgList();

    let imageUrl = "";
    if (!formDetails) {
        imageUrl = "/img/default-user-image.png";
    } else {
        imageUrl = formDetails.logo;
    }

    res.render('project', {
        user: user,
        initialInfo: initialInfo,
        permissions: req.entitlements,
        action: 'update',
        method: 'post',
        form: form,
        formSettings: formSettings,
        formDetails: formDetails,
        imageUrl: imageUrl,
        isEdit: true,
        isProjects: true
    });
};


const createInvitation = async (req, res) => {
    try {

        let expiration = 48; //default
        let expirationType = 'onUserActivate';

        if (req.body.expiration && req.body.expiration > 0) {
            expiration = req.body.expiration
        }

        if (req.body.expirationType && req.body.expirationType != '') {
            expirationType = req.body.expirationType
        }


        const forms = await invitationDB.getFormOwneredByUser(req.activeRole[0].roleName);
        let externalId = '';

        const uniqueUrl = await uniqueUrlDB.createUrlAPI(req.session.userorg, forms[0].formId, req.session.email, expiration, expirationType);
        if (_.isEmpty(uniqueUrl)) {
            return res.redirect('/500?err=uniqueurlerror')
        } else {
            //create the request ur;
            console.log('req.body.projectType', req.body.project_type)
            try {
                if (req.body.project_type && req.body.project_type == 'kyc') {
                    externalId = await KycDB.createNewKyc(req, forms[0].formId);
                    externalId = externalId._id;
                }
                const invitation = await invitationDB.createInvitation(req, forms[0].formId, uniqueUrl._id, externalId);


                let redir = `/dashboard/invitation/${invitation._id}`;
                return res.redirect(redir)
            } catch (e) {
                console.log('invitation err', e)
                return res.redirect('/500?err=createInvitationErr')
            }


        }

    } catch (e) {
        console.log('e createUniqueUrl', e)
    }


}

const editInvitation = async (req, res) => {
    if (!req.params.invitationid) {
        return res.redirect('/') //TODO mover a un 401 de hubex
    }
    let invitation;
    let formDetails;
    let domainNamespace;
    try {
        invitation = await invitationDB.getInvitationById(req.params.invitationid);
    } catch (e) {
        console.log(e);
    }

    formDetails = await projectsDB.getFormById(invitation[0].formId);

    if (_.isEmpty(invitation)) {
        return res.redirect('/500?err=InvalidInvCode')
    }

    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
        isInvitation: true
    };

    const isKYC = (user.usertype == 'csAdmin');

    let domain = 'https://apps.hubex.com';

    let forms = await projectsDB.getFormList();

    res.render('uniqueUrlEdit', {
        user: user,
        org: req.session.userorg,
        isCIC: true,
        invitation: invitation[0],
        initialInfo: [],
        permissions: req.entitlements,
        domain: domain,
        form: formDetails,
        isKYC: isKYC
    });
}

const listInvitations = async (req, res) => {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
        isInvitation: true
    }

    const forms = await invitationDB.getFormOwneredByUser(user.id);
    console.log(forms);
    let projects = await projectsDB.getFormById(forms[0].formId);

    let initialInfo = '';
    let invitations = await invitationDB.getInvitationsByFormId(projects.formId);

    console.log('invitations', invitations)

    res.render('uniqueUrlView', {
        user: user,
        org: req.session.userorg,
        isCIC: true,
        invitations: invitations,
        permissions: req.entitlements,
        isInvitation: true,
        useDataTables: true
    });


}

const getKYCDashboard = async (req, res) => {


    let initialInfo = {};
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };
    initialInfo.formList = await KycDB.getKycPendingList();


    res.render('kyc_dashboard', {
        user: user,
        isCIC: true,
        initialInfo: initialInfo,
        permissions: req.entitlements,
        isDashboard: true
    });
}

const getBICenter = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    }

    var formId = req.params.processId;

    var formDetails = await projectsDB.getFormById(formId);

    let initialInfo = {};

    let render = `bi/bi_${req.params.org}_${req.params.project}`;
    initialInfo.orgList = await orgDB.getOrgList();

    let forms = await projectsDB.getFormList();

    res.render('bi', {
        user: user,
        isCaris: true,
        isHubex: true,
        initialInfo: initialInfo,
        formlist: forms,
        permissions: req.entitlements,
        action: 'edit',
        method: 'PUT',
        form: formDetails,
        isEdit: true,
        render: render,
        processId: formId
    });
};
const createComponent = async function (req, res) {
    let body = req.body;
    let name = body.name;
    let description = body.description;
    let organizations = body.organization;
    try {
        let data = {};
        let component = await database.Components.create({
            name: name.toLowerCase(),
            description: description,
            createdBy: req.activeRole[0].roleName
        });
        if (component.dataValues.id > 0) {
            let orgCompEntitlement = {};
            let entitleCreation = false;
            for (let i = 0; i < organizations.length; i++) {
                orgCompEntitlement = await database.OrganizationComponentEntitlements.create({
                    id: uuidv4(),
                    componentId: component.dataValues.id,
                    organizationId: organizations[i],
                    createdBy: req.activeRole[0].roleName
                }, {individualHooks: true, context: req.session});
                orgCompEntitlement = {};
                entitleCreation = true;
                let getAllRolesOfOrganization = await roleDB.getRoleIdsByOrganizationId(organizations[i]);
                for (let i = 0; i < getAllRolesOfOrganization.length; i++) {
                    let checkIfEntitlementExistsByRoleAndComponent = await entitlementDB.checkIfEntitlementExistsByRoleAndComponent(getAllRolesOfOrganization[i].id, component.dataValues.id);
                    if (!checkIfEntitlementExistsByRoleAndComponent) {
                        await database.Entitlements.create({
                            role: getAllRolesOfOrganization[i].id,
                            component: component.dataValues.id,
                            hasView: 0,
                            hasCreate: 0,
                            hasDelete: 0,
                            createdBy: req.activeRole[0].roleName
                        }, {individualHooks: true, context: req.session});
                    }
                }
            }
            if (entitleCreation === true) {
                data = {
                    success: true,
                    message: "Successfully Created",
                };
                return res.json(data);
            }
        } else {
            data = {
                success: false,
                message: "Component Creation Failed!",
            };
            return res.json(data);
        }
    } catch (e) {
        let data = {
            success: false,
            message: "Component Creation Failed!",
            error: e
        };
        res.json({data: data})
    }
};
const getComponentForm = async function (req, res) {
    let initialInfo = {};
    initialInfo.orgList = await orgDB.getOrgList();
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    res.render('component', {
        user: user,
        isCaris: true,
        isHubex: true,
        permissions: req.entitlements,
        initialInfo: initialInfo,
        action: 'create',
        method: 'POST',
        isComponent: true
    });
};
const getComponents = async function (req, res) {
    let initialInfo = {};
    initialInfo.componentList = await componentDB.getComponentList();
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };
    res.render('component_list', {
        user: user,
        initialInfo: initialInfo,
        permissions: req.entitlements,
        isComponent: true,
        useDataTables: true,
    });
};
const editComponent = async function (req, res) {
    let initialInfo = {};
    initialInfo.orgList = await orgDB.getOrgList();
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    let error = false;
    let componentId = req.params.componentId;
    const componentDetails = await componentDB.getComponentDetailsById(componentId);
    if (!componentDetails) {
        error = true;
    }
    let entitledOrganization = await organizationComponentsEntitlementsDB.getEntitledOrganizationIds(componentId);
    componentDetails.entitledOrganization = [];
    for (let i = 0; i < entitledOrganization.length; i++) {
        componentDetails.entitledOrganization[i] = entitledOrganization[i].organizationId;
    }

    res.render('component', {
        user: user,
        permissions: req.entitlements,
        initialInfo: initialInfo,
        action: 'update',
        method: 'post',
        error: error,
        componentDetails: componentDetails,
        isEdit: true,
        isComponent: true
    })
};
const updateComponent = async function (req, res) {
    let body = req.body;
    let name = body.name.toLowerCase();
    let description = body.description;
    let componentId = body.componentId;
    let organizations = body.organization;
    try {
        let data = {};
        let component = await database.Components.update({
            name: name,
            description: description,
            updatedBy: req.activeRole[0].roleName
        }, {where: {id: componentId}, individualHooks: true, context: req.session});
        if (component) {
            let savedOrganization = await organizationComponentsEntitlementsDB.getEntitledOrganizationIds(componentId);
            let savedOrganizationArray = [];
            for (let i = 0; i < savedOrganization.length; i++) {
                savedOrganizationArray[i] = savedOrganization[i].organizationId;
            }
            let organizationNeedsToRemove = _.difference(savedOrganizationArray, organizations);
            if (organizationNeedsToRemove.length > 0) {
                organizations = _.remove(organizations, organizationNeedsToRemove);
                console.log(organizations);
            }
            for (let i = 0; i < organizationNeedsToRemove.length; i++) {
                await database.OrganizationComponentEntitlements.destroy(
                    {
                        where: {
                            organizationId: organizationNeedsToRemove[i],
                            componentId: componentId
                        }, individualHooks: true, context: req.session
                    });
                let getAllRolesOfOrganization = await roleDB.getRoleIdsByOrganizationId(organizationNeedsToRemove[i]);
                for (let i = 0; i < getAllRolesOfOrganization.length; i++) {
                    let checkIfEntitlementExistsByRoleAndComponent = await entitlementDB.checkIfEntitlementExistsByRoleAndComponent(getAllRolesOfOrganization[i].id, componentId);
                    if (checkIfEntitlementExistsByRoleAndComponent) {
                        await database.Entitlements.destroy({
                            where: {
                                role: getAllRolesOfOrganization[i].id,
                                component: componentId
                            }, individualHooks: true, context: req.session
                        });
                    }
                }
            }

            let orgCompEntitlement = {};
            for (let i = 0; i < organizations.length; i++) {
                let checkIfOrganizationAssigned = await organizationComponentsEntitlementsDB.getEntitledOrganizationById(organizations[i], componentId);
                if (checkIfOrganizationAssigned) {
                    let updatedEntitlement = await database.Components.update({
                        componentId: componentId,
                        organizationId: organizations[i],
                        updatedBy: req.activeRole[0].roleName
                    }, {where: {id: checkIfOrganizationAssigned.componentId}, individualHooks: true, context: req.session});
                } else {
                    orgCompEntitlement = await database.OrganizationComponentEntitlements.create({
                        id: uuidv4(),
                        componentId: componentId,
                        organizationId: organizations[i],
                        createdBy: req.activeRole[0].roleName
                    }, {individualHooks: true, context: req.session});
                    orgCompEntitlement = {};
                }
                let getAllRolesOfOrganization = await roleDB.getRoleIdsByOrganizationId(organizations[i]);
                for (let i = 0; i < getAllRolesOfOrganization.length; i++) {
                    let checkIfEntitlementExistsByRoleAndComponent = await entitlementDB.checkIfEntitlementExistsByRoleAndComponent(getAllRolesOfOrganization[i].id, componentId);
                    if (!checkIfEntitlementExistsByRoleAndComponent) {
                        await database.Entitlements.create({
                            role: getAllRolesOfOrganization[i].id,
                            component: componentId,
                            hasView: 0,
                            hasCreate: 0,
                            hasDelete: 0,
                            createdBy: req.activeRole[0].roleName
                        }, {individualHooks: true, context: req.session});
                    }
                }
            }
            data = {
                success: true,
                message: "Successfully Updated",
            };
            return res.json(data);
        } else {
            data = {
                success: false,
                message: "Component Update Failed",
            };
            return res.json(data);
        }
    } catch (e) {
        console.log('error', e);
        let data = {
            success: false,
            message: "Technical Error",
            error: e
        };
        res.json({data: data})
    }
};
const deleteComponent = async function (req, res) {
    let componentId = req.params.componentId;
    try {
        let component = await database.Components.destroy(
            {
                where: {
                    id: componentId
                }, individualHooks: true, context: req.session
            });
        if (component) {
            res.redirect('/dashboard/components')
        }
    } catch (e) {
        console.log('e', e)
        res.json({err: e})
    }
};

const getRoles = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    let initialInfo = {};

    let userOrg;
    if (user.usertype === 'carisadmin') {
        userOrg = null;
    } else {
        userOrg = user.org
    }

    initialInfo.roleList = await roleDB.getRoleList(userOrg);
    let orgs;
    if (!userOrg) {
        orgs = await orgDB.getOrgList();
    } else {
        orgs = await orgDB.getOrganizationDetailsById(userOrg)
    }

    initialInfo.orgNames = {};

    if (orgs.length > 1) {
        orgs.forEach(item => {
            initialInfo.orgNames[item.id] = item.name;
        });
    } else {
        initialInfo.orgNames[orgs.id] = orgs.name
    }
    console.log(initialInfo.orgNames)
    initialInfo.roleList.forEach(item => {
        if (!userOrg) {
            item.organization = initialInfo.orgNames[item.organization];
            item.setDataValue('organization', initialInfo.orgNames[item.organization]);
        } else {
            item.organization = initialInfo.orgNames[userOrg]
        }

    });
    res.render('role_list', {
        user: user,
        initialInfo: initialInfo,
        permissions: req.entitlements,
        isRoles: true,
        useDataTables: true
    });
};

const createRoles = async function (req, res) {
    let body = req.body;
    let roleName = body.roleName;
    let organization = body.organization;
    let components = body.components;
    try {
        let data = {};
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            data = {
                success: false,
                message: "Validation Error",
                errors: errors.array()
            };
            res.json(data);
            return;
        }
        let roles = await database.Roles.create({
            roleName: roleName.toLowerCase(),
            organization: organization,
            hasView: 0,
            hasCreate: 0,
            hasDelete: 0,
            createdBy: req.activeRole[0].roleName
        }, {individualHooks: true, context: req.session});
        if (roles.dataValues.id > 0) {
            if (components.length > 0) {
                for (let i = 0; i < components.length; i++) {
                    await database.Entitlements.create({
                        // role: roleName.toLowerCase(),
                        role: roles.dataValues.id,
                        component: components[i].componentId,
                        hasView: components[i].hasView == 'true' ? 1 : 0,
                        hasCreate: components[i].hasCreate == 'true' ? 1 : 0,
                        hasDelete: components[i].hasDelete == 'true' ? 1 : 0,
                        createdBy: req.activeRole[0].roleName
                    });
                }
            }
            data = {
                success: true,
                message: "Successfully Created",
            };
            return res.json(data);
        } else {
            data = {
                success: false,
                message: "Roles Creation Failed!",
            };
            return res.json(data);
        }
    } catch (e) {
        console.log('e', e);
        let data = {
            success: false,
            message: "Roles Creation Failed!",
            error: e
        };
        res.json({data: data})
    }
};
const getOrganizationComponentsById = async function (req, res) {
    let body = req.body;
    let orgId = body.organizationId;
    let roleId = body.roleId;
    try {
        let getComponentsByEntitledOrganizationsAndRoleId;
        if (roleId) {
            getComponentsByEntitledOrganizationsAndRoleId = await componentDB.getComponentsByEntitledOrganizationsAndRoleId(orgId, roleId);
        } else {
            getComponentsByEntitledOrganizationsAndRoleId = await organizationComponentsEntitlementsDB.getComponentsByOrganizationId(orgId);
        }
        res.json({
            success: true,
            components: getComponentsByEntitledOrganizationsAndRoleId,
        });
    } catch (e) {
        res.json({
            success: false,
            errors: e.message
        });
    }
};
const createRoleForm = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };
    let initialInfo = {};
    initialInfo.orgList = await orgDB.getOrgList();
    res.render('role', {
        user: user,
        permissions: req.entitlements,
        initialInfo: initialInfo,
        action: 'create',
        method: 'POST',
        isRoles: true
    });
};
const editRole = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };
    let initialInfo = {};
    initialInfo.orgList = await orgDB.getOrgList();

    let error = false;
    let roleId = req.params.roleId;
    const roleDetails = await roleDB.getRoleDetailsById(roleId);
    if (!roleDetails) {
        error = true;
    }
    res.render('role', {
        user: user,
        permissions: req.entitlements,
        action: 'update',
        method: 'post',
        error: error,
        initialInfo: initialInfo,
        roleDetails: roleDetails,
        isEdit: true,
        isRole: true,
        isRoles: true
    });
};

const updateRoles = async function (req, res) {
    let body = req.body;
    let roleName = body.roleName;
    let organization = body.organization;
    let roleId = body.roleId;
    let components = body.components;
    try {
        let data;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            data = {
                success: false,
                message: "Validation Error",
                errors: errors.array()
            };
            res.json(data);
            return;
        }

        let role = await database.Roles.update({
            roleName: roleName.toLowerCase(),
            organization: organization,
            hasView: 0,
            hasCreate: 0,
            hasDelete: 0,
            updatedBy: req.activeRole[0].roleName,
        }, {where: {id: roleId}, individualHooks: true, context: req.session});
        if (role) {
            if (components.length > 0) {
                for (let i = 0; i < components.length; i++) {
                    await database.Entitlements.upsert({
                        id: components[i].id,
                        role: roleId,
                        component: components[i].componentId,
                        hasView: components[i].hasView == 'true' ? 1 : 0,
                        hasCreate: components[i].hasCreate == 'true' ? 1 : 0,
                        hasDelete: components[i].hasDelete == 'true' ? 1 : 0,
                        updatedBy: req.activeRole[0].roleName
                    }, {individualHooks: true, context: req.session, tableName: 'projectDetails'});
                }
            }
            data = {
                success: true,
                message: "Successfully Updated",
            };
            return res.json(data);
        } else {
            data = {
                success: true,
                message: "Successfully Updated",
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
const deleteRoles = async function (req, res) {
    let roleId = req.params.roleId;
    try {
        let component = await database.Roles.destroy(
            {
                where: {
                    id: roleId
                }, individualHooks: true, context: req.session
            });
        if (component) {
            res.redirect('/dashboard/roles')
        }
    } catch (e) {
        console.log('e', e)
        res.json({err: e})
    }
};
const updateRoleStatus = async function (req, res) {
    let roleId = req.body.roleId;
    let checkedStatus = req.body.checkedStatus;
    let accessType = req.body.accessType;
    let updateData = {};
    updateData[accessType] = checkedStatus;
    updateData['updatedBy'] = req.activeRole[0].roleName;
    try {
        let role = await database.Roles.update(updateData, {
            where: {id: roleId},
            individualHooks: true,
            context: req.session
        });
        if (role) {
            res.redirect('/dashboard/roles')
        }
    } catch (e) {
        console.log('e', e)
        res.json({err: e})
    }
};

const blockOrUnblockUser = async function (req, res) {

    let user = {
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    let userId = req.body.userId;
    let userDetails = await userDB.getUserDetailsById(userId);
    let data = {};
    if (userId !== user.id  && userDetails.email !== "info@hubex.tech") {
        let isLocked = req.body.isLocked;

        try {
            let status = await database.User.update({
                isLocked: isLocked,
                updatedBy: req.activeRole[0].roleName
            }, {where: {id: userId}, individualHooks: true, context: req.session});
            if (status) {
                data = {
                    success: true,
                    message: "Successfully Updated",
                };
                return res.json(data);
            }
        } catch (e) {
            data = {
                success: false,
                message: "Status Update Failed",
            };
            return res.json(data);
        }
    } else {
        data = {
            success: false,
            message: "Status Update Failed! Unable to block parent or self account",
        };
        return res.json(data);
    }

};
const updatePassword = async function (req, res) {
    let userId = req.body.userId;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;
    let data = {};
    try {
        let userCredentials = await database.UserCredentials.findOne({where: {userId: userId}});
        let validPassword = await userCredentials.validPassword(oldPassword);
        if (validPassword) {
            try {
                let updatedPassword = await userCredentials.updatePassword(newPassword);
                let status = await database.UserCredentials.update({
                    password: updatedPassword,
                    updatedBy: req.activeRole[0].roleName
                }, {where: {userId: userId}, individualHooks: true, context: req.session});
                if (status) {
                    data = {
                        success: true,
                        message: "Successfully Updated",
                    };
                    return res.json(data);
                } else {
                    data = {
                        success: false,
                        message: "Password Update Failed.",
                    };
                    return res.json(data);
                }
            } catch (e) {
                data = {
                    success: false,
                    message: "Password Update Failed. Technical Error!",
                };
                return res.json(data);
            }
        } else {
            data = {
                success: false,
                message: "Old Password doesn't match",
            };
            return res.json(data);
        }
    } catch (e) {
        data = {
            success: false,
            message: "Password Update Failed. Technical Error!",
        };
        return res.json(data);
    }
};
const deleteUser = async function (req, res) {
    let user = {
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    let userId = req.body.userId;
    let userDetails = await userDB.getUserDetailsById(userId);
    let data = {};
    if (userId !== user.id && userDetails.email !== "info@hubex.tech") {
        try {
            let component = await database.User.destroy(
                {
                    where: {
                        id: userId
                    },
                    individualHooks: true,
                    context: req.session
                });
            if (component) {
                data = {
                    success: true,
                    message: "Successfully Deleted",
                };
                return res.json(data);
            } else {
                data = {
                    success: false,
                    message: "Deletion Failed",
                };
                return res.json(data);
            }
        } catch (e) {
            data = {
                success: false,
                message: "Deletion failed!",
                error: e,
            };
            return res.json(data);
        }
    } else {
        data = {
            success: false,
            message: "Deletion failed! You cannot delete parent or self account"
        };
        return res.json(data);
    }

};
const uploadProfilePicture = async function (req, res) {
    let data = {};
    try {
        if (req.files.length > 0) {
            data = {
                success: true,
                message: "Successfully Uploaded",
                files: req.files[0]
            };
            return res.json(data);
        } else {
            data = {
                success: false,
                message: "Upload Failed",
            };
            return res.json(data);
        }
    } catch (e) {
        console.log('e', e)
        data = {
            success: false,
            message: "Deletion failed!",
            error: e,
        };
        return res.json(data);
    }

};
const getFormsByOrganizationId = async function (req, res) {
    try {
        let orgId = req.body.orgId;
        let forms = await projectsDB.getFormsByOrgId(orgId);
        res.json({
            success: true,
            forms: forms
        });
    } catch (e) {
        res.json({
            success: false,
            errors: e
        });
    }
};
const createOrganizationsForm = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    let initialInfo = {};

    res.render('organization', {
        user: user,
        initialInfo: initialInfo,
        permissions: req.entitlements,
        action: 'create',
        method: 'POST',
        isOrganization: true
    });
};
const createOrganization = async function (req, res) {
    let body = req.body;
    let name = body.name;
    let email_primary = body.email_primary;
    let email_secundary = body.email_secundary;
    let phone = body.phone;
    let address = body.address;
    let website = body.website;
    let zip = body.zip;
    let logo = body.image;
    try {
        let data;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            data = {
                success: false,
                message: "Validation Error",
                errors: errors.array()
            };
            res.json(data);
            return;
        }
        let organizations = await database.Organization.create({
            id: uuidv4(),
            name: name,
            email_primary: email_primary,
            email_secundary: email_secundary,
            phone: phone,
            address: address,
            website: website,
            zip: zip,
            hasBranding: logo !== "" ? 1 : 0,
            logo: logo,
            createdBy: req.activeRole[0].roleName
        }, {individualHooks: true, context: req.session});
        if (organizations.dataValues.id !== "") {
            data = {
                success: true,
                message: "Successfully Created",
            };
            return res.json(data);
        } else {
            data = {
                success: false,
                message: "Organization Creation Failed!",
            };
            return res.json(data);
        }
    } catch (e) {
        console.log('e', e);
        let data = {
            success: false,
            message: "Organization Creation Failed!",
            error: e
        };
        res.json({data: data})
    }
};
const editOrganization = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };

    let error = false;
    let organizationId = req.params.organizationId;
    const organizationDetails = await orgDB.getOrganizationDetailsById(organizationId);
    if (!organizationDetails) {
        error = true;
    }
    let imageUrl = "";
    if (organizationDetails.logo === '') {
        imageUrl = "/img/hubex-logo-neg.png";
    } else {
        imageUrl = "/uploads/organization/" + organizationDetails.logo;
    }
    res.render('organization', {
        user: user,
        permissions: req.entitlements,
        action: 'update',
        method: 'post',
        error: error,
        organizationDetails: organizationDetails,
        isEdit: true,
        isRole: true,
        isOrganization: true,
        imageUrl: imageUrl
    });
};
const updateOrganization = async function (req, res) {
    let body = req.body;
    let organizationId = body.organizationId;
    try {
        let data;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            data = {
                success: false,
                message: "Validation Error",
                errors: errors.array()
            };
            res.json(data);
            return;
        }
        let organization = await database.Organization.update({
            name: body.name,
            email_primary: body.email_primary,
            email_secundary: body.email_secundary,
            phone: body.phone,
            address: body.address,
            website: body.website,
            zip: body.zip,
            logo: body.image,
            hasBranding: body.image !== "" ? 1 : 0,
            updatedBy: req.activeRole[0].roleName,
        }, {where: {id: organizationId}, individualHooks: true, context: req.session});
        if (organization) {
            data = {
                success: true,
                message: "Successfully Updated",
            };
            return res.json(data);
        } else {
            data = {
                success: false,
                message: "Organization Update Failed",
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
const deleteOrganizations = async function (req, res) {
    let organizationId = req.body.organizationId;
    let data;
    try {
        let organization = await database.Organization.destroy(
            {
                where: {
                    id: organizationId
                },
                individualHooks: true,
                context: req.session
            });
        if (organization) {
            data = {
                success: true,
                message: "Successfully Deleted",
            };
            return res.json(data);
        } else {
            data = {
                success: false,
                message: "Deletion Failed",
            };
            return res.json(data);
        }
    } catch (e) {
        data = {
            success: false,
            message: "Deletion failed! Technical Error",
            error: e,
        };
        return res.json(data);
    }
};
const blockOrUnblockOrganization = async function (req, res) {
    let organizationId = req.body.organizationId;
    let isLocked = req.body.isBlocked;
    let data = {};
    try {
        let status = await database.Organization.update({
            isBlocked: isLocked,
            updatedBy: req.activeRole[0].roleName
        }, {where: {id: organizationId}, individualHooks: true, context: req.session});
        if (status) {
            data = {
                success: true,
                message: "Successfully Updated",
            };
            return res.json(data);
        }
    } catch (e) {
        data = {
            success: false,
            message: "Status Update Failed",
        };
        return res.json(data);
    }
};
const uploadOrganizationLogo = async function (req, res) {
    let data = {};
    try {
        if (req.files.length > 0) {
            data = {
                success: true,
                message: "Successfully Uploaded",
                files: req.files[0]
            };
            return res.json(data);
        } else {
            data = {
                success: false,
                message: "Upload Failed",
            };
            return res.json(data);
        }
    } catch (e) {
        console.log('e', e)
        data = {
            success: false,
            message: "Deletion failed!",
            error: e,
        };
        return res.json(data);
    }

};
const getSettings = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };
    let initialInfo = {};
    res.render('settings', {
        user: user,
        permissions: req.entitlements,
        initialInfo: initialInfo,
        useDataTables: true,
        isSettings: true
    });
};
const getInformation = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };
    let initialInfo = {};
    res.render('information', {
        user: user,
        permissions: req.entitlements,
        initialInfo: initialInfo,
        useDataTables: true,
        isInformation: true
    });
};
const getProjectForms = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };
    let initialInfo = {};
    if (user.usertype === 'carisadmin') {
        initialInfo.formList = await projectFormDB.getAllProjectForms();
    } else {
        initialInfo.formList = await projectFormDB.getAllProjectFormsByOrganizationId(user.org);
    }
    res.render('form_list', {
        user: user,
        initialInfo: initialInfo,
        permissions: req.entitlements,
        isForms: true,
        useDataTables: true,
    });
};
const getCreateProjectForm = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };
    let initialInfo = {};
    initialInfo.orgList = await orgDB.getOrgList();
    res.render('form', {
        user: user,
        permissions: req.entitlements,
        initialInfo: initialInfo,
        action: 'create',
        method: 'POST',
        isForms: true,
    });
};
const createProjectForm = async function (req, res) {
    let body = req.body;
    let organizationId = body.organizationId;
    let projectId = body.projectId;
    let formName = body.formName;
    let formType = body.formType;
    try {
        let data = {};
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            data = {
                success: false,
                message: "Validation Error",
                errors: errors.array()
            };
            res.json(data);
            return;
        }
        let checkIfSameFormExists = await projectFormDB.checkIfSameFormExistsByOrgAndProjectID(organizationId, projectId, formName);
        if (!checkIfSameFormExists) {
            let projectForm = await database.ProjectForms.create({
                id: uuidv4(),
                organizationId: organizationId,
                projectId: projectId,
                formName: formName,
                formType: formType,
                createdBy: req.session.userId
            });
            if (projectForm.dataValues.id !== '') {
                data = {
                    success: true,
                    message: "Successfully Created",
                    result: projectForm
                };
                return res.json(data);
            } else {
                data = {
                    success: false,
                    message: "Form Creation Failed!",
                };
                return res.json(data);
            }
        } else {
            data = {
                success: false,
                message: "Form Already Exists. Try with other Name",
            };
            return res.json(data);
        }
    } catch (e) {
        console.log('e', e);
        let data = {
            success: false,
            message: "Form Creation Failed!",
            error: e
        };
        res.json({data: data})
    }
};
const editProjectForm = async function (req, res) {
    let user = {
        name: req.session.name,
        fullname: req.session.fullname,
        id: req.session.userId,
        email: req.session.email,
        usertype: req.activeRole[0].roleName,
        org: req.session.userorg,
    };
    let initialInfo = {};
    initialInfo.orgList = await orgDB.getOrgList();
    let error = false;
    let projectFormId = req.params.formId;
    const projectFormDetails = await projectFormDB.getProjectFormById(projectFormId);
    const generatedForm = await projectFormDB.getGeneratedForm(projectFormId);
    let generatedFormJson = JSON.stringify(generatedForm.pageData);
    res.render('form', {
        user: user,
        permissions: req.entitlements,
        initialInfo: initialInfo,
        projectFormDetails: projectFormDetails,
        generatedForm: generatedFormJson,
        action: 'update',
        method: 'POST',
        isForms: true,
        isEdit: true
    });
};
const updateProjectForm = async function (req, res) {
    let body = req.body;
    let organizationId = body.organizationId;
    let projectId = body.projectId;
    let formName = body.formName;
    let formType = body.formType;
    let projectFormId = body.projectFormId;

    try {
        let data;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            data = {
                success: false,
                message: "Validation Error",
                errors: errors.array()
            };
            res.json(data);
            return;
        }

        let projectForm = await database.ProjectForms.update({
            organizationId: organizationId,
            projectId: projectId,
            formName: formName,
            formType: formType,
            updatedBy: req.session.userId
        }, {where: {id: projectFormId}, individualHooks: true, context: req.session});

        if (projectForm) {
            data = {
                success: true,
                message: "Successfully Updated",
            };
            return res.json(data);
        } else {
            data = {
                success: false,
                message: "Update Failed",
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
const deleteProjectForm = async function (req, res) {
    let projectFormId = req.body.projectFormId;
    let data;
    try {
        let projectForm = await database.ProjectForms.destroy(
            {
                where: {
                    id: projectFormId
                },
                individualHooks: true,
                context: req.session
            });
        if (projectForm) {
            data = {
                success: true,
                message: "Successfully Deleted",
            };
            return res.json(data);
        } else {
            data = {
                success: false,
                message: "Deletion Failed",
            };
            return res.json(data);
        }
    } catch (e) {
        data = {
            success: false,
            message: "Deletion failed! Technical Error",
            error: e,
        };
        return res.json(data);
    }
};
const checkIfProjectFormNameIsValid = async function (req, res) {
    let body = req.body;
    let formName = body.formName.trim();
    let organizationId = body.organizationId;
    let projectId = body.projectId;
    let data;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            data = {
                success: false,
                message: "Validation Error",
                errors: errors.array()
            };
            res.json(data);
            return;
        }
        let nameValid = await projectFormDB.checkIfSameFormExistsByOrgAndProjectID(organizationId, projectId, formName);
        if (nameValid) {
            data = {
                success: false,
                message: "Name is already exists for this organization and project",
            };
            return res.json(data);
        } else {
            data = {
                success: true,
                message: "Name is available",
            };
            return res.json(data);
        }
    } catch (e) {
        data = {
            success: false,
            message: "Unable to verify name. Technical Error",
            error: e,
        };
        return res.json(data);
    }
};
const saveGeneratedProjectForm = async function (req, res) {
    let body = req.body;
    let projectId = body.projectId;
    let projectFormId = body.projectFormId;
    let pages = body.jsonGenerated;

    let getProject = await projectsDB.getFormById(projectId);
    let getProjectDetails = await projectsDB.getFormDetailsById(projectId);
    let getProjectSettings = await projectsDB.getFormSettingsByFormID(projectId);

    let formStructure = formMatcher.formStructure;

    formStructure.project.name = getProject["name"];
    formStructure.organization.id = getProject['Organization.id'];
    formStructure.organization.name = getProject['Organization.name'];
    formStructure.organization.email_primary = getProject['Organization.email_primary'];
    formStructure.organization.email_secundary = getProject['Organization.email_secundary'];
    formStructure.organization.phone = getProject['Organization.phone'];
    formStructure.organization.address = getProject['Organization.address'];
    formStructure.organization.website = getProject['Organization.website'];
    formStructure.organization.zip = getProject['Organization.zip'];
    formStructure.type = getProject['type'];
    formStructure.remoteUrl = getProjectSettings['apiUrl'];
    formStructure.version = "v1";
    formStructure.marketing.logo = getProjectDetails['logo'];
    formStructure.marketing.footer = getProjectDetails['showFooter'] ? "true" : "";
    formStructure.marketing.style["base-color"] = "#802528";
    formStructure.marketing.style["primary-color"] = getProjectDetails['primaryColor'];
    formStructure.marketing.style["font-family"] = getProjectDetails['fontFamily'];
    formStructure.settings.lang = "es";
    formStructure.settings.autosave = false;
    formStructure.settings.autosaveTime = 0;
    formStructure.useNav = !!getProjectSettings['useNave'];
    formStructure.showNavigation = !!getProjectSettings['showNavigation'];
    formStructure.security.isUniqueUrl = getProjectSettings['isUnique'] ? "true" : "false";
    formStructure.security.expiration = getProjectSettings['expirationTime'] ? getProjectSettings['expirationTime'] : 172800;
    formStructure.security.eSignature.required = getProjectDetails['showSignature'] ? "true" : "false";

    let pageStructureArray = [];

    for (let i = 0; i < pages.components.length; i++) {

        let block = await formMatcher.returnBlockStructure();
        let pageStructure = {
            name: "",
            columns: {
                size: 12,
                block: []
            }
        };

        let eachPage = pages.components[i];
        pageStructure.name = eachPage.title;
        if ('components' in eachPage) {
            for (let pageComponentCount = 0; pageComponentCount < eachPage.components.length; pageComponentCount++) {
                let pageComponent = eachPage.components[pageComponentCount];
                let field1 = await formMatcher.returnFieldStructure();
                if (pageComponent.type === "panel" || pageComponent.type === "fieldset") {
                    pageStructure = await formMatcher.getAllNestedComponents(pageComponent, pageStructure);
                } else if ("columns" in pageComponent) {
                    let pageStructureColumn = {
                        name: "",
                        columns: {
                            size: 12,
                            block: []
                        }
                    };
                    for (let column = 0; column < pageComponent.columns.length; column++) {
                        let eachColumn = pageComponent.columns[column];
                        pageStructureColumn = await formMatcher.getAllNestedComponents(eachColumn,pageStructureColumn);
                    }
                    pageStructure.columns.block.push(pageStructureColumn);
                } else {
                    field1.name = pageComponent.key;
                    field1.type = pageComponent.type;
                    field1.validation = pageComponent.validate;
                    field1.initialValue = pageComponent.defaultValue;
                    field1.isRequired = pageComponent.validate.required;
                    field1.maxLength = pageComponent.validate.maxLength;
                    field1.minLength = pageComponent.validate.minLength;
                    field1.placeholder = pageComponent.placeholder;
                    field1.label = pageComponent.label;
                    field1.mask = pageComponent.mask;
                    field1.disabled = pageComponent.disabled;

                    field1.action = pageComponent.action;
                    field1.helper = pageComponent.helper;
                    field1.list = pageComponent.list;
                    field1.desktopSize = pageComponent.desktopSize;
                    field1.tabletSize = pageComponent.tabletSize;
                    field1.cellphoneSize = pageComponent.cellphoneSize;
                    field1.attached = pageComponent.attached;
                    field1.variation = pageComponent.variation;

                    block.fields.push(field1);
                    field1 = {};
                }
            }
            pageStructure.columns.block.push(block);
        }
        pageStructureArray.push(pageStructure);
    }

    let finalJson = {
        "projectFormId": projectFormId,
        "form": formStructure,
        "page": pageStructureArray,
        "formData": {
            "project": getProject,
            "settings": getProjectSettings,
            "details": getProjectDetails
        },
        "pageData": pages
    };

    try {
        let data;
        const projectForm = mongoose.model('forms', projectFormSchema);
        try {
            let newProjectForm = await projectForm.findOneAndUpdate({"projectFormId": projectFormId}, finalJson, {
                upsert: true,
                new: true
            });
            if (newProjectForm) {
                data = {
                    success: true,
                    message: "Form Saved successfully",
                };
                return res.json(data);
            }
        } catch (e) {
            let data = {
                success: false,
                message: "Couldn't save generated form",
                error: e,
            };
            return res.json(data);
        }
    } catch (e) {
        let data = {
            success: false,
            message: "Technical Error",
            error: e,
        };
        return res.json(data);
    }
};
module.exports = {
    getIndex: getIndex,
    getReports: getReports,
    getCustomerDetails: getCustomerDetails,
    createuser: createuser,
    getUsers: getUsers,
    getOrgs: getOrgs,
    getProjects: getProjects,
    getCreateProjects: getCreateProjects,
    getEditProjects: getEditProjects,
    getUniqueUrls: getUniqueUrls,
    createInvitation: createInvitation,
    editInvitation: editInvitation,
    listInvitations: listInvitations,
    reportRouter: reportRouter,
    getKYCDashboard: getKYCDashboard,
    createUsers: createUsers,
    editUsers: editUsers,
    updateUsers: updateUsers,
    getBICenter: getBICenter,
    getProfile: getProfile,
    createComponent: createComponent,
    getComponentForm: getComponentForm,
    getComponents: getComponents,
    editComponent: editComponent,
    updateComponent: updateComponent,
    deleteComponent: deleteComponent,
    getRoles: getRoles,
    createRoles: createRoles,
    createRoleForm: createRoleForm,
    editRole: editRole,
    updateRoles: updateRoles,
    deleteRoles: deleteRoles,
    updateRoleStatus: updateRoleStatus,
    getReportsByStatus: getReportsByStatus,
    blockOrUnblockUser: blockOrUnblockUser,
    updatePassword: updatePassword,
    deleteUser: deleteUser,
    uploadProfilePicture: uploadProfilePicture,
    getFormsByOrganizationId: getFormsByOrganizationId,
    checkIfProjectFormNameIsValid: checkIfProjectFormNameIsValid,
    getOrganizationComponentsById: getOrganizationComponentsById,
    createOrganizationsForm: createOrganizationsForm,
    createOrganization: createOrganization,
    editOrganization: editOrganization,
    updateOrganization: updateOrganization,
    deleteOrganizations: deleteOrganizations,
    blockOrUnblockOrganization: blockOrUnblockOrganization,
    getSettings: getSettings,
    getInformation: getInformation,
    getProjectForms: getProjectForms,
    getCreateProjectForm: getCreateProjectForm,
    createProjectForm: createProjectForm,
    editProjectForm: editProjectForm,
    updateProjectForm: updateProjectForm,
    deleteProjectForm: deleteProjectForm,
    saveGeneratedProjectForm: saveGeneratedProjectForm,
    uploadOrganizationLogo: uploadOrganizationLogo
};
