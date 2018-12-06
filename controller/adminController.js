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
var multer = require('multer');


const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'./uploads/');
    },
    filename: (req,file,cb) => {
        cb(null,new Date().toISOString() + file.originalname);
    } 
});

    const fileFilter = (req,file,cb) => {

        if(file.mimetype !== 'image/jpeg' || file.mimetype !== 'image/png') {
            cb(null,false);
        } 
            cb(null,true);        
    }

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});


router.post('/createadmin', (req,res) => {

    var email = req.body.email;
    var password = req.body.password;

    if(!email || !password){
        res.json({status:400, auth:false, message:"Enter email and password"});
    }

    if(email !== config.admin_email){
        res.json({status: 400, auth: false, message: "Incorrect credentials"});
    }

    if(req.body.password){
        var hashedPwd = bcrypt.hashSync(password);
    }

    let admin = new Admin({
        email: email,
        password: hashedPwd        
    });

    admin.save().then((admin) => {
        return res.json({status:200 ,message: 'Admin created', email: admin.email});
    }).catch((err) => {
        return res.json({status:400, message: 'Admin exists'});
    });

})

router.post('/adminlogin', (req,res) => {
    var email = req.body.email;
    var password = req.body.password;

    if(!email || !password){
        res.json({status:400, auth:false, message:"Enter email and password"});
    }

    Admin.findOne({email: email}).then((admin) => {
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

router.post('/addimage',VerifyAdmin,upload.single('coinImage'),(req,res) => {

    var address = req.body.address;
    var coinImage = req.file;

    if(!address || !coinImage){
        return res.json({status: 400, message: "Input incorrect"});
    }

    Coin.findOneAndUpdate({address: address}, {$set:{coinImage: coinImage.path}}).then((coin) => {
        return res.json({status: 200, message: coin.address + " image added..!!"})
    }).catch((err) => {
        return res.json({status: 200, file: req.file.originalname, message: "Coin address doesn't exist"});
    });
    
});

router.post('/addcoins', VerifyAdmin,(req,res) => {

    // array of address arrive
    var coinDetails = req.body.details;
    //var price = req.body.price;
    if(!coinDetails){
        res.json({status:400, auth:false, message:"Enter appropriate data"});
    }
    var count = 0;
    for(i=0; i<coinDetails.length; i++) {
        //coininfo is got from etherscan and stored in db
        var coinInfo = web3.getTokenInfo(coinDetails[i].address).then((result) => {
                       
            let coinInstance = new Coin({
                address : result.tokenAddress,
                symbol: result.symbol,
                decimals : result.decimals,
                contractABI : result.contractABI,
                price: coinDetails[count].price
            });
            coinInstance.save().then((doc) => {                
                count++;
                if(count === coinDetails.length){
                    return res.json({status:200, auth:true ,message:"Success"});
                }
            }).catch((err) => {
                return res.json({status:500, auth:false ,message:"Error cannot save to database"});
            }); 
        }).catch((err) => {
            return res.json({status:500, auth:false ,message:"Not able to retrieve contract information"});
        });
    }
});

router.get('/getusers', VerifyAdmin, (req,res) => {
    User.find().then((users)=> {
        res.json({status: 200, users: users});
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
    });

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

router.get('/usercount', VerifyAdmin, (req,res) => {
    User.count().then((count) => {
        return res.json({status: 200, count: count});
    }).catch((err) => {
        return res.json({status: 400, message: "Service is currently not available"});
    });
});

router.get('/coincount', VerifyAdmin, (req,res) => {
    Coin.count().then((count) => {
        return res.json({status: 200, count: count});
    }).catch((err) => {
        return res.json({status: 400, message: "Service is currently not available"});
    });
});

module.exports = router;