var express = require('express');
var router = express.Router();
var web3 = require('./web3Controller');
var VerifyAdmin = require('../middleware/verifyAdmin');
var Coin = require('../models/coins');

router.post('/addcoins', VerifyAdmin, (req,res) => {

    // array of address arrive
    var coinAddress = req.body.address;
    var count = 0;
    for(i=0; i<coinAddress.length; i++) {

        //coininfo is got from etherscan and stored in db
        var coinInfo = web3.getTokenInfo(coinAddress[i]).then((result) => {

            let coin = new Coin({
                address : result.tokenAddress,
                symbol: result.symbol,
                decimals : result.decimals,
                contractABI : result.contractABI
            });

            coin.save().then((doc) => {
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

module.exports = router;