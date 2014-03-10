/*// This file does not get uploaded to Github
// Trying out MongoDB as database instead of MySQL

module.exports = {
	port: process.env.PORT || 1337,

	environment: process.env.NODE_ENV || 'development',

	adapters: {
		'default': 'mongo',

		mongo: {
			module		: 'sails-mongo',
			host		: 'localhost',
			user		: '',
			password	: '',
			database	: 'moocRPtest',

			schema		: true
		}
	}
}*/