var express = require('express');
var router = express.Router();
var SiteStrings = require('../models/siteSettings');
var verifyAdmin = require('../middleware/verifyAdmin');
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


router.get('/getstrings', verifyAdmin, (req, res) => {
    SiteStrings.find().then((strings)=> {
		return res.json({status: 200, strings: strings});
	}).catch((err) => {
		return res.json({status:400, message:"Strings cannot be fetched from the database"});
	});
});

router.post('/poststrings', verifyAdmin, (req,res) => {
	updateObject = {};
	var id = 1;
	if(req.body.fblink) updateObject.fblink = req.body.fblink;
	if(req.body.twitterlink) updateObject.twitterlink = req.body.twitterlink;
	if(req.body.redditlink) updateObject.redditlink = req.body.redditlink;
	if(req.body.homepage) updateObject.homepage = req.body.homepage;
	if(req.body.copyright) updateObject.copyright = req.body.copyright;
	if(req.body.sitename) updateObject.sitename = req.body.sitename;
	if(req.body.supportmailid) updateObject.supportmailid = req.body.supportmailid;
	if(req.body.wethcontract) updateObject.wethcontract = req.body.wethcontract;
	if(req.body.adminaddress) updateObject.adminaddress = req.body.adminaddress;
	if(req.body.nexswapaddress) updateObject.nexswapaddress = req.body.nexswapaddress;

	SiteStrings.findOneAndUpdate({id: id}, updateObject, {upsert: true}).then((siteStrings) => {
		return res.json({status: 200, message: "Site settings updated"})
	}).catch((err) => {
		return res.json({status: 400, message: "Cannot update site settings"});
	})
});

router.post('/addlogo',verifyAdmin,upload.single('logoImage'),(req,res) => {

    var logoImage = req.file;

    if(!logoImage){
        return res.json({status: 400, message: "Input incorrect"});
    }

    SiteStrings.findOneAndUpdate({id: id}, {$set:{logoImage: logoImage.path}}).then((coin) => {
        return res.json({status: 200, message: "logo image added..!!"})
    }).catch((err) => {
        return res.json({status: 200, file: req.file.originalname, message: "Logo Image adding failed"});
    });
    
});

router.post('/addfavicon',verifyAdmin,upload.single('favIcon'),(req,res) => {

    var favIcon = req.file;

    if(!favIcon){
        return res.json({status: 400, message: "Input incorrect"});
    }

    SiteStrings.findOneAndUpdate({id: id}, {$set:{favIcon: favIcon.path}}).then((coin) => {
        return res.json({status: 200, message: "Fav Icon added..!!"})
    }).catch((err) => {
        return res.json({status: 200, file: req.file.originalname, message: "Fav Icon adding failed"});
    });
    
});

module.exports = router;