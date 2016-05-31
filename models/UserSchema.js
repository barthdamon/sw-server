'use strict';

const db = require('../lib/db');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const SALT_WORK_FACTOR = 10;

// in the future (after everything is working) need to integrate with facebook, twitter, and instagram
const userSchema = mongoose.Schema({
	name: String,
	username: { type: String, unique: true},
	email: { type: String, unique: true }, 
	password: String,
	joined: Number
});

userSchema.pre('save', function(next) {
   let user = this;
	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
	    if (err) return next(err);

	    // hash the password using our new salt
	    bcrypt.hash(user.password, salt, function(err, hash) {
	        if (err) return next(err);

	        // override the cleartext password with the hashed one
	        user.password = hash;
	        next();
	    });
	});
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

mongoose.model('User', userSchema);
const User = db.model('User');

module.exports = User;