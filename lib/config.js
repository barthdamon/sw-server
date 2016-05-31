require('dotenv').config({silent: true});

module.exports = {
	main: {
		port: process.env.PORT || 8000
	},
	mongo: {
		uri: process.env.MONGODB_URI || 'mongodb://localhost/swipedright'
	},
	auth: {
		api_auth_password: process.env.API_AUTH_PASSWORD,
		jwt_secret_token: process.env.JWT_SECRET_TOKEN
	}
};