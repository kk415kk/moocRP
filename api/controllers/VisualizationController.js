/*******************************************
 * Copyright 2014, moocRP                  *
 * Author: Kevin Kao                       *
 *******************************************/

/**
 * VisualizationController
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

/****************
 * Constants    *
 ****************/
var UPLOAD_PATH = sails.config.paths.UPLOAD_PATH,
    EXTRACT_PATH = sails.config.paths.EXTRACT_PATH,
    PUBLIC_SHARE_PATH = sails.config.paths.PUBLIC_SHARE_PATH,
    STORED_SCAFFOLDS_PATH = sails.config.paths.STORED_SCAFFOLDS_PATH,
    ANALYTICS_ASSETS_PATH = sails.config.paths.ANALYTICS_ASSETS_PATH,
    MAIN_FILE = 'main.html',
    ARCHIVE_TYPES = ['zip'];

var SUCCESS = sails.config.constants.SUCCESS,
    FAILURE = sails.config.constants.FAILURE;

/********************
 * Helper Functions *
 ********************/
/**
 * @param fileExt: the file extension to be used
 * @return true if the file archive type is supported
 */
function verifyArchive(fileExt) {
  return ARCHIVE_TYPES.indexOf(fileExt) > -1;
}

/**
 * @return the path to the folder of the extracted visualization
 */
function createExtractPath(type, userID, noExtFileName) {
  return path.join(EXTRACT_PATH, type, userID, noExtFileName);
}

/**
 * @param pathToFile - directory name where the file should reside
 * @param type - type of visualization (i.e. d3, octave, other)
 * @param fileName - full name of the archive (i.e. visualization.zip)
 * @param userID - the user ID of the owner of the visualization
 *
 * Extract from /visualizations/archives/<type>/<userID>/file.zip 
 * to /visualizations/tmp/<type>/<userID>/<fileName>/<files>
 */
 // TODO: Extract all files
function extractArchive(pathToFile, type, fileName, userID) {
  sails.log.debug('Extracting visualization from ' + pathToFile + '/' + fileName + ' for user ' + userID);
  var AdmZip = require('adm-zip');

  try {
    var unzipper = new AdmZip(path.join(pathToFile, fileName));
    var unzipTo = createExtractPath(type, userID, UtilService.fileMinusExt(fileName));
    sails.log.debug('Unzipping archive to ' + unzipTo);
    fs.ensureDirSync(unzipTo);

    var overwrite = true;
  } catch (err) {
    sails.log.debug("Error during extraction: " + err + " [filename: " + pathToFile + "/" + fileName + "]");
    return FAILURE
  }
  sails.log.debug('Extracted visualization to ' + unzipTo + '/' + fileName);

  try {
    unzipper.extractAllTo(unzipTo, overwrite);
  } catch (err) {
    sails.log.error('Error while unzipping: ' + err);
    fs.rmdirSync(unzipTo);
    return FAILURE;
  }
  return SUCCESS;
}

/**
 * @param pathToFile - directory name where the extracted file(s) should reside
 * @param type - type of visualization (i.e. d3, octave, other)
 * @param fileName - the name of the main visualization .ejs file (see MAIN_FILE)
 * @param userID - the user ID of the owner of the visualization
 *
 * Scaffold from /visualizations/tmp/<type>/<userID>/<fileName>/main.html 
 * to /assets/visualizations/<type>/<userID>/<fileName>/<fileName>.ejs
 *
 * Also moves all main.ejs file from /visualizations/tmp/<type>/<userID>/<fileName>/
 * to /views/analytics/<type>/<userID>/<visualizationID>/
 *
 * Then moves all CSS and JS dependencies from /visualizations/tmp/<type>/<userID>/<fileName>/css,
 * /visualizations/tmp/<type>/<userID>/<visualizationID>/js
 * to /assets/analytics/<type>/<userID>/<visualizationID>/css (or js)
 */
