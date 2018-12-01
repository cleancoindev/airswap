var express = require('express');
var app = express();
var db = require('./db/connection');
var bodyParser = require('body-parser');
global.__root = __dirname + '/';
var cors = require('cors');

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// for parsing multipart/form-data
//app.use(multer());
// for cross platform api call
app.use(cors());

app.get('/home', (req,res) => {
	res.json({success: true});
});

var UserController = require(__root + 'controller/userController');
app.use('/user', UserController);

var AuthController = require(__root + 'controller/authController');
app.use('/auth', AuthController);

var AdminController = require(__root + 'controller/adminController');
app.use('/admin', AdminController);

var CoinController = require(__root + 'controller/coinController');
app.use('/coin', CoinController);

var SiteSettingsController = require(__root + 'controller/siteSettingsController');
app.use('/site', SiteSettingsController);

app.listen(3000, () => {
	console.log("Server running on port 3000");
});