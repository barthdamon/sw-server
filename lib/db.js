'use strict'

const config = require('./config');
const mongoose = require('mongoose');

mongoose.Promise = require('bluebird');
const db = mongoose.createConnection(config.mongo.uri);

db.on('error', function(err){
  if(err) throw err;
});

db.once('open', function callback () {
  console.info('Mongo db connected successfully');
});

module.exports = db;