/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

// Only included this file for the sake of removing the password while authenticating a session
module.exports = {

  schema: true,

  attributes: {  	
  	/* e.g.
  	nickname: 'string'
  	*/
    
    // Instance variables   
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
    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      delete obj._csrf;
      return obj;
    }, 
  }
};
