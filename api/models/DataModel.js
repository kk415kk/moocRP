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
  },

  beforeCreate: function (values, next) {
    // We use __ as a separator, so disallow it in names.
    var prohibit = /__/;
    if (!prohibit.test(values.displayName) || !prohibit.test(values.fileSafeName)) {
      FlashService.error('"___" is not allowed in the names of a data model.');
      return next(err);
    }
    return next();
  }
};

