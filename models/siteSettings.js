const mongoose = require('mongoose');
const validator = require('validator');

mongoose.Promise = global.Promise;

var settingSchema = mongoose.Schema({
   id: {
      type: String,
      default: 1,
      unique: true
   },
   fblink: {
      type: String
   },
   twitterlink: {
      type: String
   },
   redditlink: {
      type: String
   },
   homepage: {
      type: String
   },
   copyright: {
      type: String
   },
   sitename:{
      type: String
   },
   supportmailid: {
      type: String
   },
   wethcontract: {
      type: String
   },
   adminaddress: {
      type: String
   },
   nexswapaddress:{
      type: String
   }
});

var SiteSettings = mongoose.model('siteSettings',settingSchema);
module.exports = SiteSettings;