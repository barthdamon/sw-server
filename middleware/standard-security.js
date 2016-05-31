'use strict';

const config = require('../lib/config');

module.exports = (req, res, next) => {
	if (req.get('api_auth_password') == config.auth.api_auth_password) {
		next();
	} else {
		res.status(403).json({message: 'Ima give you til the count of ten... To get your yella, dirty, no good keister off my property'});
	}
}
