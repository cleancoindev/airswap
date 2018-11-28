var express = require('express');
var router = express.Router();
var web3 = require('./web3Controller');
var VerifyAdmin = require('../middleware/verifyAdmin');
var Coin = require('../models/coins');
var User = require('../models/user');
var config = require('../utils/config');
var Admin = require('../models/admin');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


router.post('/createAdmin', (req,res) => {

    var email = req.body.email;
    var password = req.body.password;

    if(!email || !password){
        res.json({status:400, auth:false, message:"Enter email and password"});
    }

    if(req.body.password){
        var hashedPwd = bcrypt.hashSync(password);
    }

    let admin = new Admin({
        email: email,
        password: hashedPwd        
    });

    admin.save().then((admin) => {
        return res.json({status:200 ,message: 'Admin created', email:admin.email});
    }).catch((err) => {
        return res.json({status:400, message:"Email does not exist"});
    });

})

router.post('/adminLogin',(req,res) => {
    var email = req.body.email;
    var password = req.body.password;

    if(!email || !password){
        res.json({status:400, auth:false, message:"Enter email and password"});
    }

    Admin.findOne({email: email}).then((admin) => {
            console.log(admin);
            var passwordIsValid = bcrypt.compareSync(password, admin.password);
            if(!passwordIsValid){
                return res.json({status: 403, auth:false, message:"incorrect password"});
            } else {
                token = jwt.sign({email: admin.email}, config.jwt_secret, {expiresIn: 86400});
                res.json({status: 200, auth: true, token: token ,email:admin.email});
            }
        }).catch((err) => {
            return res.json({status:400, message:"Email does not exist"});
        });
});

router.post('/addcoins', VerifyAdmin, (req,res) => {

    // array of address arrive
    var coinAddress = req.body.address;
    var price = req.body.price;

    if(!coinAddress || !price){
        res.json({status:400, auth:false, message:"Enter appropriate data"});
    }
    
    var count = 0;
    for(i=0; i<coinAddress.length; i++) {

        //coininfo is got from etherscan and stored in db
        var coinInfo = web3.getTokenInfo(coinAddress[i]).then((result) => {

            let coinInstance = new Coin({
                address : result.tokenAddress,
                symbol: result.symbol,
                decimals : result.decimals,
                contractABI : result.contractABI,
                price: price[count]
            });

            coinInstance.save().then((doc) => {
                count++;
                if(count === coinAddress.length){
                    return res.json({status:200, auth:true ,message:"Success"});
                }

            }).catch((err) => {
                return res.json({status:500, auth:false ,message:"Error cannot save to db"});
            }); 

        }).catch((err) => {
            return res.json({status:500, auth:false ,message:"Not able to retrieve contract information"});
        });
    }
});

router.get('/getusers', VerifyAdmin, (req,res) => {
    User.find().then((doc)=> {
		var userArray = [];
		for(i =0;i<doc.length;i++) {
            userArray.push({name: doc[i].name, password: doc[i].password, email: doc[i].email, verified: doc[i].verified});
            if(i == doc.length - 1){
                res.json({status: 200, users: userArray})
            }
		}
	}).catch((err) => {
		return res.json({status:400, auth:false ,message:"Coins cant be fetched from the database"});
	});
});

router.post('/deleteuser', VerifyAdmin, (req,res) => {
    var email = req.body.email;
    if(!email){
        return res.json({status: 400, message: "Input incorrect"});
    }else if(email == config.admin_email){
        return res.json({status: 400, message: "Cannot remove admin"});
    }
    User.findOneAndDelete({email: email}).then((user) => {
        return res.json({status: 200, message: user.email + " deleted"})
    }).catch((err) => {
        return res.json({status: 400, message: "Cannot find user"});
    })
});

router.post('/updateprice', VerifyAdmin, (req,res) => {
    var address = req.body.address;
    var price = req.body.price;

    if(!address || !price){
        return res.json({status: 400, message: "Input incorrect"});
    }
    Coin.findOneAndUpdate({address: address}, {$set:{price: price}}).then((coin) => {
        return res.json({status: 200, message: coin.address + " updated"})
    }).catch((err) => {
        return res.json({status: 400, message: "Cannot find coin"});
    })

});

router.post('/deletecoins', VerifyAdmin, (req,res) => {
    var address = req.body.address;
    if(!address){
        return res.json({status: 400, message: "Input incorrect"});
    }
    Coin.findOneAndDelete({address: address}).then((coin) => {
        return res.json({status: 200, message: coin.address + " deleted"})
    }).catch((err) => {
        return res.json({status: 400, message: "Cannot find coin"});
    })
});

router.post('/changestatus', VerifyAdmin, (req,res) => {
    var email = req.body.email;

    if(!email){
        res.json({status:400, auth:false, message:"Enter appropriate data"});
    }

    User.findOne({email: email}).then((user) => {
        if(user.verified == true){
            user.verified = false;
        }else{
            user.verified = true;
        }
        user.save().then((doc) => {
            return res.json({status: 200, message: "User status changed to " + doc.verified });
        }).catch((err) => {
            return res.json({status: 400, message: "error verifiying user, try after sometime"});
        });
    }).catch((err) => {
        return res.json({status:400, auth:false ,message:"User not found"});
    })
});

module.exports = router;