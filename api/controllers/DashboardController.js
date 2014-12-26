/*******************************************
 * Copyright 2014, moocRP                  *
 * Author: Kevin Kao                       *
 *******************************************/

/**
 * DashboardController
 *
 * @module      :: Controller
 * @description :: A set of functions called `actions`.
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

var fs = require('fs-extra');
var path = require('path');

module.exports = {
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to DashboardController)
   */
  _config: {},


  // NOTE: Potentially useful: http://stackoverflow.com/questions/23446484/sails-js-populate-nested-associations
  display: function(req, res) {
    User.findOne(req.session.user.id).populateAll().exec(function foundRequests(err, user) {
      DataModel.find().exec(function foundDataModels(err, dataModels) {

        for (var i = 0; i < user.requests.length; i++) {
          var updatedRequest;
          Request.findOne(user.requests[i].id).populate('dataModel').exec(function (err, request) {
            updatedRequest = request;
          }); 
          // Bypass the async nature of populating
          while (!updatedRequest) { require('deasync').runLoopOnce(); }
          user.requests[i] = updatedRequest;
        }


        var pii_datasets = {}
        var non_pii_datasets = {};
        for (i = 0; i < dataModels.length; i++) { 
          var dataModelFolder = dataModels[i].fileSafeName;
          fs.ensureDirSync(path.join(sails.config.paths.DATASET_NON_PII, dataModelFolder));
          fs.ensureDirSync(path.join(sails.config.paths.DATASET_PII, dataModelFolder));

          var datasets = fs.readdirSync(path.join(sails.config.paths.DATASET_NON_PII, dataModelFolder));
          for (j = 0; j < datasets.length; j++) {
            datasets[j] = UtilService.fileMinusExt(datasets[j]);
          }
          non_pii_datasets[dataModels[i].displayName] = datasets;

          datasets = fs.readdirSync(path.join(sails.config.paths.DATASET_PII, dataModelFolder));
          for (j = 0; j < datasets.length; j++) {
            datasets[j] = UtilService.fileMinusExt(datasets[j]);
          }
          pii_datasets[dataModels[i].displayName] = datasets;
          dataModels[i] = dataModels[i].displayName;
        }

        // var non_pii_datasets = fs.readdirSync(sails.config.paths.DATASET_NON_PII);
        // for (i = 0; i < non_pii_datasets.length; i++) {
        //   non_pii_datasets[i] = UtilService.fileMinusExt(non_pii_datasets[i]); // filter file extensions
        // }
        
        res.view({
          user: user,
          requests: user.requests,
          title: 'Dashboard',
          non_pii_datasets: non_pii_datasets,
          pii_datasets: pii_datasets,
          dataModels: dataModels,
          starredVisuals: user.starredVisuals,
          visualizations: user.visualizations,
          maxCount: 5
        });
      });
    });
  }  
};
