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

// Dependencies
var path = require('path');
var sid = require('shortid');
var process = require('process');
var fs = require('fs-extra');
var shell = require('shelljs');

// Constants
var UPLOAD_PATH = path.resolve('..', 'visualizations', 'archives'),
    EXTRACT_PATH = path.resolve('..', 'visualizations', 'tmp'),
    PUBLIC_SHARE_PATH = path.resolve('views', 'analytics', 'share'),
    SCAFFOLDS_PATH = path.resolve('assets', 'scaffolds'),
    MAIN_FILE = 'main.html',
    ARCHIVE_TYPES = ['zip'];

var SUCCESS = true,
    FAILURE = false;

// Randomized Seeding - currently unused
sid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
sid.seed(42);

/**
 * @return a cleaned up name for a valid file
 */
function safeFilename(name) {
  name = name.replace(/ /g, '-');
  name = name.replace(/[^A-Za-z0-9-_\.]/g, '');
  name = name.replace(/\.+/g, '.');
  name = name.replace(/-+/g, '-');
  name = name.replace(/_+/g, '_');
  return name;
}

/**
 * @return the filename without its extension
 */
function fileMinusExt(fileName) {
  return fileName.split('.').slice(0, -1).join('.');
}

/**
 * @return the file extension of the file
 */ 
function fileExtension(fileName) {
  return fileName.split('.').slice(-1)[0];
}

/**
 * @return true if the file archive type is supported
 */
function verifyArchive(fileExt) {
  return ARCHIVE_TYPES.indexOf(fileExt) > -1;
}

/**
 * @return the callback fn. with true if successful, false otherwise
 */
function moveCommand(filePath, destination, allContents, cb) {
  var cmd = allContents ? 'mv ' + filePath + '/* ' + destination : 'mv ' + filePath + ' ' + destination
      exec = require('child_process').exec;

  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      return cb(error, FAILURE);
    } else {
      return cb(null, SUCCESS);
    }
  });
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
 // TO-DO: Extract all files
