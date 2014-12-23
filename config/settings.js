
/************************************************************************
 * Miscellaneous Settings                                               *
 *------------------------                                              *
 * These settings can be overwritten in the local.js configuration file *
 ************************************************************************/
module.exports = {

  // Maps the different deployment environments to their respective IP addresses - used by CAS
  appEnvMap: {
    test: 'localhost:1337',
    development: 'localhost:1337',
    production: 'cahl.berkeley.edu:15100'
  },

  // Various CAS settings
  casOptions: {
    casURL: 'https://ncas-test.berkeley.edu',
    login: '/cas/login',
    validate: '/cas/validate',
    logout: '/cas/logout',
    renew: true,
    gateway: false
  },

  // https:// or http://
  protocol: 'http://',

  // Used for development purposes
  bypassLogin: process.env.NODE_ENV == 'development' && false,
  bypassUserId: 0,
  noCheckGPG: true,

  // Time for a user's session to expire
  cookieExpiration: 3600000
}