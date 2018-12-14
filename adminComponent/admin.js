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

adminSchema.methods.toJSON = function(){
   admin = this.toObject();
   delete admin.password;
   return admin;
}

var Admin = mongoose.model('Admin',adminSchema);

module.exports = Admin;