var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var config = require('../utils/config');
const verifyToken = require('../middleware/verifyToken');

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


router.post('/resetpassword', verifyToken, (req, res) => {
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

module.exports = router;