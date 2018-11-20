const mongoose = require('mongoose');
const options = {useNewUrlParser: true, useCreateIndex: true};

mongoose.connect('mongodb://localhost:27017/logindb', options);