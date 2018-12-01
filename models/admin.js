const mongoose = require('mongoose');
const validator = require('validator');

mongoose.Promise = global.Promise;

var adminSchema = mongoose.Schema({
   email:{
      type: String,
      unique: true
   },
   password: String
});

var Admin = mongoose.model('Admin',adminSchema);

module.exports = Admin;