var User = require('../models/user');
var config = require('../utils/config');

function isBlocked(req, res, next){
    email = req.email;

    if(!email){
        res.json({status: 400, message: "Invalid input for request"});
    }

    User.findOne({email: email}).then((user) => {
        if(user.verified == false && user.email != config.admin_email){
            return res.json({status: 400, message: "User is currently blocked"});
        }
        next();
    }).catch((err) => {
        return res.json({status: 400, message: "email does not exist"});
    });
}

module.exports = isBlocked;