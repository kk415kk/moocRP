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
      type: 'STRING',
      required: true,
      unique: true,
      primaryKey: true
    },
    firstName: {
      type: 'STRING',
      required: true
    },
    lastName: {
      type: 'STRING',
      required: true
    },
    email: {
    	type: 'STRING',
    	email: true,
      unique: true,
    },
    registered: {
      type: 'BOOLEAN',
      defaultsTo: false
    },
    admin: {
      type: 'BOOLEAN',
      defaultsTo: false
    }, 
    publicKey: {
      type: 'TEXT',
      required: true
    },
    publicKeyID: {
      type: 'STRING',
      required: true
    },
    requests: {
      collection: 'request',
      via: 'requestingUser'
    },
    visualizations: {
      collection: 'visualization',
      via: 'owner'
    },
    starredVisuals: {
      dominant: true,
      collection: 'visualization',
      via: 'usersWhoStarred'
    },

    // Instance methods
    toJSON: function() {
      var obj = this.toObject();
      delete obj._csrf;
      return obj;
    }, 
  },

  // 'beforeCreate' is a lifecycle callback; essentially, these are hooks that we
  // can tape into to change data
  // See Sails documentation on Models for more info/examples
  beforeCreate: function (values, next) {
    // Comment out if other emails are allowed
    User.find().exec(function (err, users) {

      if (err) {
        sails.log('Error occurred while creating user: ' + err);
      }
      // Seed initial user as an admin
      if (!users || users.length == 0) {
        values.admin = true;
      }

      var matchingBerkeleyEmail = /berkeley.edu$/;
      if (!matchingBerkeleyEmail.test(values.email)) {
        // TODO: Add some new page
        return next("Please use a Berkeley email address.");
      }
      return next();
    });
  }

};
