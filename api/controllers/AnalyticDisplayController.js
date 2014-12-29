/*******************************************
 * Copyright 2014, moocRP                  *
 * Author: Kevin Kao                       *
 *******************************************/

/**
 * AnalyticDisplayController
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

var path = require('path');
var DATASET_EXTRACT_PATH = sails.config.paths.DATASET_EXTRACT_PATH;

function encode(data) {
  if (data) {
    var cleanedData = JSON.stringify(data).replace(/\\n/g, "\\\\n");
                                          //.replace(/\\\\/g, "\\\\\\")
                                          // .replace(/\\"/g, '\\\\"')
                                          // .replace(/\\r/g, "\\\\r")
                                          // .replace(/\\t/g, "\\\\t")
                                          // .replace(/\\f/g, "\\\\f");
    return JSON.parse(cleanedData);
  }
  return data;
}

module.exports = {
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AnalyticDisplayController)
   */
  //_config: {}

  index: function(req, res) {
    return res.redirect('/analytics/analytics');
  },

  analytics: function(req, res) {
    Analytic.find().populate('owner').exec(function (err, analytics) {
      User.findOne(req.session.user.id).populate('starredAnalytics').populate('requests').exec(function (err, thisUser) {
        DataModel.find().exec(function (err, dataModels) {

          var fs = require('fs-extra');
          fs.ensureDirSync(DATASET_EXTRACT_PATH);
          var extractedDatasets = {};

          for (i = 0; i < dataModels.length; i++) {
            var folderPath = path.resolve(DATASET_EXTRACT_PATH, dataModels[i].fileSafeName);
            fs.ensureDirSync(folderPath);

            var datasetFolders = fs.readdirSync(folderPath);
            var currDataModel = dataModels[i];
            extractedDatasets[currDataModel.fileSafeName] = [];


            for (j = 0; j < datasetFolders.length; j++) {
              var infoKey = currDataModel.fileSafeName
              var infoObj = [currDataModel.displayName, datasetFolders[j]];
              extractedDatasets[infoKey].push(infoObj);

              // var nextFolderPath = path.resolve(folderPath, datasetFolders[j]);
              // var datasets = fs.readdirSync(nextFolderPath);

              // for (k = 0; k < datasets.length; k++) {
              //   var infoKey = currDataModel.fileSafeName
              //   var infoObj = [currDataModel.displayName, UtilService.fileMinusExt(datasets[k])];
              //   extractedDatasets[infoKey].push(infoObj);
              // }
            }
          }

          // Get a list of analytic IDs that are starred by this current user
          var starredIdList = [];
          thisUser.starredAnalytics.forEach(function (starred) {
            starredIdList.push(starred.id);
          });

          return res.view({
            title: 'Analytics',
            analytics: analytics,
            starredAnalytics: thisUser.starredAnalytics,
            starredIds: starredIdList,
            datasets: extractedDatasets
          });

        });
      });

    });
  },

  view: function(req, res) {

    var fs = require('fs');
    var path = require('path');

    if (req.isSocket) {
      // UNDER CONSTRUCTION - NOT IN USE
      res.write("var dataset = '");
      var datastream = fs.createReadStream(
        path.resolve(DATASET_EXTRACT_PATH, datatype, dataset, dataset + '.csv')
      );

      datastream.pipe(res, {end: false});
      datastream.on('end', function() {
        res.send("';");
      });
      // UNDER CONSTRUCTION -- END
    } else {
      User.findOne(req.session.user.id, function (err, user) {
        // TODO: Use this user and add "granted" datasets to store somewhere, so user can only access datasets with granted access
        Analytic.findOne(req.param('analyticID'), function (err, analytic) {
          if (err) {
            sails.log.error("Error occurred while loading analytic module: " + err.code);

            if (err.code != 'E_UNKNOWN') {
              FlashService.error(req, 'Error occurred while loading analytic module: ' + err);
              return res.redirect('/analytics');
            }
          }

          //TODO: Add dataset extraction script in future instead of bundling dataset in ZIP file
          // Use resque
          var requestedType = _.isEmpty(req.param('analyticType')) ? 'error' : req.param('analyticType'),
              requestedUser = _.isEmpty(req.param('userID')) ? 'error' : req.param('userID'),
              requestedAnalytic = _.isEmpty(req.param('analyticID')) ? 'error' : req.param('analyticID'),
              requestedData = _.isEmpty(req.param('datasetName')) ? 'error' : req.param('datasetName'),
              baseResource = 'analyticdisplay/share/' + requestedType + '/' + requestedUser + '/' + requestedAnalytic,
              requestedPage = analytic ? baseResource + '/main' : baseResource,
              requestedFile = sails.config.paths.views + '/' + requestedPage + '.ejs';

          if (requestedData == 'error' || req.param('datasetName') == 'select') {
            FlashService.error(req, 'Please select a dataset.');
            return res.redirect('/analytics');
          }

          // TODO: Enforce blacklist of __ in file name of DataModel model
          var dataModel = requestedData.split('__')[0];
          var dataset = requestedData.split('__')[1];
          var datasetFolderPath = path.resolve(DATASET_EXTRACT_PATH, dataModel, dataset);
          //var datasetFiles = fs.readdirSync(datasetFolderPath);

          DataModel.findOne({ fileSafeName: dataModel }, function (err, fDataModel) {
            var filesForView = {};
            for (i = 0; i < fDataModel.files.length; i++) {
              var cFile = fDataModel.files[i].replace('*', dataset);
              var pathTocFile = path.resolve(datasetFolderPath, cFile);
              var stats = fs.statSync(pathTocFile);
              if (stats.isFile()) {
                var fileContents = fs.readFileSync(pathTocFile, 'utf-8');
                if (/csv$/.test(cFile)) {
                  fileContents = encode(fileContents);
                } else if (/json$/.test(cFile)) {
                  fileContents = JSON.parse(fileContents);
                } else {
                  fileContents = fileContents;
                }
                filesForView[cFile] = fileContents;
              }
            }
            return res.view(requestedPage, { title: 'Analytics', datasetName: dataset, dataset: filesForView });
          });

          // TODO: Handle all types of files, not just CSV
          // TODO: Create a job queue to extract all datasets 
          //var data = JSON.stringify(JSON.parse(fs.readFileSync(path.resolve(DATASET_EXTRACT_PATH, dataModel, dataset, dataset + '.csv'), 'utf-8')));
          //var data = undefined;

          // var csvDataPath = path.resolve(DATASET_EXTRACT_PATH, dataModel, dataset, dataset + '.csv');
          // var jsonDataPath = path.resolve(DATASET_EXTRACT_PATH, dataModel, dataset, dataset + '.json');
          // sails.log(jsonDataPath);

          // var data = undefined;
          // fs.stat(csvDataPath, function (err, stats) {
          //   if (err) {
          //     fs.stat(jsonDataPath, function (err, stats) {
          //       if (!err) { data = JSON.parse(fs.readFileSync(jsonDataPath, 'utf-8')); }
          //       sails.log(data)
          //       return res.view(requestedPage, { title: 'Analytics', dataset: data });   
          //     });
          //   } else {
          //     data = fs.readFileSync(csvDataPath, 'utf-8');
          //     return res.view(requestedPage, { title: 'Analytics', dataset: encode(data) });   
          //   }
          // });
     
        });
      });
    }
  }
};


        // File verification check
        // fs.stat(requestedFile, function(err, stats) {
        //     sails.log('Requested: ' + requestedFile);
        //     sails.log(stats);
        //     if (err) {
        //         if (err.code == 'ENOENT') {
        //             sails.log.warn('404');
        //             FlashService.error(req, 'Page not found');
        //             return res.redirect('/analytics');
        //         } else {
        //             sails.log.warn('500');
        //             FlashService.error(req, 'Page not found');
        //             return res.redirect('/analytics');
        //         }
        //     }
        //     return res.view(requestedPage);
        // });