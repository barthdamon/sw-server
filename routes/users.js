'use strict';

const Promise = require('bluebird');
const jwt = require('jwt-simple');
const User = require('../models/UserSchema');

exports.userInfo =  userInfo;
function userInfo(user) {
	return {
		_id: user._id,
		name: user.name,
		username: user.username,
		email: user.email,
	};
}

//New
exports.createUser = (req, res) => {
	const name = req.body.name;
	const username = req.body.username;
	const email = req.body.email;
	const password = req.body.password;
	const currentTime = Date.now();

	const newUser = new User({
		name: name,
		username: username,
		email: email, 
		password: password,
		joined: currentTime,
	});

	let user_Id = "";

	newUser.save()
		.then(result =>{
			return User.findOne({email: email}).exec()
		})
		.then(user => {
			const token = generateToken(user_Id);
			res.status(200).json(token);
		})
		.catch(err => {
			res.status(400).json({ message: `User create failure: ${err}`});
		})
	.done();
}

//Basic Auth
exports.login = (req, res) => {
	console.log(req.body.emailUsername);
	User.findOne({ $or: [{email: req.body.emailUsername}, {username: req.body.emailUsername}] }, (err, user) => {
		if (user) {
			console.log("User account exists, attempting login for " + req.body.emailUsername);
			const user_Id = user._id;
			user.comparePassword(req.body.password, (err, isMatch) => {
        		if (err) {
        			res.status(403).json({'message': 'User password incorrect'});
        		} else {
        			const token = generateToken(user_Id);
					res.status(200).json(token);
        		}
   		});
		} else {
			res.status(400).json({ message: 'User not found'});
		}
	});
}

function generateToken(user_Id) {
	const date = Date.now();
	const expires = date + 604800000;
	//encode using the jwt token secret
	const token = jwt.encode({
	  	iss: user_Id,
	  	exp: expires
	}, process.env.JWT_SECRET_TOKEN);

	const tokenResponse = {
	  api_authtoken : token,
	  authtoken_expiry: expires		
	} 

	return tokenResponse
}

exports.searchUsers = function(req, res) {
	const searchTerm = req.params.term;
	console.log("User Search Term: " +searchTerm);
	let user_Ids = [];

	User.find({$or : [ {username: {$regex : searchTerm, $options: 'i'}}, {name: {$regex: searchTerm, $options: 'i'}}] }).exec()
		.then(userModels => {
			let userInfos = [];
			userModels.forEach(user => {
				userInfos.push({userInfo: userInfo(user)});
			});
	 		res.status(200).json({ users: userInfos});
		})
		.catch(err => {
			console.log(err);
	 		res.status(400).json({ message: `Error finding users ${err}`});
		})
	.done();
}

exports.userProfilesForIds = ids => {
	return User.find({_id: {$in: ids}}).exec()
		.then(users => {
			let userInfos = [];
			users.forEach(user => {
				userInfos.push({userInfo: userInfo(user)});
			});
	 		return resolve(userInfos);
		})
		.catch(err => {
			console.log("ERROR GETTING USER PROFILES: " + err);
	 		return reject(err);
		})
	.done();
}

exports.updateUser = (req, res) => {
	const user = req.body.user;
	User.update({_id: req.user._id }, user).exec()
		.then(result => {
			console.log("user update success");
			res.status(200).json({message: 'user update success'});
		})
		.catch(err => {
			res.status(400).json({message: `Error updating user ${err}`});
		})
	.done();
}