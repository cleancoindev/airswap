var Web3 = require('web3');
var urls = require('../utils/urls');
var axios = require('axios');
//var web3 = new Web3();

var web3 = new Web3(urls.infura);

function getSymbol(tokenAddress){
    let promise = new Promise(function(resolve,reject){
        axios.get(urls.etherscanGetAbi + tokenAddress).then(function (response){
            let contractABI = JSON.parse(response.data.result);
            let contract = new web3.eth.Contract(contractABI, tokenAddress);
            contract.methods.symbol().call((err,result) => {
                if(err){
                    reject(new Error(0));
                }else{
                    resolve(result);
                }
            });
        })
        .catch(function (error){
            reject(new Error(0));
        });
    });
    return promise;
}

var web = {
    getSymbol
}

module.exports = web;