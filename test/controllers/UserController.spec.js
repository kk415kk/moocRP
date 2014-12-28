var request = require('supertest');
var assert = require('assert');
var async = require('async');
var stubs = require('../stubs.js');

describe('User', function() {
  var testUser;
  var userParams = stubs.userStub();

  describe('#create()', function() {
    describe('user registration', function() {
      it('should create a new user with the correct attributes.', function (done) {
        User.create(userParams, function(err, user) {
          if (err || !user) {
            throw new Error(err);
          }
          testUser = user;
          done();
        });
      });
    });

    describe('user attributes', function() {
      it('should have the correct user ID.', function (done) {
        assert.equal(testUser.id, userParams.id);
        done();
      });

      it('should have the correct public key ID.', function (done) {
        assert.equal(testUser.publicKeyID, userParams.publicKeyID);
        done();
      });

      it('should default to an administrator role for the first user.', function (done) {
        assert.equal(testUser.admin, true);
        done();
      });

      it('should not default to an administrator role for a second user.', function (done) {
        var userParams2 = stubs.userStub2();
        User.create(userParams2, function (err, user) {
          if (err || !user) {
            throw new Error(err);
          }
          assert.equal(user.admin, false);
          done();
        });
      });

      it('should have the correct first and last name.', function (done) {
        assert.equal(testUser.firstName, userParams.firstName);
        assert.equal(testUser.lastName, userParams.lastName);
        done();
      });

      it('should have the correct email address.', function (done) {
        assert.equal(testUser.email, userParams.email);
        done();
      });
    });
  });

  describe('#edit()', function() {
    describe('email', function() {
      it('TODO should edit the email address of the user.', function (done) {
        done();
      });
    });
  });

  after(function (done) {
    // Clean up the users in the system
    User.destroy(userParams.id, function (err) {});
    User.destroy(stubs.userStub2().id, function (err) {});
    done();
  })

});