function scaffoldVisualizations(pathToFile, type, fileName, userID, visualizationID, next) {
  sails.log.debug('Scaffolding visualization from ' + pathToFile + '/' + fileName + ' for user ' + userID);
  var visualizationFiles = shell.ls(pathToFile);

  if (visualizationFiles.length == 0 || visualizationFiles.indexOf(fileName) == -1) {
    sails.log.debug('Could not find ' + fileName + ' from these files: ');
    sails.log.debug(visualizationFiles);
    return next('Could not find ' + fileName, FAILURE);
  }

  // TODO: Add security parsing for d3Code
  var d3Code = fs.readFileSync(path.join(pathToFile, fileName), 'utf-8');
  var preparedCode = fs.readFileSync(path.join(STORED_SCAFFOLDS_PATH, 'd3_scaffold.ejs'), 'utf-8').replace("<!--INSERT-->", d3Code);

  var sharePath = path.join(PUBLIC_SHARE_PATH, type, userID.toString(), visualizationID.toString());
  var assetsPath = path.join(ANALYTICS_ASSETS_PATH, type, userID.toString(), visualizationID.toString())

  //TO-DO: Parse HTML link tags in main.html and replace the correct src path

  try {
    fs.writeFile(path.join(pathToFile, UtilService.fileMinusExt(fileName) + '.ejs'), preparedCode, function (err) {
      if (err) {
        sails.log('ERROR: Unable to scaffold file');
        sails.log.debug(err);
        fs.rmdirSync(sharePath);
        return next(err, FAILURE);
      }

      fs.ensureDirSync(sharePath);
      fs.removeSync(path.join(pathToFile, fileName));

      // Move main.ejs
      UtilService.moveCommand(path.join(pathToFile, 'main.ejs'), sharePath, false, function(error, success) {
        if (error) {
          sails.log('An error occurred while scaffolding the visualizations package: ' + error);
          return next(error, FAILURE);
        } 
        if (!success) {
          sails.log('An error occurred while scaffolding the visualizations package.');
           return next(error, FAILURE);
        }

        // Move the CSS dependencies and the JS dependencies
        fs.ensureDirSync(assetsPath);
        fs.ensureDirSync(path.join(assetsPath, 'css'));
        fs.ensureDirSync(path.join(assetsPath, 'js'));
        fs.ensureDirSync(path.join(pathToFile, 'css'));
        fs.ensureDirSync(path.join(pathToFile, 'js'));
        UtilService.moveCommand(path.join(pathToFile, 'css'), path.join(assetsPath, 'css'), true, function(error, success) {
          if (error) {
            sails.log('An error occurred while extracting CSS of visualization: ' + error);
             return next(error, FAILURE);
          } 

          if (!success) {
            sails.log('An error occurred while extracting CSS of visualization.');
             return next(error, FAILURE);
          }
          UtilService.moveCommand(path.join(pathToFile, 'js'), path.join(assetsPath, 'js'), true, function(error, success) {
            if (error) {
              sails.log('An error occurred while extracting JS of visualization: ' + error);
               return next(error, FAILURE);
            } 

            if (!success) {
              sails.log('An error occurred while extracting JS of visualization.');
               return next(error, FAILURE);
            }

            fs.removeSync(pathToFile);
            return next(null, SUCCESS);
          });
        });
      });
    });
  } catch (err) {
    return next(FAILURE, err);
  }
}

