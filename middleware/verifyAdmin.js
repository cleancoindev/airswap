var config = require('../utils/config');
var jwt = require('jsonwebtoken');

function verifyAdmin(req, res, next){
    var token = req.headers['x-access-token'] || req.headers['authorization'];

    if(!token){
        return res.json({status:403, auth:false, message:'no token present'});
    }
        jwt.verify(token, config.jwt_secret, (err,decoded) => {
            if(err) {
                return res.json({status:403, auth:false, message:'token can not be verified' });
            }
            
            if(!(decoded.email===config.admin_email)){
                return res.json({status:403, auth:false, message:'forbidden !!'});
            }
            next();           
        });
    }

module.exports = verifyAdmin;