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
  var testDataModelId;

  var userParams = stubs.userStub();
  var dataModelParams = stubs.dataModelStub();
  var dataModelParams2 = stubs.dataModelStub2();

  before(function(done) {
    User.create(userParams, function (err, user) {
      testUser = user;

      // Authenticate the agent first
      sails.config.bypassLogin = true;
      sails.config.bypassUserId = 111111;
      agent = request.agent(sails.hooks.http.app);
      agent.get('/user/login')
            .end(function (err, res) {
              done(); 
            });
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
              testDataModelId = dataModel.id;
              done();
            });
          });
      });

      it('should have created four new folders for the data model.', function (done) {
        DataModel.findOne(testDataModelId, function (err, dataModel) {
          assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_EXTRACT_PATH, dataModel.fileSafeName)), true);
          assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'non_pii', dataModel.fileSafeName)), true);
          assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'pii', dataModel.fileSafeName)), true);
          assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_ENCRYPT_PATH, dataModel.fileSafeName)), true);
          done();
        });
      });
    });
  });

  // Modifies the data model created in the 'create' test
  describe('#edit()', function() {
    describe('data model attribute "displayName" change', function () {
      it('should change the display name of the data model.', function (done) {
        DataModel.findOne(testDataModelId, function (err, dataModel) {
          var params = { id: dataModel.id, 
                         displayName: dataModelParams2.displayName,
                         folderName: dataModel.fileSafeName };
          agent
            .post('/datamodel/save')
            .send(params)
            .expect(302)
            .end(function (err, res) {
              DataModel.findOne(dataModel.id, function (err2, editedDataModel) {
                if (err2 || !editedDataModel) {
                  throw new Error(err2);
                }
                assert.equal(editedDataModel.displayName, dataModelParams2.displayName);
                done();
              });
            });
        });
      });

      it('should not change the folder names after changing the display name.', function (done) {
        DataModel.findOne(testDataModelId, function (err, dataModel) {
          assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_EXTRACT_PATH, dataModel.fileSafeName)), true);
          assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'non_pii', dataModel.fileSafeName)), true);
          assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'pii', dataModel.fileSafeName)), true);
          assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_ENCRYPT_PATH, dataModel.fileSafeName)), true);
          done();
        });
      });
    });

    describe('data model attribute "fileSafeName" change', function () {
      it('should change the safe name of the data model.', function (done) {
        DataModel.findOne(testDataModelId, function (err, dataModel) {
          var params = { id: dataModel.id,
                         displayName: dataModel.displayName,
                         folderName: dataModelParams2.fileSafeName }
          agent
            .post('/datamodel/save')
            .send(params)
            .expect(302)
            .end(function (err, res) {
              DataModel.findOne(testDataModelId, function (err2, editedDataModel) {
                if (err2 || !editedDataModel) {
                  throw new Error(err2);
                }
                assert.equal(editedDataModel.fileSafeName, dataModelParams2.fileSafeName);
                done();
              })
            });
        });
      });

      it('should change the associated folder names.', function (done) {
        DataModel.findOne(testDataModelId, function (err, dataModel) {
          assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_EXTRACT_PATH, dataModel.fileSafeName)), true);
          assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'non_pii', dataModel.fileSafeName)), true);
          assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'pii', dataModel.fileSafeName)), true);
          assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_ENCRYPT_PATH, dataModel.fileSafeName)), true);
          done();   
        });     
      });
    });
  });

  // Uses the data model created in the 'create' test
  describe('#destroy()', function() {
    describe('data model removal', function() {
      var testDataModel;

      // Save the attributes before destroying
      before(function (done) {
        DataModel.findOne(testDataModelId, function (err, dataModel) { 
          testDataModel = dataModel;
          done();
        });
      })

      it('should delete the data model from the database.', function (done) {
        agent
          .post('/datamodel/destroy')
          .send({ id: testDataModelId })
          .expect(302)
          .end(function (err2, res) {
            if (err2) {
              throw new Error(err2);
            }
            done();
          })
      });

      it('should remove the associated folders that were created for the data model.', function (done) {
        assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_EXTRACT_PATH, testDataModel.fileSafeName)), false);
        assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'non_pii', testDataModel.fileSafeName)), false);
        assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'pii', testDataModel.fileSafeName)), false);
        assert.equal(fs.existsSync(path.join(sails.config.paths.DATASET_ENCRYPT_PATH, testDataModel.fileSafeName)), false);
        done();
      });
    })
  })

  after(function (done) {
    // Clear the data model folders - the last test takes care of this
    // Clear the user after use
    User.destroy(userParams.id, function (err) {});
    done();
  });

});
