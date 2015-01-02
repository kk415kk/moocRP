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
 * Constants    *
 ****************/
var UPLOAD_PATH = sails.config.paths.UPLOAD_PATH,
    EXTRACT_PATH = sails.config.paths.EXTRACT_PATH,
    PUBLIC_SHARE_PATH = sails.config.paths.PUBLIC_SHARE_PATH,
    STORED_SCAFFOLDS_PATH = sails.config.paths.STORED_SCAFFOLDS_PATH,
    ANALYTICS_ASSETS_PATH = sails.config.paths.ANALYTICS_ASSETS_PATH,
    ANALYTICS_REWRITE_PATH = sails.config.paths.ANALYTICS_REWRITE_PATH,
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
 * @return the path to the folder of the extracted analytic
 */
function createExtractPath(type, userID, noExtFileName) {
  return path.join(EXTRACT_PATH, type, userID, noExtFileName);
}

/**
 * @param pathToFile - directory name where the file should reside
 * @param type - type of analytic (i.e. d3, octave, other)
 * @param fileName - full name of the archive (i.e. analytic.zip)
 * @param userID - the user ID of the owner of the analytic
 *
 * Extract from /analytics/archives/<type>/<userID>/file.zip 
 * to /analytics/tmp/<type>/<userID>/<fileName>/<files>
 */
 // TODO: Extract all files
