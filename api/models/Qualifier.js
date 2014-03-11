/**
 * User
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
    
    // Instance variables
    id: {
    	type: 'string',
      required: true,
      unique: true
    },
    displayValue: {
      type: 'string',
      required: true
    },
    // approvers: [{

    // }]

    // Instance methods
    toJSON: function() {
      var obj = this.toObject();
      delete obj.qid;
      delete obj._csrf;
      return obj;
    },
  }
};
