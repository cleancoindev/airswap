var nodemailer = require('nodemailer');
var config = require('../utils/config');

var smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.admin_email,
        pass: config.mailer_password
    }
});

module.exports = smtpTransport;