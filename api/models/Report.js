/**
* Report.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    firstName: {
      type: 'STRING',
      required: true
    },
    lastName: {
      type: 'STRING',
      required: true
    },
    emailAddress: {
      type: 'EMAIL',
      required: true
    },
    type: {
      type: 'STRING',
      required: true
    },
    emailMessage: {
      type: 'TEXT',
      required: true
    },
    status: {
      // Statuses include: 'OPEN', 'IN-PROGRESS', 'CLOSED', 'RESOLVED'
      type: 'STRING',
      defaultsTo: 'OPEN'
    },
    user: {
      model: 'user'
    }
  }
};

