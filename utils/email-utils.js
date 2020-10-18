const sgMail = require('@sendgrid/mail');
const server = require('../config/server');

sgMail.setApiKey(`${server.sendGrid.apiKey}`);

const sendEmail = function (to, subject, htmlBody) {
    let msg = {
        to: to,
        from: `${server.sendGrid.emailFrom}`,
        subject: subject,
        html: htmlBody,
    };
    return sgMail.send(msg);
};

module.exports = {
    sendEmail: sendEmail
};
