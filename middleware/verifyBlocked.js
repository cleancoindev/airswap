var User = require('../userComponent/user');
var config = require('../utils/config');

function isBlocked(req, res, next){

    email = req.email;

    if(!email){
        res.json({status: 400, message: "Invalid input for request"});
    }

    if(!(email == config.admin_email)){
        User.findOne({email: email}).then((user) => {
            if(user.verified == false){
                return res.json({status: 400, message: "User is currently blocked"});
            }    
            next();
        }).catch((err) => {
            return res.json({status: 400, message: "email does not exist"});
        });
    }else {
        next();
    }
}

module.exports = isBlocked;
