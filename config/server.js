require('dotenv').config();

const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
// const dbPassword 	  = '1234';

const databaseName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT;
const dbHost = process.env.DB_HOST;
const mongoDbPort = process.env.MONGO_PORT;
const mongoDatabaseName = process.env.MONGO_DB_NAME;
const mongoDbHost = process.env.MONGO_DB_HOST;
const secret = process.env.SECRET;
// const stageUrl = "http://67.205.172.161:4516/api/";
// const stageUrl      = 'http://localhost:4516/api/';
const secretRefreshToken = process.env.REFRESH_TOKEN;
const emailServer = process.env.EMAIL_SERVER;
const serverUrl = process.env.SERVER_URL;
const lucyKeys = {
    server: {
        secret: secret,
        serverUrl: serverUrl
    },
    mysqlsvr: {
        database: databaseName,
        user: dbUsername,
        pass: dbPassword,
        port: dbPort,
        host: dbHost,
        dialect: "mysql"
    },
    mongosvr: {
        database: mongoDatabaseName,
        user: "",
        pass: "",
        port: mongoDbPort,
        host: mongoDbHost,
        dialect: "mongodb"
    },
    email: {
        serverUrl: emailServer
    },
    configUrls: {
        // stage: stageUrl,
        methods: {
            getCustomerInformation: "getCustomerInformation",
            setCustomerInformation: "setCustomerInformation",  //TODO to post customer information in forms
            getPoliticalInfo: "getPoliticalInfo",
            getLaboralInfo: "getLaboralInfo",
            getfoundOrigin: "getfoundOrigin",
            getBankingReference: "getBankingReference",
            getExpectedActivity: "getExpectedActivity",
            getFiles: "getFiles",
            setLaboralInfo: "setLaboralInfo",
            setPoliticalInfo: "setPoliticalInfo",
            setfoundOrigin: "setfoundOrigin",
            setBankingReference: "setBankingReference",
            setExpectedActivity: "setExpectedActivity",
            setFiles: "setFiles",
            setSignature: "setSignature",
            getCountStatus: "getCountStatus",
            getAllKYC: "getAllKYC",
            getAllByPending: "getAllByPending",
            getAllByInProgress: "getAllByInProgress",
            getAllByInReview: "getAllByInReview",
            getAllByApproved: "getAllByApproved",
            getAllByDone: "getAllByDone",
            getAllByOpened: "getAllByOpened",
            getAllBySigned: "getAllBySigned",
            deleteDoc: "deleteDoc",
            getKYClistByStatus: "getKYClistByStatus",
            getKYCCountByStatus: "getKYCCountByStatus",
            getKYCInfo: "getKYCInfo",
            getKYBInfo: "getKYBInfo",
            setOwner: "setOwner",
            setStatus: "setStatus",
            setRevision: "setRevision",
            setRejects: "setRejects",
            getAllByRejected: "getAllByRejected",
            getAllByOwner: "getAllByOwner",
            getPDFdata: "getPDFdata",
            getAllAttached: "getAllAttached",
            getAdditionalSigners: "getAdditionalSigners",
            setAdditionalSigners: "setAdditionalSigners",
            setFoundOriginsFiles: "setFoundOriginsFiles",
            getAllKYB: "getAllKYB",
            getRfcInfo: "getRfcInfo",
            getFIELInfo: "getFIELInfo",
            getDomicilioInfo: "getDomicilioInfo",
            getContactoInfo: "getContactoInfo",
            getActaInfo: "getActaInfo",
            getAccionistasInfo: "getAccionistasInfo",
            getApoderadosInfo: "getApoderadosInfo",
            getTablaAccionariaRecordsInfo: "getTablaAccionariaRecordsInfo",
            getTablaApoderadosRecordsInfo: "getTablaApoderadosRecordsInfo",
            getTablaAccionariaSingleRecordInfo: "getTablaAccionariaSingleRecordInfo",
            getTablaApoderadosSingleRecordInfo: "getTablaApoderadosSingleRecordInfo",
            sendMailboxMessageReply: "sendMailboxMessageReply",
        }
    },
    jwt: {
        secret: secret,
        secretRefreshToken: secretRefreshToken,
        token: {
            lifeTime: 3600
        },
        refreshToken: {
            lifeTime: 604800 //1 week
        }
    },
    sendGrid: {
        apiKey: process.env.SENDGRID_API_KEY,
        emailFrom: process.env.EMAIL_FROM
    }
};

console.log("Configured DB Host: " + lucyKeys.mysqlsvr.host);

module.exports = lucyKeys;
