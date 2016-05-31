'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const Score = require('../models/ScoreSchema');

exports.registerScore = (req, res) => {
	let now = Date.now();
	let newScore = new Score({
		user_id: req.user._id,
		score: req.body.score,
		date: now
	});
	
	newScore.save()
		.then(result => {
			res.status(200).json({message: `score registered successfully`});
		})
		.catch(err => {
			res.status(400).json({message: `error registering score: ${err}`});
		})
	.done();
}
