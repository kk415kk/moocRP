/*******************************************
 * Copyright 2014, moocRP                  *
 * Author: Kevin Kao                       *
 *******************************************/

/**
 * AnalyticController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

/****************
 * Dependencies *
 ****************/
var path = require('path');
var process = require('process');
var fs = require('fs-extra');
var shell = require('shelljs');
var rmdir = require('rimraf');

/****************
 **  Constants **
 ****************/
var UPLOAD_PATH = sails.config.paths.UPLOAD_PATH,
    EXTRACT_PATH = sails.config.paths.EXTRACT_PATH,
    PUBLIC_SHARE_PATH = sails.config.paths.PUBLIC_SHARE_PATH,
    STORED_SCAFFOLDS_PATH = sails.config.paths.STORED_SCAFFOLDS_PATH,
    ANALYTICS_ASSETS_PATH = sails.config.paths.ANALYTICS_ASSETS_PATH,
    ANALYTICS_REWRITE_PATH = sails.config.paths.ANALYTICS_REWRITE_PATH,
    ANALYTICS_DATA_SCRIPTS_PATH = sails.config.paths.ANALYTICS_SCRIPT_PATH,
    DATASET_EXTRACT_PATH = sails.config.paths.DATASET_EXTRACT_PATH,
    MAIN_FILE = 'main.html',
    ARCHIVE_TYPES = ['zip'];
var SUCCESS = sails.config.constants.SUCCESS,
    FAILURE = sails.config.constants.FAILURE;

