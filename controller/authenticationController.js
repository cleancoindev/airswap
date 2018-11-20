var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var config = require('../utils/config');
var verifyToken = require('../middleware/verifyToken');


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
        res.json({status: 200, auth: true, token: token})
    },(error) => {
        console.log('error inserting to db');
    });
});


router.post('/login', (req,res) => {

    email = req.body.email;
    password = req.body.password;

    if(!email || !password){
        console.log("Please enter email and password");
    }else {
        User.findOne({email: email}).then((doc) => {
        var passwordIsValid = bcrypt.compareSync(doc.password, password);
        if(!passwordIsValid){
            console.log("Password entered is incorrect");
        }else {
            token = jwt.sign({email : doc.email}, config.jwt_secret, {expiresIn: 86400});
            res.json({status: 200, auth: true, token: token})
        }
        },(err) => {
            console.log("Sorry, requested email not found");
        })
    }
});

router.get('/blahblah',verifyToken, (req,res) => {
    console.log('working.. !!');
    res.json({status: 200, emailId: req.email})
});

module.exports = router;