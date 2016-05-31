'use strict';

require('dotenv').config({silent: true});

const express = require('express');
const bodyParser = require('body-parser');
const notifications = require('./routes/notifications');
const config = require('./lib/config');
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.status(200).json({message: 'pong'});
});


app.listen(config.main.port, () => {
	console.log('Node app is running on port', config.main.port);
});
