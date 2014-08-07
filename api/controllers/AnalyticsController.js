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
var DATASET_EXTRACT_PATH = path.resolve('..', 'datasets', 'extracted');

function encode(data) {
  var cleanedData = JSON.stringify(data).replace(/\\\\/g, "\\\\\\")
                                        .replace(/\\n/g, "\\\\n")
                                        .replace(/\\"/g, '\\\\"')
                                        .replace(/\\r/g, "\\\\r")
                                        .replace(/\\t/g, "\\\\t")
                                        .replace(/\\f/g, "\\\\f");
  return JSON.parse(cleanedData);
}

/**
 * @return the filename without its extension
 */
function fileMinusExt(fileName) {
  return fileName.split('.').slice(0, -1).join('.');
}

module.exports = {
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AnalyticsController)
   */
  //_config: {}

  analytics: function(req, res) {
    Visualization.find().exec(function (err, visualizations) {
      User.find().exec(function (err, users) {

        var fs = require('fs-extra');

        fs.ensureDirSync(DATASET_EXTRACT_PATH);
        var folders = fs.readdirSync(DATASET_EXTRACT_PATH),
            extractedDatasets = [];

        for (i = 0; i < folders.length; i++) {
          var currPath = path.resolve(DATASET_EXTRACT_PATH, folders[i]);
          fs.ensureDirSync(currPath);
          var datasets = fs.readdirSync(currPath)
          
          for (j = 0; j < datasets.length; j++) {
            extractedDatasets.push(fileMinusExt(datasets[j]));
          }
        }

        res.view({
          title: 'Analytics',
          visualizations: visualizations,
          users: users,
          datasets: extractedDatasets
        });
      });
    });
  },

  datasets: function(req, res) {
    res.view({
      title: 'Analytics'
    });
  },

  display: function(req, res) {
    res.view({
      title: 'Analytics'
    });
  },

  histogram: function(req, res) {
    res.view({
      title: 'Analytics'
    });
  },

  piechart: function(req, res) {
    res.view({
      title: 'Analytics'
    });
  },

  view: function(req, res) {
    var fs = require('fs');
    var path = require('path');

    Visualization.findOne(req.param('visualID'), function (err, visualization) {

      if (err) {
        sails.log.error("Error occurred while loading visualization: " + err.code);

        if (err.code != 'E_UNKNOWN') {
          req.session.messages = { error: ['Error occurred while loading visualization: ' + err] };
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
        req.session.messages = { error: ['Please select a dataset.'] };
        return res.redirect('/analytics');
      }

      // TODO: Handle all types of files 
      var data = fs.readFileSync(path.resolve(DATASET_EXTRACT_PATH, requestedData, requestedData + '.tsv'), 'utf-8');
      return res.view(requestedPage, { dataset: encode(data) });

      // File verification check
      // fs.stat(requestedFile, function(err, stats) {
      //     sails.log('Requested: ' + requestedFile);
      //     sails.log(stats);
      //     if (err) {
      //         if (err.code == 'ENOENT') {
      //             sails.log.warn('404');
      //             req.session.messages = { error: ['Page not found'] };
      //             return res.redirect('/analytics');
      //         } else {
      //             sails.log.warn('500');
      //             req.session.messages = { error: ['Page not found'] };
      //             return res.redirect('/analytics');
      //         }
      //     }
      //     return res.view(requestedPage);
      // });
      
    });
  }
};