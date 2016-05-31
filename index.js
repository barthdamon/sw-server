'use strict';

require('dotenv').config({silent: true});

const express = require('express');
const bodyParser = require('body-parser');
const standardSecurity = require('./middleware/standard-security');
const jwtauth = require('./middleware/jwtauth');
const notifications = require('./routes/notifications');
const User = require('./routes/users');
const rankings = require('./routes/rankings');
const scores = require('./routes/scores');
const config = require('./lib/config');
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(standardSecurity);

//Public Routes
const publicRouter = express.Router();
publicRouter.get('/', function(req, res) {
	res.status(200).json({"message":"pong"});
});
publicRouter.post('/new', User.createUser);
publicRouter.post('/login', User.login);
publicRouter.get('/rankings', rankings.getRankings);
app.use('/', publicRouter);

//Private Routes
const privateRouter = express.Router();
privateRouter.use(jwtauth);
privateRouter.put('/user/update', User.updateUser);
privateRouter.post('/score/register', scores.registerScore);
app.use('/token', privateRouter);


app.listen(config.main.port, () => {
	console.log('Node app is running on port', config.main.port);
});
