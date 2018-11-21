var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var config = require('../utils/config');

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
        res.json({status: 200, auth: true, token: token});
    },(error) => {
        return res.json({status:400, auth:false, message:"Not registered"});
    });
});


router.post('/login', (req,res) => {

    var email = req.body.email;
    var password = req.body.password;

    if(!email || !password){
        res.json({status:400, auth:false, message:"Enter email or password"});
    }else {
        User.findOne({email: email}).then((doc) => {
        var passwordIsValid = bcrypt.compareSync(password,doc.password);
        
        if(!passwordIsValid){
            return res.json({status: 403, auth:false, message:"incorrect password"});
        }else {
            token = jwt.sign({email : doc.email}, config.jwt_secret, {expiresIn: 86400});
            res.json({status: 200, auth: true, token: token});
        }
        },(err) => {
            return res.json({status:400, message:"Email does not exist"});
        })
    }
});


router.post('/forgotpassword', (req, res) => {
    var email = req.body.email;

    if(!email){
        return res.json({status: 404, message: "request body is empty"});
    } else{
        User.findOne({email: email}).then((doc) => {
            // send mail which identifies the user
        }, (err) =>{
            return res.json({status:400, message:"Email does not exist" });
        })
    }
});


router.post('/resetpassword', (req, res) => {
    //token = got from the query string sent to the mail
    // from token email should be obtained
    // email = req.body.email;

    var password = req.body.password;

    if(!password){
        return res.json({status: 400, message: "request object does not contain password"});
    }else {
        var hashedPassword = bcrypt.hashSync(req.body.password);
        // find email and consequently user and replace his password field with the obtained one
    }
    

});

module.exports = router;