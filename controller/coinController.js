var express = require('express');
var router = express.Router();
var Coin = require('../models/coins');
const verifyToken = require('../middleware/verifyToken');
var verifyBlocked = require('../middleware/verifyBlocked');

router.get('/getcoins', verifyToken, verifyBlocked, (req,res) => {
	Coin.find({approved: true}).then((approvedCoins)=> {
		return res.json({status: 200, coinInfo: approvedCoins});
	}).catch((err) => {
		return res.json({status:400, message: "Coins cant be fetched from the database"});
	});
});

router.get('/getcoin/', verifyToken, verifyBlocked, (req,res) => {

	var address = req.query.address;
	console.log("before",address);
	if(!address){
		console.log("middle",address);
		return res.json({status: 400, message: "request object does not contain address"});
	}
	Coin.findOne({address: address, approved: true}).then((coin) => {
		res.json({status: 200, coin: coin});
	}).catch((err) => {
		console.log("last",err);
		return res.json({status: 400, message: "Coin cannot be fetched from the database"})
	});
	
});

module.exports = router;
