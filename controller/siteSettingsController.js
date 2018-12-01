var express = require('express');
var router = express.Router();
var SiteStrings = require('../models/siteSettings');
var verifyAdmin = require('../middleware/verifyAdmin');


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

	SiteStrings.findOneAndUpdate({id: id}, updateObject, {upsert: true}).then((siteStrings) => {
		return res.json({status: 200, message: "Site settings updated"})
	}).catch((err) => {
		return res.json({status: 400, message: "Cannot update site settings"});
	})
});

module.exports = router;