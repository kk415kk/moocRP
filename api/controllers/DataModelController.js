/**
 * DataModelController
 *
 * @description :: Server-side logic for managing data models
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var fs = require('fs-extra');
var path = require('path');
var rmdir = require('rimraf');

module.exports = {
  add_file: function(req, res) {
    //TODO: Check for ID
    DataModel.findOne(req.param('id'), function(err, dataModel) {
      if (err || !dataModel) {
        FlashService.error('Unable to complete request.');
        return res.redirect('/admin/manage_data_models');
      }

      var params = req.params.all();
      if (!params["file"]) {
        FlashService.error(req, "Please enter a valid filename.");
        return res.redirect('/admin/manage_data_models');
      } else if (params["file"] in dataModel.files) {
        FlashService.error(req, params["file"] + " already exists as an associated file for this data model. Please try a different name.");
        return res.redirect('/admin/manage_data_models');
      } else {
        // TODO: Verify that the file meets our specifications.
        dataModel.files.push(params["file"]);
        dataModel.save(function (err) {
          if (err) {
            FlashService.error(req, "An error occurred - please report this bug to the administrator.");
          } else {
            FlashService.success(req, "Successfully added a new file to the " + dataModel.displayName + " data model.");
          }
          return res.redirect('/admin/manage_data_models');
        });
      }
    });
  },
  create: function(req, res) {
    DataModel.create(req.params.all(), function dataModelCreated(err, dataModel) {
      if (err) {
        //sails.log.debug(err);
        FlashService.error(req, "Unable to import data model. Please check that the display name and folder name are unique and unused.")
        return res.redirect('/admin/manage_data_models')
      }

      FlashService.success(req, 'Successfully imported a new data model.');
      fs.ensureDirSync(path.join(sails.config.paths.DATASET_EXTRACT_PATH, dataModel.fileSafeName));
      fs.ensureDirSync(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'non_pii', dataModel.fileSafeName));
      fs.ensureDirSync(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'pii', dataModel.fileSafeName));
      fs.ensureDirSync(path.join(sails.config.paths.DATASET_ENCRYPT_PATH, dataModel.fileSafeName));
      return res.redirect('/admin/manage_data_models');
    });
  },
  destroy: function(req, res) {
    DataModel.destroy(req.param('id'), function (err, dataModel) {
      if (err) sails.log.debug(err);

      FlashService.success(req, 'Successfully removed a data model.');
      rmdir(path.join(sails.config.paths.DATASET_EXTRACT_PATH, dataModel[0].fileSafeName), function(err) {});
      rmdir(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'non_pii', dataModel[0].fileSafeName), function(err) {});
      rmdir(path.join(sails.config.paths.DATASET_DOWNLOAD_ROOT, 'pii', dataModel[0].fileSafeName), function(err) {});
      rmdir(path.join(sails.config.paths.DATASET_ENCRYPT_PATH, dataModel[0].fileSafeName), function(err) {});

      // TODO: Deny all pending requests for this data model; also remove available downloads for this data model
      Request.find({ dataModel: req.param('id') }, function (err, requests) {
        for (var i = 0; i < requests.length; i++) {
          if (requests[i].dataModel == req.param('id')) {
            Request.destroy(requests[i].id, function (err, destroyedRequest) {
              // TODO: Send message to requesting user saying the data model has been deleted
            });
          }
        }
        return res.redirect('/admin/manage_data_models');
      });
    });
  },
  info: function(req, res) {
    DataModel.find().exec(function findDM(err, dataModels) {
      return res.view({ title: "Develop", dataModels: dataModels });
    });
  },
  remove_file: function(req, res) {
    DataModel.findOne(req.param('id'), function(err, dataModel) {
      if (err || !dataModel) {
        FlashService.error('Unable to complete request.');
        return res.redirect('/admin/manage_data_models');
      }

      var params = req.params.all();
      var i = dataModel.files.indexOf(params["file"]);
      if (i == -1) {
        FlashService.error(req, "File not found in the data model " + dataModel.displayName);
        return res.redirect('/admin/manage_data_models');
      } else {
        dataModel.files.splice(i, 1);
        dataModel.save(function (err) {
          if (err) {
            FlashService.error(req, "An error occurred - please report this bug to the administrator.");
          } else {
            FlashService.success(req, "Successfully removed the file " + params["file"] + " from the " + dataModel.displayName + " data model.");
          }
          return res.redirect('/admin/manage_data_models');
        })
      }
    });
  },

  save: function(req, res) {
    var params = req.params.all(),
        updateParams = {},
        dataModelId = params['id'];

    DataModel.findOne(dataModelId, function (err, datamodel) {
      var downloadNonPII = sails.config.paths.DATASET_NON_PII,
          downloadPII = sails.config.paths.DATASET_PII,
          extractedPath = sails.config.paths.DATASET_EXTRACT_PATH,
          encryptPath = sails.config.paths.DATASET_ENCRYPT_PATH

      if (params['displayName'] != '' && params['displayName'] != datamodel.displayName) {
        updateParams['displayName'] = params['displayName'];
      }

      if (params['folderName'] != '' && params['folderName'] != datamodel.fileSafeName) {
        var fs = require('fs-extra');
        var path = require('path');
        var currFolderName = datamodel.fileSafeName;

        updateParams['fileSafeName'] = params['folderName'];
        fs.move(path.resolve(downloadNonPII, currFolderName), path.resolve(downloadNonPII, params['folderName']), function(err) {});
        fs.move(path.resolve(downloadPII, currFolderName), path.resolve(downloadPII, params['folderName']), function(err) {});
        fs.move(path.resolve(extractedPath, currFolderName), path.resolve(extractedPath, params['folderName']), function(err) {});
        fs.move(path.resolve(encryptPath, currFolderName), path.resolve(encryptPath, params['folderName']), function(err) {});
      }

      DataModel.update(params['id'], updateParams, function(err) {
        if (err) {
          FlashService.error(req, 'Unable to update the data model. Please check that the display name and folder name are unique and unused.');
        } else {
          FlashService.success(req, 'Successfully updated the data model.');
        }
        return res.redirect('/admin/manage_data_models');
      });
    });
  }
};