module.exports = {

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to VisualizationController)
   */
  _config: {},

  // Approve a visualization
  approve: function(req, res) {
    Visualization.findOne(req.param('id')).populate('owner').exec(function (err, visualization) {
      if (err) {
        FlashService.error(req, err);
        return res.redirect('/admin/manage_analytics');
      } 

      if (!visualization) {
        FlashService.error(req, 'Visualization not found');
        return res.redirect('/admin/manage_analytics');
      }

      var fileName = visualization.fileName,
          noExtFileName = UtilService.fileMinusExt(fileName),
          type = visualization.type,
          userID = visualization.owner.id;


      var pathToUploadedFile = path.join(UPLOAD_PATH, type, userID);
      if (!extractArchive(pathToUploadedFile, type, fileName, userID)) {
        FlashService.error(req, 'Error while extracting analytics');
        return res.redirect('/admin/manage_analytics');
      }

      var pathToExtractedFile = path.join(EXTRACT_PATH, type, userID, noExtFileName);
      scaffoldVisualizations(pathToExtractedFile, type, MAIN_FILE, userID, visualization.id, function (err, success) {
        if (success) {
          sails.log('Success during scaffold');
          visualization.approved = true;
          visualization.rejected = false;
          visualization.save(function (err) {
            if (err) {
              FlashService.error(req, 'Error while approving visualization package');
            } else {
              FlashService.success(req, 'Successfully approved, extracted, and scaffoled analytics');
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

  // TODO: Demo a selected visualization
  demo: function(req, res) {
    FlashService.error(req, 'Currently under development');
    return res.redirect('/admin/manage_analytics');
  },

  // Delete a single visualization
  destroy: function(req, res) {
    Visualization.destroy(req.param('id'), function (err) {
      if (err) {
        FlashService.error(req, 'Error while deleting visualization package');
      } else {
        FlashService.success(req, 'Successfully deleted visualization package');
      }
      return res.redirect('/admin/manage_analytics');
    });
  },

  // Delete all visualizations
  deleteAll: function(req, res) {
    Visualization.find().populate('owner').exec(function(err, visualizations) {
      for (i = 0; i < visualizations.length; i++) {
        var visualization = visualizations[i];
        var visualID = visualization.id;
        var type = visualization.type;
        var userID = visualization.owner.id;
        var fileName = visualization.seededName;

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

        Visualization.destroy(visualID, function(err) {
          sails.log.debug('Visualization' + visualID + 'destroyed');
        });
      }
      FlashService.success(req, 'Successfully deleted all analytics');
      return res.redirect('/admin/manage_analytics');
    });
  },

  // Reject a visualization upload
  reject: function(req, res) {
    Visualization.findOne(req.param('id')).populate('owner').exec(function (err, visualization) {
      if (err) {
        sails.log.debug(err);
        FlashService.error(req, 'Error while rejecting visualization');
        return res.redirect('/admin/manage_analytics');
      } 

      if (!visualization) {
        FlashService.error(req, 'Visualization not found');
        return res.redirect('/admin/manage_analytics');
      }

      var type = visualization.type,
          userID = visualization.owner.id,
          fileName = visualization.fileName,
          visualID = visualization.id.toString();

      try {
        sails.log.debug('Deleting ' + path.join(UPLOAD_PATH, type, userID, fileName));
        fs.removeSync(path.join(UPLOAD_PATH, type, userID, fileName));
        sails.log.debug('Deleting ' + path.join(EXTRACT_PATH, type, userID, UtilService.fileMinusExt(fileName)));
        fs.removeSync(path.join(EXTRACT_PATH, type, userID, UtilService.fileMinusExt(fileName)));
        sails.log.debug('Deleting ' + path.join(PUBLIC_SHARE_PATH, type, userID, visualID));
        fs.removeSync(path.join(PUBLIC_SHARE_PATH, type, userID, visualID));
        sails.log.debug('Deleting ' + path.join(ANALYTICS_ASSETS_PATH, type, userID, visualID));
        fs.removeSync(path.join(ANALYTICS_ASSETS_PATH, type, userID, visualID));
      } catch (err) {
        sails.log.error(err);
      }

      visualization.approved = false;
      visualization.rejected = true;
      visualization.save(function (err) {
        if (err) {
          sails.log.debug(err);
          FlashService.error(req, 'Error while rejecting visualization package');
        } else {
          FlashService.success(req, 'Rejected visualization package');
        }
        return res.redirect('/admin/manage_analytics');
      });
    });
  },

  // TODO: Implement "starring" visualizations feature
  star: function(req, res) {
    if (req.isSocket) {
      User.findOne(req.session.user.id).populate('starredVisuals').exec(function (err, user) {

        if (err || !user) sails.log.debug('Error: ' + err + ' [Users: ' + user + ']');

        var alreadyStarred = false;
        for (i = 0; i < user.starredVisuals.length; i++) {
          if (user.starredVisuals[i].id == req.param('id')) alreadyStarred = true;
        }

        if (alreadyStarred) {
          user.starredVisuals.remove(req.param('id'));
        } else {
          user.starredVisuals.add(req.param('id'));
        }
        user.save(function (err) {
          if (!err) return { result: sails.config.constants.SUCCESS };
          return { result: sails.config.constants.FAILURE };
        });

      });
    } else {
      return res.redirect('/analytics');
    }
  },

  // Handles upload of visualization archive to server.
  upload: function(req, res) {
    if (req.param('type') == null || req.param('datatypes') == null) {
      FlashService.error(req, 'Please fill in all fields.');
      return res.redirect('/dashboard');
    }

    var params = req.params.all(),
        type = req.param('type').toLowerCase(),
        dirPath = path.join(UPLOAD_PATH, type, req.session.user.id);

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


      if (!verifyArchive(UtilService.fileExtension(fileName))) {
        // TODO: Cleanup and delete archive
        FlashService.error(req, 'Invalid archive format - only .zip and tar.gz files are accepted');
        return res.redirect('/dashboard');
      }

      UtilService.moveCommand(pathToUploadedFile, path.resolve(dirPath, fileName), false, function(error, success) {

        if (error || !success) {
          // TODO: Cleanup and delete archive
          FlashService.error(req, 'Error while uploading visualization');
          return res.redirect('/dashboard');
        }

        Visualization.create(params, function visualizationCreated(err, visualization) {
          if (err || !visualization) {
            FlashService.error(req, err ? 'Error uploading visualization: ' + err : 'Error uploading visualization');
            return res.redirect('/dashboard');
          }

          sails.log.debug("Uploaded file: " + dirPath + "/" + fileName);
          FlashService.success(req, 'Successfully uploaded visualization to server');
          return res.redirect('/dashboard');
        });
      });
    });
  }
};
