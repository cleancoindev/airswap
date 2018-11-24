var express = require('express');
var router = express.Router();
var Coin = require('../models/coins');
const verifyToken = require('../middleware/verifyToken');

router.get('/getcoins', verifyToken, (req,res) => {

	Coin.find().then((coin)=> {
		var coinArray = [];
		
		for(i =0;i<coin.length;i++) {
			coinArray.push({address: coin[i].address, symbol: coin[i].symbol, decimals: coin[i].decimals, 
				contractAbi: coin[i].contractABI, price: coin[i].price});
			if(i == coin.length - 1){
				return res.json({status: 200, coinInfo: coinArray})
			}
		}
	}).catch((err) => {
		return res.json({status:400, message:"Coins cant be fetched from the database"});
	});
});

router.get('/getcoin/', verifyToken, (req,res) => {

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
