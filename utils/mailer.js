var nodemailer = require('nodemailer');
var config = require('../utils/config');

var smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.mailer_email,
        pass: config.mailer_password
    }
});

module.exports = smtpTransport;