function extractArchive(pathToFile, type, fileName, userID) {
  sails.log.debug('Extracting analytic from ' + pathToFile + '/' + fileName + ' for user ' + userID);
  var AdmZip = require('adm-zip');

  try {
    var unzipper = new AdmZip(path.join(pathToFile, fileName)),
        unzipTo = createExtractPath(type, userID, UtilService.fileMinusExt(fileName)),
        overwrite = true;

    fs.ensureDirSync(unzipTo);
    sails.log.debug('Unzipping archive to ' + unzipTo);
  } catch (err) {
    sails.log.debug("Error during extraction: " + err + " [filename: " + pathToFile + "/" + fileName + "]");
    return FAILURE
  }
  sails.log.debug('Extracted analytic to ' + unzipTo + '/' + fileName);

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
 * @param html
 * @return html that has the correct dependencies linked
 */
function linkAssets(html, type, userID, analyticID) {
  var cheerio = require('cheerio'),
      $ = cheerio.load(html);
  var assetsPath = path.join(ANALYTICS_REWRITE_PATH.toString(), type.toString(), userID.toString(), analyticID.toString());

  // Parse and replace JS dependencies
  // TODO: Check if src is outside URL
  sails.log('Linking script assets');
  var scriptTagsFound = $('script');
  for (var key in scriptTagsFound) {
    if (scriptTagsFound.hasOwnProperty(key)) {
      var scriptElem = scriptTagsFound[key];

      if (scriptElem.attribs && scriptElem.attribs.src) {
        var currSource = scriptElem.attribs.src;
        var pathElem = currSource.split("/")
                                 .filter(function (arrElem) {
                                   return arrElem;
                                 }).join("/");
        pathElem = path.join(assetsPath, pathElem);
        $('script[src=\"' + currSource + '\"]').replaceWith("<script src='" + pathElem + "'>");
      }
    }
  }

  // Parse and replace CSS dependencies
  sails.log('Linked stylesheet assets');
  var linkTagsFound = $('link');
  for (var key in linkTagsFound) {
    if (linkTagsFound.hasOwnProperty(key)) {
      var cssElem = linkTagsFound[key];

      if (cssElem.attribs && cssElem.attribs.rel && cssElem.attribs.rel == 'stylesheet') {
        var currSource = cssElem.attribs.href;
        var pathElem = currSource.split("/")
                                 .filter(function (arrElem) {
                                   return arrElem;
                                 }).join("/");
        sails.log(pathElem);
        pathElem = path.join(assetsPath, pathElem);
        sails.log(pathElem);
        sails.log("<link rel= 'stylesheet' href='" + pathElem + "'>");
        $('link[href=\"' + currSource + '\"]').replaceWith("<link rel= 'stylesheet' href='" + pathElem + "'>");
      }
    }
  }
  return $.html();
}

/**
 * @param pathToFile - directory name where the extracted file(s) should reside
 * @param type - type of analytic (i.e. d3, octave, other)
 * @param fileName - the name of the main analytic .ejs file (see MAIN_FILE)
 * @param userID - the user ID of the owner of the analytic
 *
 * Scaffold from /analytics/tmp/<type>/<userID>/<fileName>/main.html 
 * to /assets/analytics/<type>/<userID>/<fileName>/<fileName>.ejs
 *
 * Also moves all main.ejs file from /analytics/tmp/<type>/<userID>/<fileName>/
 * to /views/analytics/<type>/<userID>/<analyticID>/
 *
 * Then moves all CSS and JS dependencies from /analytics/tmp/<type>/<userID>/<fileName>/css,
 * /analytics/tmp/<type>/<userID>/<analyticID>/js
 * to /assets/analytics/<type>/<userID>/<analyticID>/css (or js)
 */
function scaffoldanalytics(pathToFile, type, fileName, userID, analyticID, next) {
  sails.log.debug('Scaffolding analytic from ' + pathToFile + '/' + fileName + ' for user ' + userID);
  var analyticFiles = shell.ls(pathToFile);

  if (analyticFiles.length == 0 || analyticFiles.indexOf(fileName) == -1) {
    sails.log.debug('Could not find ' + fileName + ' from these files: ');
    sails.log.debug(analyticFiles);
    return next('Could not find ' + fileName, FAILURE);
  }

  // TODO: Add security parsing for d3Code
  var d3Code = fs.readFileSync(path.join(pathToFile, fileName), 'utf-8');
  var preparedCode = linkAssets(d3Code, type, userID, analyticID);
  preparedCode = fs.readFileSync(path.join(STORED_SCAFFOLDS_PATH, 'd3_scaffold.ejs'), 'utf-8').replace("<!--INSERT-->", preparedCode);

  var sharePath = path.join(PUBLIC_SHARE_PATH, type, userID.toString(), analyticID.toString());
  var assetsPath = path.join(ANALYTICS_ASSETS_PATH, type, userID.toString(), analyticID.toString())

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
          sails.log('An error occurred while scaffolding the analytics package: ' + error);
          return next(error, FAILURE);
        } 
        if (!success) {
          sails.log('An error occurred while scaffolding the analytics package.');
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
            sails.log('An error occurred while extracting CSS of analytic: ' + error);
             return next(error, FAILURE);
          } 

          if (!success) {
            sails.log('An error occurred while extracting CSS of analytic.');
             return next(error, FAILURE);
          }
          UtilService.moveCommand(path.join(pathToFile, 'js'), path.join(assetsPath, 'js'), true, function(error, success) {
            if (error) {
              sails.log('An error occurred while extracting JS of analytic: ' + error);
               return next(error, FAILURE);
            } 

            if (!success) {
              sails.log('An error occurred while extracting JS of analytic.');
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
   * (specific to AnalyticController)
   */
  _config: {},

  // Approve a analytic
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
      if (!extractArchive(pathToUploadedFile, type, fileName, userID)) {
        FlashService.error(req, 'Error while extracting analytics');
        return res.redirect('/admin/manage_analytics');
      }

      var pathToExtractedFile = path.join(EXTRACT_PATH, type, userID, noExtFileName);
      scaffoldanalytics(pathToExtractedFile, type, MAIN_FILE, userID, analytic.id, function (err, success) {
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

  // Reject a analytic upload
  reject: function(req, res) {
    sails.log(req.param('id'));
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

  // Handles upload of analytic archive to server.
  upload: function(req, res) {
    if (req.param('type') == null || req.param('dataModels') == null) {
      FlashService.error(req, 'Please fill in all fields.');
      return res.redirect('/dashboard');
    }

    var params = req.params.all(),
        type = req.param('type').toLowerCase(),
        seededFileName = UtilService.generateSID(),
        dirPath = path.join(UPLOAD_PATH, type, req.session.user.id, seededFileName);

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


      if (!verifyArchive(UtilService.fileExtension(fileName))) {
        // TODO: Cleanup and delete archive
        FlashService.error(req, 'Invalid archive format - only .zip and tar.gz files are accepted');
        return res.redirect('/dashboard');
      }

      UtilService.moveCommand(pathToUploadedFile, path.resolve(dirPath, fileName), false, function(error, success) {

        if (error || !success) {
          // TODO: Cleanup and delete archive
          FlashService.error(req, 'Error while uploading analytic');
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
