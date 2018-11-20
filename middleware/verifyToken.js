var config = require('../utils/config');
var jwt = require('jsonwebtoken');

function verifyToken(req, res, next){
    var token = req.headers['x-access-token'] || req.headers['authorization'];

    if(!token){
        return res.json({status:403, auth:false, message:'no token present'});
    }
        jwt.verify(token, config.jwt_secret, (err,decoded) => {
            if(err) {
                return res.json({status:403, auth:false, message:'token can not be verified' });
            }
            req.email = decoded.email;
            next();           
        });
    }

module.exports = verifyToken;