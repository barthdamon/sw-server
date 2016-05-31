'use strict';

const jwt = require('jwt-simple');
const config = require('../lib/config');
const User = require('../models/UserSchema');

//MARK: EXPORTS
module.exports = function(req, res, next) {
	console.log("hitting jwt auth");
	switch (req.get('auth_type')) {
	case "Token":
		//query the db for the jwt that matches the user
		var token = req.get('token');
		var decoded = null;
		if (token) {
		  	try {
	   		decoded = jwt.decode(token, process.env.JWT_SECRET_TOKEN);
		  	} catch (err) {
		  		res.status(401).json({"message" : "Incorrect Auth Token: "+err});
		  	}
		  	console.log(decoded);

		  	// get user id from the db, check to make sure the exp isn't invalid
		  	// redirect to login here??
		  	// if (decoded.exp < Date.now()) {
		  	// 	res.status(300).json({"message" : "Auth Token Expired"})
		  	// } else {
		  	let id = decoded.iss;
			User.findOne({ _id: id }, function(err, user){
				if (err) {
					console.log("Error attaching User: " +err);
					res.status(400).json({"message": "User not found for token: " + err});
				} else {
					req.user = user;
					next();
				}
			});
		} else {
			res.status(400).json({"message" : "Invalid tokenAuth request format"});
		}
		break;

	default:
		res.status(400).json({"message" : "Invalid auth type"});
		break;
	}
};