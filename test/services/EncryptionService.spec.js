var request = require('supertest');
var assert = require('assert');
var async = require('async');
var stubs = require('../stubs.js');

describe('EncryptionService', function() {
  var testUser;

  before(function () {
    var userParams = stubs.userStub();
    User.create(userParams, function (err, user) { testUser = user});
  });

  describe('#encrypt()', function() {
    describe('TODO', function() {
      it('should encrypt a dataset.', function (done) {
        request(sails.hooks.http.app);
        done();
      });
    });
  });
});