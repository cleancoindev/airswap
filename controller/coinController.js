var express = require('express');
var router = express.Router();
var Coin = require('../models/coins');
const verifyToken = require('../middleware/verifyToken');
var verifyBlocked = require('../middleware/verifyBlocked');

router.get('/getcoins', verifyToken, verifyBlocked, (req,res) => {

	Coin.find().then((coin)=> {
		return res.json({status: 200, coinInfo: coin});
	}).catch((err) => {
		return res.json({status:400, message:"Coins cant be fetched from the database"});
	});
});

router.get('/getcoin/', verifyToken, verifyBlocked, (req,res) => {

	var address = req.query.address;
	if(!address){
		return res.json({status: 400, message: "request object does not contain address"});
	}
	Coin.findOne({address: address}).then((coin) => {
		return res.json({status: 200, coin: coin});
	}).catch((err) => {
		return res.json({status: 400, message: "Coin cannot be fetched from the database"})
	});
	
});

module.exports = router;
