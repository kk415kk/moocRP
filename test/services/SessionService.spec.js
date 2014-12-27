var request = require('supertest');
var assert = require('assert');
var async = require('async');
var stubs = require('../stubs.js');

describe('SessionService', function() {
  var testUser;

  before(function () {
    var userParams = stubs.userStub();
    User.create(userParams, function (err, user) { testUser = user});
  });

  describe('#createSession()', function() {
    describe('TODO after modularizing authentication.', function() {
      it('should create a new session.', function (done) {
        request(sails.hooks.http.app);
        done();
      });
    });
  });

  describe('#destroySession()', function() {
    describe('TODO after modularizing authentication.', function() {
      it('should destroy the existing session.', function (done) {
        done();
      });
    });
  });
});