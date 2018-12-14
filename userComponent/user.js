const mongoose = require('mongoose');
const validator = require('validator');

mongoose.Promise = global.Promise;

var userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
        }
    },
    verified: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.toJSON = function(){
    user = this.toObject();
    delete user.password;
    return user;
}

var User = mongoose.model('User',userSchema);

module.exports = User;