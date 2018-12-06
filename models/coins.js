const mongoose = require('mongoose');
const validator = require('validator');

mongoose.Promise = global.Promise;

var coinSchema = mongoose.Schema({
    address:{
        type: String,
        required: true,
        minlength: 1,
        unique: true
    },
    symbol:{
        type: String
    },
    decimals:{
        type: String
    },
    contractABI:{
        type: String
    },
    price: {
        type: String
    },
    coinImage: {
        type: String
    },
    approved: {
        type: Boolean,
        default: false
    }
})

var Coin = mongoose.model('Coin', coinSchema);

module.exports = Coin;
