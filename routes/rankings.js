'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const Score = require('../models/ScoreSchema');

exports.getRankings = (req, res) => {
	const timeframe = req.params.timeframe;
	const time = Date.now();
	let earliestDate;
	switch (timeframe) {
		case "day":
			earliestDate = time - 86400000;
			break;
		case "week":
			earliestDate = time - 604800000;
			break;
		case "month":
			earliestDate = time - 2629746000;
			break;
		case "all":
			break;
		default:
			earliestDate = time;
			break;
	}

	// construct query
	let query = {};
	if (earliestDate) {
		query = {date: earliestDate};
	}

	Score.find(query)({score: 1}).limit(10).exec()
		.then(scores => {
			res.status(200).json({rankings: scores, timeframe: timeframe});
		})
		.catch(err => {
			res.status(400).json({message: `Error getting ranking: ${err}`});
		})
	.done();
}