function extractArchive(pathToFile, type, fileName, userID) {
  sails.log.debug('Extracting visualization from ' + pathToFile + '/' + fileName + ' for user ' + userID);
  var AdmZip = require('adm-zip');

  try {
    var unzipper = new AdmZip(path.join(pathToFile, fileName));
    var unzipTo = path.join(EXTRACT_PATH, type, userID, fileMinusExt(fileName));
    sails.log.debug('Unzipping archive to ' + unzipTo);
    fs.ensureDirSync(unzipTo);

    var overwrite = true;
  } catch (err) {
    sails.log.debug("Error during extraction: " + err + "[filename: " + pathToFile + " " + fileName + "]");
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
 * Also moves all files from /visualizations/tmp/<type>/<userID>/<fileName>/*
 * to /views/analytics/<type>/<userID>/<visualizationID>/
 */
function scaffoldVisualizations(pathToFile, type, fileName, userID, visualizationID, next) {
  sails.log.debug('Scaffolding visualization from ' + pathToFile + '/' + fileName + ' for user ' + userID);
  var visualizationFiles = shell.ls(pathToFile);

  if (visualizationFiles.length == 0 || visualizationFiles.indexOf(fileName) == -1) {
    sails.log.debug('Could not find main.ejs');
    return FAILURE;
  }

  // TODO: Add security parsing for d3Code
  var d3Code = fs.readFileSync(path.join(pathToFile, fileName), 'utf-8');
  var preparedCode = fs.readFileSync(path.join(SCAFFOLDS_PATH, 'd3_scaffold.ejs'), 'utf-8').replace("<!--INSERT-->", d3Code);

  var sharePath = path.join(PUBLIC_SHARE_PATH, type, userID.toString(), visualizationID.toString());

  try {
    fs.writeFile(path.join(pathToFile, fileMinusExt(fileName) + '.ejs'), preparedCode, function (err) {
      if (err) {
        sails.log.debug(err);
        fs.rmdirSync(sharePath);
        return next(FAILURE);
      }

      fs.ensureDirSync(sharePath);
      fs.removeSync(path.join(pathToFile, fileName));
      moveCommand(pathToFile, sharePath, true, function(error, success) {
        if (error) {
          req.session.messages = { error: ['An error occurred while scaffolding the visualizations package: ' + error] };
          return next(FAILURE);
        } 

        if (!success) {
          req.session.messages = { error: ['An error occurred while scaffolding the visualizations package.'] };
          return next(FAILURE);
        }

        fs.removeSync(pathToFile);
        return next(SUCCESS);
      });
    });
  } catch (err) {
    return next(FAILURE);
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
    Visualization.findOne(req.param('id')).exec(function (err, visualization) {
      if (err) {
        req.session.messages = { error: [err] };
        return res.redirect('/admin/manage_analytics');
      } 

      if (!visualization) {
        req.session.messages = { error: ['Visualization not found'] };
        return res.redirect('/admin/manage_analytics');
      }

      var fileName = visualization.fileName,
          noExtFileName = fileMinusExt(fileName),
          type = visualization.type,
          userID = req.session.user.id;


      var pathToUploadedFile = path.join(UPLOAD_PATH, type, userID);
      if (!extractArchive(pathToUploadedFile, type, fileName, userID)) {
        req.session.messages = { error: ['Error while extracting analytics'] };
        return res.redirect('/admin/manage_analytics');
      }

      var pathToExtractedFile = path.join(EXTRACT_PATH, type, userID, noExtFileName);
      scaffoldVisualizations(pathToExtractedFile, type, MAIN_FILE, userID, visualization.id, function (success) {
        if (success) {
          visualization.approved = true;
          visualization.rejected = false;
          visualization.save(function (err) {
            if (err) {
              req.session.messages = { error: ['Error while approving visualization package'] };
            } else {
              req.session.messages = { success: ['Successfully approved, extracted, and scaffoled analytics'] };
            }
            return res.redirect('/admin/manage_analytics'); 
          });   
        } else {
          req.session.messages = { error: ['Error while scaffolding analytics'] };
          return res.redirect('/admin/manage_analytics');        
        }
      });    
    });
  },

  // TODO: Demo a selected visualization
  demo: function(req, res) {
    req.session.messages = { error: ['Currently under development'] };
    return res.redirect('/admin/manage_analytics');
  },

  // Delete a single visualization
  destroy: function(req, res) {
    Visualization.destroy(req.param('id'), function (err) {
      if (err) {
        req.session.messages = { error: ['Error while deleting visualization package'] };
      } else {
        req.session.messages = { success: ['Successfully deleted visualization package'] };
      }
      return res.redirect('/admin/manage_analytics');
    });
  },

  // Delete all visualizations
  deleteAll: function(req, res) {
    Visualization.find().exec(function(err, visualizations) {
      for (i = 0; i < visualizations.length; i++) {
        var visualization = visualizations[i];
        var type = visualization.type;
        var userID = visualization.userID;
        var fileName = visualization.seededName;

        try {
          fs.removeSync(path.join(UPLOAD_PATH, type, userID));
        } catch (err) {
          sails.log.error(err);
        }

        try {
          fs.removeSync(path.join(EXTRACT_PATH, type, userID));
        } catch (err) {
          sails.log.error(err);
        }

        try {
          fs.removeSync(path.join(PUBLIC_SHARE_PATH, type, userID));
        } catch (err) {
          sails.log.error(err);
        }

        Visualization.destroy(visualization.id, function(err) {
          sails.log.debug('Visualization destroyed');
        });
      }
      req.session.messages = { success: ['Successfully deleted all analytics'] };
      return res.redirect('/admin/manage_analytics');
    });
  },

  // Reject a visualization upload
  reject: function(req, res) {
    Visualization.findOne(req.param('id')).exec(function (err, visualization) {
      if (err) {
        sails.log.debug(err);
        req.session.messages = { error: ['Error while rejecting visualization'] };
        return res.redirect('/admin/manage_analytics');
      } 

      if (!visualization) {
        req.session.messages = { error: ['Visualization not found'] };
        return res.redirect('/admin/manage_analytics');
      }

      var type = visualization.type,
          userID = visualization.userID,
          fileName = visualization.fileName,
          visualID = visualization.id.toString();

      try {
        sails.log.debug('Deleting ' + path.join(UPLOAD_PATH, type, userID, fileName));
        fs.removeSync(path.join(UPLOAD_PATH, type, userID, fileName));
        sails.log.debug('Deleting ' + path.join(EXTRACT_PATH, type, userID, fileMinusExt(fileName)));
        fs.removeSync(path.join(EXTRACT_PATH, type, userID, fileMinusExt(fileName)));
        sails.log.debug('Deleting ' + path.join(PUBLIC_SHARE_PATH, type, userID, visualID));
        fs.removeSync(path.join(PUBLIC_SHARE_PATH, type, userID, visualID));
      } catch (err) {
        sails.log.error(err);
      }

      visualization.approved = false;
      visualization.rejected = true;
      visualization.save(function (err) {
        if (err) {
          sails.log.debug(err);
          req.session.messages = { error: ['Error while rejecting visualization package'] };
        } else {
          req.session.messages = { success: ['Rejected visualization package'] };
        }
        return res.redirect('/admin/manage_analytics');
      });
    });
  },

  // Handles upload of visualization archive to server.
  upload: function(req, res) {
    if (req.param('type') == null) {
      req.session.messages = { error: ['Please fill in all fields.'] };
      return res.redirect('/dashboard');
    }

    var params = req.params.all(),
        type = req.param('type').toLowerCase(),
        dirPath = path.join(UPLOAD_PATH, type, req.session.user.id);

    req.file('userArchiveFile').upload({ dirname: dirPath }, function (err, files) {
      if (err) {
        req.session.messages = { error: ['An error occurred while uploading the files: ' + err] };
        return res.redirect('/dashboard');
      }

      if (files.length == 0) {
        req.session.messages = { error: ['An unknown error has occurred.'] };
        return res.redirect('/dashboard');
      }

      var file = files[0],
          fileName = file.filename,
          pathToUploadedFile = file.fd;

      params['type'] = type;
      params['fileName'] = fileName;


      if (!verifyArchive(fileExtension(fileName))) {
        // TODO: Cleanup and delete archive
        req.session.messages = { error: ['Invalid archive format - only .zip and tar.gz files are accepted'] };
        return res.redirect('/dashboard');
      }

      moveCommand(pathToUploadedFile, path.resolve(dirPath, fileName), false, function(error, success) {

        if (error || !success) {
          // TODO: Cleanup and delete archive
          req.session.messages = { error: ['Error while uploading visualization'] };
          return res.redirect('/dashboard');
        }

        Visualization.create(params, function visualizationCreated(err, visualization) {
          if (err) {
            req.session.messages = { error: ['Error uploading visualization: ' + err] };
            return res.redirect('/dashboard');
          }

          if (!visualization) {
            req.session.messages = { error: ['Error uploading visualization'] };
            return res.redirect('/dashboard');
          }

          sails.log.debug("Uploaded file: " + dirPath + "/" + fileName);
          req.session.messages = { success: ['Successfully uploaded visualization to server'] };
          return res.redirect('/dashboard');
        });
      });
    });
  }
};
