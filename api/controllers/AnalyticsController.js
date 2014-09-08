/*******************************************
 * Copyright 2014, moocRP                  *
 * Author: Kevin Kao                       *
 *******************************************/

/**
 * AnalyticsController
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
   * (specific to AnalyticsController)
   */
  //_config: {}

  index: function(req, res) {
    return res.redirect('/analytics/analytics');
  },

  analytics: function(req, res) {
    Visualization.find().populate('owner').exec(function (err, visualizations) {
      User.findOne(req.session.user.id).populate('starredVisuals').exec(function (err, thisUser) {
        Datatype.find().exec(function (err, datatypes) {

          var fs = require('fs-extra');
          fs.ensureDirSync(DATASET_EXTRACT_PATH);
          var extractedDatasets = {};

          for (i = 0; i < datatypes.length; i++) {
            var folderPath = path.resolve(DATASET_EXTRACT_PATH, datatypes[i].fileSafeName);
            fs.ensureDirSync(folderPath);

            var datasetFolders = fs.readdirSync(folderPath);
            var currDatatype = datatypes[i];
            extractedDatasets[currDatatype.fileSafeName] = [];

            for (j = 0; j < datasetFolders.length; j++) {
              var nextFolderPath = path.resolve(folderPath, datasetFolders[j]);
              var datasets = fs.readdirSync(nextFolderPath);

              for (k = 0; k < datasets.length; k++) {
                var infoKey = currDatatype.fileSafeName
                var infoObj = [currDatatype.displayName, UtilService.fileMinusExt(datasets[k])];
                extractedDatasets[infoKey].push(infoObj);
              }
            }
          }

          // Get a list of visualization IDs that are starred by this current user
          var starredIdList = [];
          thisUser.starredVisuals.forEach(function (starred) {
            starredIdList.push(starred.id);
          });

          return res.view({
            title: 'Analytics',
            visualizations: visualizations,
            starredVisuals: thisUser.starredVisuals,
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
      res.write("var dataset = '");
      var datastream = fs.createReadStream(
        path.resolve(DATASET_EXTRACT_PATH, datatype, dataset, dataset + '.csv')
      );

      datastream.pipe(res, {end: false});
      datastream.on('end', function() {
        res.send("';");
      });
    } else {
      User.findOne(req.session.user.id, function (err, user) {
        // TODO: Use this user and add "granted" datasets to store somewhere, so user can only access datasets with granted access

        Visualization.findOne(req.param('visualID'), function (err, visualization) {

          if (err) {
            sails.log.error("Error occurred while loading visualization: " + err.code);

            if (err.code != 'E_UNKNOWN') {
              FlashService.error(req, 'Error occurred while loading visualization: ' + err);
              return res.redirect('/analytics');
            }
          }

          //TODO: Add dataset extraction script in future instead of bundling dataset in ZIP file
          // Use resque
          var requestedType = _.isEmpty(req.param('visualType')) ? 'error' : req.param('visualType'),
              requestedUser = _.isEmpty(req.param('userID')) ? 'error' : req.param('userID'),
              requestedVisual = _.isEmpty(req.param('visualID')) ? 'error' : req.param('visualID'),
              requestedData = _.isEmpty(req.param('datasetName')) ? 'error' : req.param('datasetName'),
              baseResource = 'analytics/share/' + requestedType + '/' + requestedUser + '/' + requestedVisual,
              requestedPage = visualization ? baseResource + '/main' : baseResource,
              requestedFile = sails.config.paths.views + '/' + requestedPage + '.ejs';

          if (requestedData == 'error' || req.param('datasetName') == 'select') {
            FlashService.error(req, 'Please select a dataset.');
            return res.redirect('/analytics');
          }

          // TODO: Enforce blacklist of __ in file name of Datatype model
          var datatype = requestedData.split('__')[0];
          var dataset = requestedData.split('__')[1];

          // TODO: Handle all types of files, not just CSV
          // TODO: Create a job queue to extract all datasets 
          var data = fs.readFileSync(path.resolve(DATASET_EXTRACT_PATH, datatype, dataset, dataset + '.csv'), 'utf-8');
          //var data = undefined;
          return res.view(requestedPage, { title: 'Analytics', dataset: encode(data) });        
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