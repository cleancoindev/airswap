var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../userComponent/user');
var config = require('../utils/config');
var smtpTransport = require('../utils/mailer');
var handlebars = require('handlebars');
var readHTMLFile = require('../utils/readfile');
var fs = require('fs');

router.post('/register', (req,res) => {

    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;

    if(!email || !password || !name){
        return res.json({status:400, auth:false, message:"Incorrect data"});
    }

    if(req.body.password){
        var hashedPwd = bcrypt.hashSync(password);
    }

    let user = new User({
        name: name,
        password: hashedPwd,
        email: email,
        verified: false
    });
    
    user.save().then((doc) => {
        let token = jwt.sign({email : doc.email}, config.jwt_secret, {expiresIn: 86400});

        var redirectUrl = config.user_login_url + token;

        readHTMLFile(__dirname + '/../templates/signup.html', (err, html) => {
            if(err){
                return res.json({status:400, message:"template fetch error" });
            }
            
            var template = handlebars.compile(html);
            var replacements = {
                username: doc.name,
                redirectUrl: redirectUrl
            }
            var htmlToSend = template(replacements);
            var data = {
                to: doc.email,
                from: config.admin_email,
                subject: 'Confirm your registration with Nexswap',
                html: htmlToSend
            };
            smtpTransport.sendMail(data, function(err) {
                if (!err) {
                    return res.json({status:200 ,message: 'Signup confirmation email sent', email:data.to , verified: doc.verified});
                }else {
                    return res.json({status: 400 ,message: 'mail send error'}); 
                }
            });
        });
    }).catch((error) => {
        return res.json({status:400, message:"Already registered. Please Sign up."});
    });
});


router.post('/login', (req,res) => {

    var email = req.body.email;
    var password = req.body.password;
    var token = req.headers['x-access-token'] || req.headers['authorization'];
    var verified = false;
    
    if(!email || !password){
        res.json({status:400, auth:false, message:"Enter email and password"});
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
                    }).catch((err) => {
                        return res.json({status: 400, message: "error verifiying user, try after sometime"});
                    });
                }
                token = jwt.sign({email: user.email}, config.jwt_secret, {expiresIn: 86400});
                res.json({status: 200, auth: true, token: token ,email:user.email, verified:user.verified ,name: user.name});
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
                res.json({status: 400, message: "confirm your registration by clicking on the mail" , email:user.email, verified:user.verified});
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