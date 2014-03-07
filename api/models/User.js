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
      required: 'true'
    },
    password: {
    	type: 'string',
      required: 'true'
    },

    // Instance methods

    // 'beforeCreate' is a lifecycle callback; essentially, these are hooks that we
    // can tape into to change data
    // See Sails documentation on Models for more info/examples
    beforeCreate: function (attrs, next) {
      var bcrypt = require('bcrypt');

      bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(attrs.password, salt, function(err, hash) {
          if (err) return next(err);

          attrs.password = hash;
          next();
        });
      });
    }


  }
};
