'use strict';

const db = require('./../lib/db');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const scoreSchema = mongoose.Schema({
	user_id: String,
	score: Number,
	date: Number
});

mongoose.model('Score', scoreSchema);
const Score = db.model('Score');

module.exports = Score;
