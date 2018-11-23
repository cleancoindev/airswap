var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var config = require('../utils/config');
var smtpTransport = require('../utils/mailer');
var handlebars = require('handlebars');
var readHTMLFile = require('../utils/readfile');
var fs = require('fs');

router.post('/register', (req,res) => {

    if(req.body.password){
        var hashedPwd = bcrypt.hashSync(req.body.password);
    }

    let user = new User({
        name: req.body.name,
        password: hashedPwd,
        email: req.body.email
    });
    
    user.save().then((doc) => {
        let token = jwt.sign({email : doc.email}, config.jwt_secret, {expiresIn: 86400});

        var redirectUrl = config.login_url + token;

        readHTMLFile(__dirname + '/../templates/signup.html', function(err, html) {
            if(err){
                return res.json({status:400, message:"template fetch error" });
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
                subject: 'Confirm your registration with Nexswap',
                html: htmlToSend
            };
            smtpTransport.sendMail(data, function(err) {
                if (!err) {
                    return res.json({ message: 'Signup confirmation email sent' });
                }else {
                    console.log('mail send error', err);
                    return res.json({status: 400}); 
                }
            });
        });
    }).catch((error) => {
        return res.json({status:400, message:"Not registered"});
    });
});


router.post('/login', (req,res) => {

    var email = req.body.email;
    var password = req.body.password;
    var token = req.headers['x-access-token'] || req.headers['authorization'];
    var verified = false;
    
    if(!email || !password){
        res.json({status:400, auth:false, message:"Enter email or password"});
    }

    function verifypwd(email){
        User.findOne({email: email}).then((user) => {
            var passwordIsValid = bcrypt.compareSync(password, user.password);
            
            if(!passwordIsValid){
                return res.json({status: 403, auth:false, message:"incorrect password"});
            }else {
                if(verified == true){
                    user.verified = true;
                    user.save().then((doc) => {
                        console.log("user verified status changed");
                    }).catch((err) => {
                        return res.json({status: 400, message: "error verifiying user, try after sometime"});
                    });
                }
                token = jwt.sign({email: user.email}, config.jwt_secret, {expiresIn: 86400});
                res.json({status: 200, auth: true, token: token});
            }
        }).catch((err) => {
            return res.json({status:400, message:"Email does not exist"});
        })
    }

    if(!token){
        //check user verified, then normal login
        User.findOne({email: email}).then((user) => {
            if(user.verified == true){
                verifypwd(email);
            }else{
                res.json({status: 400, message: "confirm your registration by clicking on the mail"});
            }
        }).catch((err) => {
            return res.json({status:400, message:"Email does not exist"});
        });       
    }else{
        //verify token, decode and change user verified
        jwt.verify(token, config.jwt_secret, (err,decoded) => {
            if(err) {
                return res.json({status:403, auth:false, message:'token cannot be decoded' });
            }
            if(email == decoded.email){
                User.findOne({email:email}).then((user) => {
                    verified = true;
                    verifypwd(email);
                }).catch((err) => {
                    return res.json({status: 403, message: 'Email does not exist'});
                });
            }else{
                return res.json({status: 403, message: "token cannot be verified"})
            }
        });
    }
});    

module.exports = router;