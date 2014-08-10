// Various CAS settings
var settings = sails.config;
var casOptions = settings.casOptions;

module.exports = {
  loginRoute: function(params) {
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

  serviceURL: settings.protocol + settings.appEnvMap[settings.environment]
}