module.exports = {

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AnalyticController)
   */
  _config: {},

  // For viewing a page describing a single analytic module
  show: function(req, res) {
    User.findOne(req.session.user.id).populate('requests').exec(function (err, thisUser) {
      Analytic.findOne(req.param('id')).populateAll().exec(function (err, analytic) {
        var dataModelName = analytic.dataModels[0];
        DataModel.findOne({ displayName: dataModelName }, function (err, dataModel) {

          var fs = require('fs-extra');
          fs.ensureDirSync(DATASET_EXTRACT_PATH);
          var extractedDatasets = {};

          // The names of the courses the user has access to
          var allowedDatasets = _.pluck(_.where(thisUser.requests, { approved: true }), 'dataset');

          var folderPath = path.resolve(DATASET_EXTRACT_PATH, dataModel.fileSafeName);
          fs.ensureDirSync(folderPath);

          var datasetFolders = fs.readdirSync(folderPath);
          var currDataModel = dataModel;
          extractedDatasets[currDataModel.fileSafeName] = [];

          for (j = 0; j < datasetFolders.length; j++) {
            var infoKey = currDataModel.fileSafeName

            // infoObj is a pair (as an array): [ dataModelName, datasetName (i.e. course name)]
            var infoObj = [currDataModel.displayName, datasetFolders[j]];
            if (allowedDatasets.indexOf(infoObj[1]) > -1) {
              extractedDatasets[infoKey].push(infoObj);
            }
          }

          return res.view({ title: 'Module Description', analytic: analytic, datasets: extractedDatasets });
        })
      });
    });
  },

  // TODO
  edit: function(req, res) {
    Analytic.findOne(req.param('id')).populateAll().exec(function (err, analytic) {
      return res.view({ title: 'Module Edit', analytic: analytic });
    });
  },

  // Approve an analytic module
  approve: function(req, res) {
    Analytic.findOne(req.param('id')).populate('owner').exec(function (err, analytic) {
      if (err) {
        FlashService.error(req, err);
        return res.redirect('/admin/manage_analytics');
      } 

      if (!analytic) {
        FlashService.error(req, 'Analytic module not found');
        return res.redirect('/admin/manage_analytics');
      }

      var fileName = analytic.fileName,
          noExtFileName = UtilService.fileMinusExt(fileName),
          seededFileName = analytic.seededFileName,
          type = analytic.type,
          userID = analytic.owner.id;


      var pathToUploadedFile = path.join(UPLOAD_PATH, type, userID, seededFileName);
      if (!AnalyticService.extractArchive(pathToUploadedFile, type, fileName, userID)) {
        FlashService.error(req, 'Error while extracting analytics');
        return res.redirect('/admin/manage_analytics');
      }

      var pathToExtractedFile = path.join(EXTRACT_PATH, type, userID, noExtFileName);

      // TODO: Move data scripts to run, include a README for data scripts
      //AnalyticService.moveDataScripts(pathToExtractedFile, ANALYTICS_DATA_SCRIPTS_PATH)

      AnalyticService.scaffoldAnalytics(pathToExtractedFile, type, MAIN_FILE, userID, analytic.id, function (err, success) {
        if (success) {
          sails.log('Success during scaffold');
          analytic.approved = true;
          analytic.rejected = false;
          analytic.save(function (err) {
            if (err) {
              FlashService.error(req, 'Error while approving analytic package');
            } else {
              FlashService.success(req, 'Successfully approved, extracted, and scaffolded analytics');
            }
            return res.redirect('/admin/manage_analytics'); 
          });   
        } else {
          sails.log('Failure during scaffold');
          FlashService.error(req, 'Error while scaffolding analytics');
          return res.redirect('/admin/manage_analytics');        
        }
      });    
    });
  },

  // TODO: Demo a selected analytic
  demo: function(req, res) {
    FlashService.error(req, 'Currently under development');
    return res.redirect('/admin/manage_analytics');
  },

  download: function(req, res) {
    var path = require('path');
    var process = require('process');
    var fs = require('fs');
    Analytic.findOne(req.param('id')).populate('owner').exec(function (err, analytic) {
      if (err || !analytic) {
        FlashService.error(req, "This module is not currently available for download.");
        return res.redirect('/analytics');
      }
      var link = path.resolve(sails.config.paths.UPLOAD_PATH, analytic.type, analytic.owner.id, analytic.seededFileName, analytic.fileName);
      return res.download(link);
    });
  },

  // Delete a single analytic
  destroy: function(req, res) {
    Analytic.destroy(req.param('id'), function (err) {
      if (err) {
        FlashService.error(req, 'Error while deleting analytic package');
      } else {
        FlashService.success(req, 'Successfully deleted analytic package');
      }
      return res.redirect('/admin/manage_analytics');
    });
  },

  // Delete all analytics
  deleteAll: function(req, res) {
    Analytic.find().populate('owner').exec(function(err, analytics) {
      for (i = 0; i < analytics.length; i++) {
        var analytic = analytics[i];
        var analyticID = analytic.id;
        var type = analytic.type;
        var userID = analytic.owner.id;
        var fileName = analytic.seededName;

        try {
          sails.log.debug('Deleting ' + path.join(UPLOAD_PATH, type, userID));
          fs.removeSync(path.join(UPLOAD_PATH, type, userID));
          sails.log.debug('Deleting ' + path.join(EXTRACT_PATH, type, userID));
          fs.removeSync(path.join(EXTRACT_PATH, type, userID));
          sails.log.debug('Deleting ' + path.join(PUBLIC_SHARE_PATH, type, userID));
          fs.removeSync(path.join(PUBLIC_SHARE_PATH, type, userID));
          sails.log.debug('Deleting ' + path.join(ANALYTICS_ASSETS_PATH, type, userID));
          fs.removeSync(path.join(ANALYTICS_ASSETS_PATH, type, userID));
        } catch (err) {
          sails.log.error(err);
        }

        Analytic.destroy(analyticID, function(err) {
          sails.log.debug('Analytic' + analyticID + 'destroyed');
        });
      }
      FlashService.success(req, 'Successfully deleted all analytics');
      return res.redirect('/admin/manage_analytics');
    });
  },

  // Rename an analytic module's name
  save: function(req, res) {
    Analytic.findOne(req.param('id'), function (err, analytic) {
      if (err || !analytic) {
        FlashService.error(req, 'Unable to rename analytic module. Please try again later.');
        return res.redirect('/analytic/show/' + req.param('id'));
      }

      if (req.param('name') && req.param('name') != "") analytic.name = req.param('name');
      if (req.param('description') && req.param('description') != "") analytic.description = req.param('description');
      if (req.param('url') && req.param('url') != "") analytic.url = req.param('url');

      analytic.save(function (err2) {
        FlashService.success(req, 'Successfully updated analytic module.')
        return res.redirect('/analytic/show/' + req.param('id'));
      });
    });
  },

  // Reject a analytic upload
  reject: function(req, res) {
    Analytic.findOne(req.param('id')).populate('owner').exec(function (err, analytic) {
      if (err) {
        sails.log.debug(err);
        FlashService.error(req, 'Error while rejecting analytic');
        return res.redirect('/admin/manage_analytics');
      } 

      if (!analytic) {
        FlashService.error(req, 'Analytic module not found');
        return res.redirect('/admin/manage_analytics');
      }

      var type = analytic.type,
          userID = analytic.owner.id,
          fileName = analytic.fileName,
          seededFileName = analytic.seededFileName,
          analyticID = analytic.id.toString();

      try {
        sails.log.debug('Deleting ' + path.join(UPLOAD_PATH, type, userID, seededFileName));
        fs.removeSync(path.join(UPLOAD_PATH, type, userID, seededFileName));
        sails.log.debug('Deleting ' + path.join(EXTRACT_PATH, type, userID, seededFileName));
        fs.removeSync(path.join(EXTRACT_PATH, type, userID, seededFileName));
        sails.log.debug('Deleting ' + path.join(PUBLIC_SHARE_PATH, type, userID, analyticID));
        fs.removeSync(path.join(PUBLIC_SHARE_PATH, type, userID, analyticID));
        sails.log.debug('Deleting ' + path.join(ANALYTICS_ASSETS_PATH, type, userID, analyticID));
        fs.removeSync(path.join(ANALYTICS_ASSETS_PATH, type, userID, analyticID));
      } catch (err) {
        sails.log.error(err);
      }

      analytic.approved = false;
      analytic.rejected = true;
      analytic.save(function (err) {
        if (err) {
          sails.log.debug(err);
          FlashService.error(req, 'Error while rejecting analytic package');
        } else {
          FlashService.success(req, 'Rejected analytic package');
        }
        return res.redirect('/admin/manage_analytics');
      });
    });
  },

  // TODO: Implement "starring" analytics feature
  star: function(req, res) {
    if (req.isSocket) {
      User.findOne(req.session.user.id).populate('starredAnalytics').exec(function (err, user) {

        if (err || !user) sails.log.debug('Error: ' + err + ' [Users: ' + user + ']');

        var alreadyStarred = false;
        for (i = 0; i < user.starredAnalytics.length; i++) {
          if (user.starredAnalytics[i].id == req.param('id')) alreadyStarred = true;
        }

        if (alreadyStarred) {
          user.starredAnalytics.remove(req.param('id'));
        } else {
          user.starredAnalytics.add(req.param('id'));
        }
        user.save(function (err) {
          if (!err) return { result: SUCCESS };
          return { result: sails.config.constants.FAILURE };
        });

      });
    } else {
      return res.redirect('/analytics');
    }
  },

  // Handles upload of analytic archive to server.
  upload: function(req, res) {
    //if (req.param('type') == null || req.param('dataModels') == null) {
    if (req.param('dataModels') == null) {
      FlashService.error(req, 'Please fill in all fields.');
      return res.redirect('/dashboard');
    }

    var params = req.params.all(),
        type = 'd3', // TODO: (possibly don't need the type) req.param('type').toLowerCase(),
        seededFileName = UtilService.generateSID(),
        dirPath = path.join(UPLOAD_PATH, type, req.session.user.id, seededFileName);

    if (params['url'] == '') {
      params['url'] = 'N/A'
    }

    req.file('userArchiveFile').upload({ dirname: dirPath }, function (err, files) {
      if (err) {
        FlashService.error(req, 'An error occurred while uploading the files: ' + err);
        return res.redirect('/dashboard');
      }

      if (files.length == 0) {
        FlashService.error(req, 'An unknown error has occurred.');
        return res.redirect('/dashboard');
      }

      var file = files[0],
          fileName = file.filename,
          pathToUploadedFile = file.fd;

      params['type'] = type;
      params['fileName'] = fileName;
      params['seededFileName'] = seededFileName;


      if (!AnalyticService.verifyArchive(UtilService.fileExtension(fileName))) {
        // TODO: Cleanup and delete archive
        FlashService.error(req, 'Invalid archive format - only .zip and tar.gz files are accepted');
        return res.redirect('/dashboard');
      }

      UtilService.moveCommand(pathToUploadedFile, path.resolve(dirPath, fileName), false, function(error, success) {

        if (error || !success) {
          // TODO: Cleanup and delete archive
          FlashService.error(req, 'Error while uploading analytic');
          sails.log.debug(error);
          return res.redirect('/dashboard');
        }

        Analytic.create(params, function analyticCreated(err, analytic) {
          if (err || !analytic) {
            FlashService.error(req, err ? 'Error uploading analytic: ' + err : 'Error uploading analytic');
            return res.redirect('/dashboard');
          }

          sails.log.debug("Uploaded file: " + dirPath + "/" + fileName);
          FlashService.success(req, 'Successfully uploaded analytic to server');
          return res.redirect('/dashboard');
        });
      });
    });
  }
};
