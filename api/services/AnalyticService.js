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
    ANALYTICS_DATA_SCRIPTS_PATH = sails.config.paths.ANALYTICS_SCRIPT_PATH,
    MAIN_FILE = 'main.html',
    ARCHIVE_TYPES = ['zip'];

var SUCCESS = sails.config.constants.SUCCESS,
    FAILURE = sails.config.constants.FAILURE;

module.exports = {

  /********************
   * Helper Functions *
   ********************/
  /**
   * @param fileExt: the file extension to be used
   * @return true if the file archive type is supported
   */
  verifyArchive: function(fileExt) {
    return ARCHIVE_TYPES.indexOf(fileExt) > -1;
  },

  /**
   * @return the path to the folder of the extracted analytic
   */
  createExtractPath: function(type, userID, noExtFileName) {
    return path.join(EXTRACT_PATH, type, userID, noExtFileName);
  },

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
  extractArchive: function(pathToFile, type, fileName, userID) {
    sails.log.debug('Extracting analytic from ' + pathToFile + '/' + fileName + ' for user ' + userID);
    var AdmZip = require('adm-zip');

    try {
      var unzipper = new AdmZip(path.join(pathToFile, fileName)),
          unzipTo = AnalyticService.createExtractPath(type, userID, UtilService.fileMinusExt(fileName)),
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
  },

  /**
   * @param html
   * @return html that has the correct dependencies linked
   */
  linkAssets: function(html, type, userID, analyticID) {
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

    // TODO: Parse and remove common classes, such as "container" or "wrapper" or "banner"
    return $.html();
  },

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
  scaffoldAnalytics: function(pathToFile, type, fileName, userID, analyticID, next) {
    sails.log.debug('Scaffolding analytic from ' + pathToFile + '/' + fileName + ' for user ' + userID);
    var analyticFiles = shell.ls(pathToFile);

    if (analyticFiles.length == 0 || analyticFiles.indexOf(fileName) == -1) {
      sails.log.debug('Could not find ' + fileName + ' from these files: ');
      sails.log.debug(analyticFiles);
      return next('Could not find ' + fileName, FAILURE);
    }

    // TODO: Add security parsing for d3Code
    var d3Code = fs.readFileSync(path.join(pathToFile, fileName), 'utf-8');
    var preparedCode = AnalyticService.linkAssets(d3Code, type, userID, analyticID);
    preparedCode = fs.readFileSync(path.join(STORED_SCAFFOLDS_PATH, 'd3_scaffold.ejs'), 'utf-8').replace("<!--INSERT-->", preparedCode);

    var sharePath = path.join(PUBLIC_SHARE_PATH, type, userID.toString(), analyticID.toString());
    var assetsPath = path.join(ANALYTICS_ASSETS_PATH, type, userID.toString(), analyticID.toString())

    //TODO: Parse HTML link tags in main.html and replace the correct src path
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
  },

  // TODO
  moveDataScripts: function(pathToExtractedFile, moveToFolder) {
    // Move the "preprocessing" folder to "moveToFolder"
  }
  
}