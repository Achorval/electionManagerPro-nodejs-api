const nodemailer = require("nodemailer");
const templates = require('../mailer/templates');

const emailTransport = { 
    default: {
        host: "smtp.mailtrap.io",
        port: 2525,
        secure: false, 
        auth: {
            user: '899d7c559784f8', 
            pass: 'b547d7cdd6739e',
        },
        tls: {
            rejectUnauthorized: false
        }
    },
} 

const defaultOptions = {
    transport: 'default', 
    options: {from:'', to:'', subject:''}, 
    text:'', 
    html: {template:'', vars:{}}
}

const sendMail = (options = defaultOptions) => {
    let transporter = nodemailer.createTransport(emailTransport[options.transport]);
    let template = templates[options.html.template];
    let htmlTemplate = template({...options.html.vars});
    let message = {
        ...options.options,
        text: options.text,
        html: htmlTemplate
    }

    return transporter.sendMail(message);
};

module.exports = {
  sendMail
}
