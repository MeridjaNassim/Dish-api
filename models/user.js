const mongoose = require('mongoose');
const { model } = require('./dishes');
const passportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName : {
        type : String,
        default : ''
    },
    lastName : {
        type : String,
        default : ''
    },
    facebookId : String,
    admin : {
        type : Boolean,
        default : false
    }
});

userSchema.plugin(passportLocalMongoose);
const UserModel = mongoose.model('User' ,userSchema);


module.exports = UserModel