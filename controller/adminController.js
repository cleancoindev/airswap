var express = require('express');
var router = express.Router();
var web3 = require('./web3Controller');
var Coin = require('../models/coins');

router.get('/coinlist', (req,res) => {
    /*
     * supposed to return coins data from db
     */

    // web3.getSymbol('0x55a51f896ac5ad326cffd462eb10956db126eec4').then(function(result){
    //     res.json({status: 200, symbol: result});
    // });
    
});

router.post('/addcoins', (req,res) => {

    // array of address arrive
    var coinAddress = req.body.address;
    
    for(i=0; i<coinAddress.length; i++){

        // console.log(coinAddress[i]);

        //symbol is got from etherscan and stored in db
        var symbol = web3.getSymbol(coinAddress[i]).then(function(result){
            console.log(result);
            console.log("address", coinAddress[i]);
            // let coin = new Coin({
            //     address : coinAddress[i],
            //     symbol: result
            // });

            // coin.save().then((doc) => {
            //     res.json({status: 200, symbol: coin.symbol});
            // },(error) => {
            //     console.log("error inserting coins to db");
            // }); 
        }).catch((err) => {
            console.log("error calling the api");
        });
    }
});

module.exports = router;