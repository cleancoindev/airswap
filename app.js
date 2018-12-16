var express = require('express');
var app = express();
var db = require('./db/connection');
var bodyParser = require('body-parser');
global.__root = __dirname + '/';
var cors = require('cors');
var router = express.Router();

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// for permitting access to uploads folder.
app.use('/uploads', express.static(__root + '/uploads'));
// for cross platform api call
app.use(cors());

app.get('/api/home', (req,res) => {
	res.json({success: true});
});

var UserController = require(__root + 'userComponent/userController');
app.use('/api/user', UserController);

var AuthController = require(__root + 'authComponent/authController');
app.use('/api/auth', AuthController);

var AdminController = require(__root + 'adminComponent/adminController');
app.use('/api/admin', AdminController);

var CoinController = require(__root + 'coinComponent/coinController');
app.use('/api/coin', CoinController);

var SiteSettingsController = require(__root + 'siteSettingsComponent/siteSettingsController');
app.use('/api/site', SiteSettingsController);

app.listen(3000, () => {
	console.log("Server running on port 3000");
});