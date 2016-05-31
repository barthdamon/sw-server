require('dotenv').config({silent: true});

module.exports = {
	main: {
		port: process.env.PORT || 8000
	},
	mongo: {
		uri: process.env.MONGODB_URI || 'mongodb://localhost/swipedright'
	}
};