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
	var id = 1;
	var fblink = req.body.fblink || 'fb link goes here';
	var twitterlink = req.body.twitterlink || 'twitter link goes here';
	var redditlink = req.body.redditlink || 'reddit link goes here';
	var homepage = req.body.homepage || 'homepage default content';
	var copyright = req.body.copyright || 'copyright default content';

	console.log("fblink", fblink);
	updateObject = {fblink : fblink, twitterlink: twitterlink, redditlink: redditlink, 
		homepage: homepage, copyright: copyright};

	SiteStrings.findOneAndUpdate({id: id}, updateObject, {upsert: true}).then((siteStrings) => {
			return res.json({status: 200, message: "Site settings updated"})
		}).catch((err) => {
			console.log(err);
			return res.json({status: 400, message: "Cannot update site settings"});
		})
});

module.exports = router;