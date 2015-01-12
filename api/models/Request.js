/**
 * Request
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/
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
      required: true
    },
    reason: {
      type: 'TEXT',
    },
    requestingUser: {
      model: 'user',
      required: true
    },
    dataModel: {
      model: 'datamodel',
      required: true
    },
    dataset: {
      type: 'STRING',
      required: true
    },
    requestType: {
      type: 'STRING',
      required: true
    },
    approved: {
      type: 'BOOLEAN',
      defaultsTo: false
    },
    rejected: {
      type: 'BOOLEAN',
      defaultsTo: false
    },
    downloaded: {
      type: 'BOOLEAN',
      defaultsTo: false
    }
  },
  beforeCreate: function (values, next) {
    // Default reason value
    if (values.reason == '') {
      values.reason = 'No reason specified';
    }
    return next();
  }

};
