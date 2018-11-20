var express = require('express');
var app = express();
var mongoose = require('./db/connection');
var bodyParser = require('body-parser');
var web3 = require('./controller/web3Controller');
global.__root = __dirname + '/';


// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// for parsing multipart/form-data
//app.use(multer()); 

app.get('/home', (req,res) => {
	res.json({success: true});
});

var UserController = require(__root + 'controller/userController');
app.use('/user', UserController);

var AuthenticationController = require(__root + 'controller/authenticationController');
app.use('/auth', AuthenticationController);

var AdminController = require(__root + 'controller/adminController');
app.use('/admin', AdminController);

app.listen(3000, () => {
	console.log("Server running on port 3000");
});