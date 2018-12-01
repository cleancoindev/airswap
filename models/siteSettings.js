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
      type: String,
      default: 'fb link goes here'
   },
   twitterlink: {
      type: String,
      default: 'twitter link goes here'
   },
   redditlink: {
      type: String,
      default: 'reddit link goes here'
   },
   homepage: {
      type: String,
      default: 'homepage default content'
   },
   copyright: {
      type: String,
      default: 'copyright default content'
   },
   sitename:{
      type: String,
      default: 'default site name'
   },
   supportmailid: {
      type: String,
      default: 'support mailId goes here'
   }
});

var SiteSettings = mongoose.model('siteSettings',settingSchema);
module.exports = SiteSettings;