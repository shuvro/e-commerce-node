const moment = require('moment');
const database = require('../../config/database');
const server = require('../../config/server');
const Sequelize = require('sequelize');

const apiResponse = (status,message,err)=> {

	let response = {};
		response.status = status;
		response.result = message;
		response.timestamp = moment()


		if(err){
			response.error	= message;
			response.result = '';
		}

		return response;

}

const getIpAddressFromRequest = (request) => {
  let ipAddr = request.connection.remoteAddress;

  if (request.headers && request.headers['x-forwarded-for']) {
    [ipAddr] = request.headers['x-forwarded-for'].split(',');
  }

  return ipAddr;
};

const basicAuth = async (req, res, next) => {
   

    // check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    if(!req.body.project){ 
    	return res.status(401).json({ message: 'Incorrect Number of parameters passed' });
    }

    // verify auth credentials
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    try{
    	let ip = getIpAddressFromRequest(req);  
       	
        let user = await database.User.findOne({raw: true,where:{ email:username }})
        if (!user) {
            return res.json(apiResponse('false','API user does not exists ',true));
        }
        let userCredentials = await database.UserCredentials.findOne({where:{ userId:user.id,apiKey: password}})
        
        if (!userCredentials) {
            return res.json(apiResponse('false','API user has no credentials ',true));
        }

        var form = await database.Projects.findOne({raw: true,where:{formId:req.body.project, organizationId: user.organizationId}})

        if (!form) {
            return res.json(apiResponse('false','Invalid Project Credentials',true));
        }else{
        	req.user = user;
        	req.project = form;
        }
	   
    }catch(e){
    	console.log('e',e)
    	return res.status(401).json({ message: 'Invalid Authentication Credentials' });
    }
    next();
}


const getDefaultProject = (session)=>{
    if(!session.projectsOwnered){
        console.log('err getDefaultProject, user must have project in session')
    }

    let defaultOrg = '';

    if(session.projectsOwnered.length > 0){
        defaultOrg = session.projectsOwnered[0]
    }

    return defaultOrg;
}

module.exports = {
	apiResponse: apiResponse,
	basicAuth: basicAuth,
    getIpAddressFromRequest: getIpAddressFromRequest,
    getDefaultProject: getDefaultProject
}
