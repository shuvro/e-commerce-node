const sgMail = require('@sendgrid/mail');
const moment = require('moment');
const server = require('../../config/server')
// sgMail.setApiKey(server.mailsvr.sendgrid);
const axios = require("axios");


const sendOTPbyEmail = async (params)=> {
    
    const url = `${server.email.serverUrl}/sendEmail`;
    // const url = `http://localhost:4516/api/${config.configUrls.methods.getCustomerInformation}/${decoded.data}`;
    const _config = {
        method: 'post',
        url: url,
        // headers: {
        //     Authorization: 'Bearer ' + token //the token is a variable which holds the token
        // },
        data: {
          logo_url: `${server.server.serverUrl}/img/${params.logo_url}`,
          otp: params.otp,
          from: params.from,
          to: params.to,
          user: params.user,
          primaryColor: params.primaryColor
        }
      }

      console.log('_config',_config);

      try {
        const response = await axios(_config);            
        return response.data;
      }catch(e){
          console.log('erro sendOTPbyEmail>', e)
      }

}

const sendRequestInfoEmail  = async (params)=> {
    
    const url = `${server.email.serverUrl}/sendRequestInfoEmail`;
    // const url = `http://localhost:4516/api/${config.configUrls.methods.getCustomerInformation}/${decoded.data}`;
    const _config = {
        method: 'post',
        url: url,
        // headers: {
        //     Authorization: 'Bearer ' + token //the token is a variable which holds the token
        // },
        data: {
          logo_url: `${server.server.serverUrl}/img/${params.logo_url}`,
          message: params.message,
          from: params.from,
          to: params.to,
          user: params.user,
          primaryColor: params.primaryColor,
          brandUrl: params.brandUrl
        }
      }

      console.log('_config',_config);

      try {
        const response = await axios(_config);            
        return response.data;
      }catch(e){
          console.log('erro sendOTPbyEmail>', e)
      }

}





const sendThanksEmail  = async (params)=> {
    
    const url = `${server.email.serverUrl}/sendThanksEmail`;
    // const url = `http://localhost:4516/api/${config.configUrls.methods.getCustomerInformation}/${decoded.data}`;
    const _config = {
        method: 'post',
        url: url,
        // headers: {
        //     Authorization: 'Bearer ' + token //the token is a variable which holds the token
        // },
        data: {
          logo_url: `${server.server.serverUrl}/img/${params.logo_url}`,
          message: params.message,
          from: params.from,
          to: params.to,
          user: params.user,
          primaryColor: params.primaryColor,
        }
      }

      console.log('_config',_config);

      try {
        const response = await axios(_config);            
        return response.data;
      }catch(e){
          console.log('erro sendThanksEmail>', e)
      }

}

const sendContracargosDetailsEmail = (obj)=> {
    // console.log('sendContracargosDetailsEmail',obj)
    // let lang = 'Español';
    // const msg = {
    //     to: obj.email,
    //     from: { email : 'lucy@hubex.tech' , name: 'Lucy @ Hubex.tech'},
    //     subject: 'Revisión de información',
    //     html: `<h5 style="text-transform: capitalize;">Hola ${obj.name}</h5> 
    //             <br>  
    //             <p>${obj.msg}</p>
    //             <p>${obj.footer}</p>`,
    //   };
    //   return sgMail.send(msg);
}

const encrypUserEmail = (email) => {
    

    // let initial = email.charAt(0);
    // let domain = email.split('@');
    // let encrypted = `${initial}****@${domain[1]}`;

    // return encrypted;
}

module.exports = {
    sendOTPbyEmail: sendOTPbyEmail,
    encrypUserEmail: encrypUserEmail,
    sendContracargosDetailsEmail: sendContracargosDetailsEmail,
    sendRequestInfoEmail: sendRequestInfoEmail,
    sendThanksEmail: sendThanksEmail
}