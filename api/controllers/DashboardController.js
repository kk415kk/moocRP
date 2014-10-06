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

module.exports = {
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to DashboardController)
   */
  _config: {},

  display: function(req, res) {
    User.findOne(req.session.user.id).populateAll().exec(function foundRequests(err, user) {
      DataModel.find().exec(function foundDataModels(err, dataModels) {

        for (i = 0; i < dataModels.length; i++) dataModels[i] = dataModels[i].displayName;

        var datasets = fs.readdirSync(sails.config.paths.DATASET_NON_PII);
        for (i = 0; i < datasets.length; i++) {
          datasets[i] = UtilService.fileMinusExt(datasets[i]); // filter file extensions
        }
        
        res.view({
          user: user,
          requests: user.requests,
          title: 'Dashboard',
          datasets: datasets,
          dataModels: dataModels,
          starredVisuals: user.starredVisuals,
          visualizations: user.visualizations,
          maxCount: 5
        });
      });
    });
  }  
};
