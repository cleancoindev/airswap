var express = require('express');
var app = express();
var mongoose = require('./db/connection');
var bodyParser = require('body-parser');
global.__root = __dirname + '/';
var require = ('cors');

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

app.listen(3000, () => {
	console.log("Server running on port 3000");
});