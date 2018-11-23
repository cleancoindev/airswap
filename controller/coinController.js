var express = require('express');
var router = express.Router();
var Coins = require('../models/coins');
const verifyToken = require('../middleware/verifyToken');

router.get('/getcoins', verifyToken, (req,res) => {


	Coins.find().then((doc)=> {
		var coinArray = [];
		
		for(i =0;i<doc.length;i++) {
			coinArray.push({address: doc[i].address, symbol: doc[i].symbol, decimals: doc[i].decimals, contractAbi: doc[i].contractABI});
		}

		res.json({status: 200, coinInfo: coinArray})
	}).catch((err) => {
		return res.json({status:400, auth:false ,message:"Coins cant be fethced from DB"});
	});
});

module.exports = router;
