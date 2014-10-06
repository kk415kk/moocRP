/**
* DataModel.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    displayName: {
      type: 'STRING',
      unique: true,
      required: true
    },
    fileSafeName: {
      type: 'STRING',
      unique: true,
      required: true
    },
    files: {
      type: 'ARRAY',
      defaultsTo: []
    }
  }
};

