var request = require('supertest');
var assert = require('assert');
var async = require('async');
var stubs = require('../stubs.js');

var path = require('path');
var rmdir = require('rimraf');
var fs = require('fs-extra');

describe('DataModel', function() {
  var agent;
  var testUser;
  var testDataModel;

  var userParams = stubs.userStub();
  var dataModelParams = stubs.dataModelStub();

  before(function(done) {
    User.create(userParams, function (err, user) {
      testUser = user;

      // Authenticate the agent first
      sails.config.bypassLogin = true;
      sails.config.bypassUserId = 111111;
      agent = request.agent(sails.hooks.http.app);
      agent.get('/user/login').end(done);
    });
  })

  describe('#create()', function() {
    describe('data model import', function() {
      it('should import a new data model.', function (done) {
        agent
          .post('/datamodel/create')
          .send(dataModelParams)
          .expect(302)
          .end(function (err, res) {
            if (err) {
              throw new Error(err);
            }

            DataModel.findOne({ displayName: dataModelParams.displayName }, function (err, dataModel) {
              if (err || !dataModel) {
                throw new Error(err);
              }
              done();
            });
          });
      });

      it('should have created four new folders for the data model.', function (done) {
        assert.equal(true, fs.existsSync(path.join(sails.config.paths.DATASET_EXTRACT_PATH, dataModelParams.fileSafeName)));
        assert.equal(true, fs.existsSync(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'non_pii', dataModelParams.fileSafeName)));
        assert.equal(true, fs.existsSync(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'pii', dataModelParams.fileSafeName)));
        assert.equal(true, fs.existsSync(path.join(sails.config.paths.DATASET_ENCRYPT_PATH, dataModelParams.fileSafeName)));
        done();
      });

    });

    after(function (done) {
      // Clear the user after use
      User.destroy(userParams.id, function (err) {});

      // Clear the data model folders
      DataModel.findOne({ displayName: dataModelParams.displayName }, function (err, dataModel) {
        agent.post('/datamodel/destroy/' + dataModel.id).end(done);
      });
    });
  });

});