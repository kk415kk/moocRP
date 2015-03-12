// Various CAS settings
var settings = sails.config;
var casOptions = settings.casOptions;

module.exports = {
  loginRoute: function(params) {
    // Can override with own login system
    var baseURL = casOptions.casURL + casOptions.login + '?service=' + AuthService.serviceURL + '/user/validate';
    if (params) {
      for (var key in params) {
        if (params.hasOwnProperty(key)) baseURL = baseURL + '&' + key + '=' + params[key];
      }
    }
    return baseURL
  },

  logoutRoute: function() {
    return casOptions.casURL + casOptions.logout + '?url=' + AuthService.serviceURL;
  },

  validateRoute: function(params) {
    var baseURL = casOptions.casURL + casOptions.validate + '?service=' + AuthService.serviceURL + '/user/validate';
    if (params) {
      for (var key in params) {
        if (params.hasOwnProperty(key)) baseURL = baseURL + '&' + key + '=' + params[key];
      }
    }
    return baseURL
  },

  validate: function(url, cb) {
    var request = require('request');

    request({uri: url, secureProtocol: 'TLSv1_method' }, function(err, response, body) {
      var uid = undefined;

      if (!err && body) {
        var lines = body.split('\n');
        if (lines && lines[0] == 'yes') {
          uid = lines[1];
        }
      }
      return cb(err, uid);
    });
  },

  serviceURL: settings.protocol + settings.appEnvMap[settings.environment] + ":" + settings.port
}