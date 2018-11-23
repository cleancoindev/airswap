const mongoose = require('mongoose');
const validator = require('validator');

mongoose.Promise = global.Promise;

var coinSchema = mongoose.Schema({
    address:{
        type: String,
        required: true,
        minlength: 1        
    },
    symbol:{
        type: String
    },
    decimals:{
        type: String
    },
    contractABI:{
        type: String
    }
})

var Coin = mongoose.model('Coin', coinSchema);

module.exports = Coin;
