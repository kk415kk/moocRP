/**
 * Visualization
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
    owner: {
      model: 'user',
      required: true
    },
    name: {
      type: 'STRING',
      required: true
    },
    fileName: {
      type: 'STRING',
      required: true
    },
    seededFileName: {
      type: 'STRING',
      required: true
    },
    description: {
      type: 'TEXT',
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
    // i.e. D3, R, Plateau
    type: { 
      type: 'STRING',
      required: true
    },
    // i.e. HarvardX, StanfordX, moocDB
    dataModels: {
      type: 'ARRAY',
      required: true
    },
    usersWhoStarred: {
      collection: 'user',
      via: 'starredVisuals'
    },

    // Instance methods
    toJSON: function() {
      var obj = this.toObject();
      delete obj._csrf;
      return obj;
    }, 
  }
};
