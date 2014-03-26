/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  //migrate: 'drop', // use to drop all tables
  schema: true,

  attributes: {  	
  	/* e.g.
  	nickname: 'string'
  	*/
    
    // Instance variables
    id: {
      type: 'string',
      required: true,
      unique: true
    },
    first_name: {
      type: 'string',
      required: true
    },
    last_name: {
      type: 'string',
      required: true
    },
    email: {
    	type: 'string',
    	email: true,
      unique: true,
    },
    registered: {
      type: 'boolean',
      defaultsTo: false
    },
    authorizer: {
      type: 'boolean',
      defaultsTo: false
    },
    admin: {
      type: 'boolean',
      defaultsTo: false
    },

    // Instance methods
    toJSON: function() {
      var obj = this.toObject();
      //delete obj.authorizer;
      //delete obj.admin;
      delete obj._csrf;
      return obj;
    }, 
  },

  // 'beforeCreate' is a lifecycle callback; essentially, these are hooks that we
  // can tape into to change data
  // See Sails documentation on Models for more info/examples
  beforeCreate: function (values, next) {
    // Comment out if other emails are allowed
    var matchingBerkeleyEmail = /@berkeley.edu$/;
    if (!matchingBerkeleyEmail.test(values.email)) {
      return next({err: ["Berkeley emails only"]});
    }
    return next();
  }

};
