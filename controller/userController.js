var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var bcrypt = require('bcryptjs');
var config = require('../utils/config');
var smtpTransport = require('../utils/mailer');
var verifyToken = require('../middleware/verifyToken');
var handlebars = require('handlebars');
var readHTMLFile = require('../utils/readfile');
var isBlocked = require('../middleware/verifyBlocked');


router.post('/forgotpassword', (req, res) => {
    var email = req.body.email;

    if(!email){
        return res.json({status: 404, message: "request data is incorrect"});
    } else{
        User.findOne({email: email}).then((user) => {
            var user = user;
            var redirectUrl = config.reset_password_url + jwt.sign({email : user.email}, config.jwt_secret, {expiresIn: 86400});

            if(user.verified == true || email == config.admin_email){
                readHTMLFile(__dirname + '/../templates/forgotpassword.html', function(err, html) {
                    if(err){
                        return res.json({status:404, message:"template fetch error" });
                    }
                    
                    var template = handlebars.compile(html);
                    var replacements = {
                        username: user.name,
                        redirectUrl: redirectUrl
                    }
                    var htmlToSend = template(replacements);
                    var data = {
                        to: user.email,
                        from: config.admin_email,
                        subject: 'Nexswap, Password Reset Confirmation',
                        html: htmlToSend
                    };
                    smtpTransport.sendMail(data, function(err) {
                        if (!err) {
                            return res.json({ message: 'Password reset mail sent' });
                        }else {
                            console.log('mail send error', err);
                            return res.json({status: 400}); 
                        }
                    });
                });
            } else {
                return res.json({status: 400, message: "User is currently blocked"});
            }
            
        }).catch((err) =>{
            return res.json({status:400, message:"Email does not exist" });
        })
    }
});


router.post('/resetpassword', verifyToken, isBlocked, (req, res) => {
    var email = req.email;
    var password = req.body.password;

    if(!password){
        return res.json({status: 400, message: "request object does not contain password"});
    }else if(!email){
        return res.json({status: 400, message: "token missing"});
    }else{
        var hashedPassword = bcrypt.hashSync(req.body.password);

        User.findOne({email: email}).then((user) => {
            if(user.password == hashedPassword){
                return res.json({status: 400, message: "You are entering your old password"});
            }
            user.password = hashedPassword;
            user.save().then((doc) => {
                return res.json({status: 200, message: "Password changed successfully"});
            }).catch((err) => {
                return res.json({status: 400, message: "error saving password"});
            });
        }).catch((err) => {
            return res.json({status: 400, message: "email does not exist"});
        });
    }
});


router.post('/updateusername', verifyToken, isBlocked, (req,res) => {
    var email = req.email;
    var username = req.body.username;

    if(!email || !username){
        return res.json({status: 400, message: "Invalid data or unauthorized request"});
    }

    User.findOne({email: email}).then((user) => {
        // username changed and saved below
        user.name = username;
        user.save().then((doc) => {
            return res.json({status: 200, message: "Username changed successfully"});
        }).catch((err) => {
            return res.json({status: 400, message: "Error saving username"});
        });
    }).catch((err) => {
        return res.json({status: 400, message: "Email does not exist"});
    });
});

router.get('/getuser/', verifyToken, isBlocked, (req,res) => {

	var email = req.query.email;
    
    if(!email){
		return res.json({status: 400, message: "request object does not contain email"});
    }else if(req.email !== config.admin_email && req.email !== email){
        return res.json({status: 400, message: "Unauthorized request"});
    }
    
	User.findOne({email: email}).then((user) => {
		return res.json({status: 200, user: user});
	}).catch((err) => {
		return res.json({status: 400, message: "User cannot be fetched from the database"})
	});	
});

module.exports = router;