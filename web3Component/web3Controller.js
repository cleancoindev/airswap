var Web3 = require('web3');
var urls = require('../utils/urls');
var axios = require('axios');

var web3 = new Web3(urls.infura);

function getTokenInfo(tokenAddress){
    let promise = new Promise((resolve,reject) => {
        axios.get(urls.etherscanGetAbi + tokenAddress).then((response) => {
            let contractABI = JSON.parse(response.data.result);
            
            let contract = new web3.eth.Contract(contractABI, tokenAddress);
            contract.methods.symbol().call((err,symbol) => {
                
                contract.methods.decimals().call((deciError,decimals) => {
                    
                    if(err || deciError){
                        
                        reject(new Error(0));
                    }else{  
                        resolve({tokenAddress,symbol,decimals,contractABI});
                    }
                 });
            });
        }).catch((err) => {
            reject(new Error(0));
        });
    });
    return promise;
}

var web = {
    getTokenInfo
}

module.exports = web;