/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  schema: true,

  attributes: {  	
  	/* e.g.
  	nickname: 'string'
  	*/
    
    // Instance variables
    first_name: {
    	type: 'string',
      required: 'true'
    },
    last_name: {
      type: 'string',
      required: 'true'
    },    
    email: {
    	type: 'string',
    	email: true,
      required: 'true',
    },
    password: {
    	type: 'string',
      required: 'true'
    },
    admin: {
      type: 'boolean',
      defaultsTo: false
    },

    // Instance methods
    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      delete obj.confirmation;
      delete obj._csrf;
      return obj;
    }, 
  },

  // 'beforeCreate' is a lifecycle callback; essentially, these are hooks that we
  // can tape into to change data
  // See Sails documentation on Models for more info/examples
  beforeCreate: function (values, next) {
    var bcrypt = require('bcrypt');

    if (!values.password || values.password != values.confirmation) {
      return next({err: ["Password doesn't match password confirmation."]});
    }

    bcrypt.genSalt(10, function(err, salt) {
      if (err) return next(err);

      bcrypt.hash(values.password, salt, function(err, encrypted) {
        if (err) return next(err);

        values.password = encrypted;
        values.online = true;
        next();
      });
    });
  },

  afterCreate: function(values, next) {
    
  }

};
