/**
 * DashboardController
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

module.exports = {

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to DashboardController)
   */
  _config: {},
  
  display: function(req, res) {
    Request.find({ userID: req.session.user.id }).exec(function foundRequests(err, requests) {
      if (err || !requests) {
        req.session.messages = { error: [err] };
        requests = [];
      }

      Visualization.find({ userID: req.session.user.id }).exec(function foundVisualizations(err, visualizations) {
        if (err || !visualizations) {
          req.session.messages = { error: [err] };
          visualizations = [];
        } 
        
        var path = require('path');
        var process = require('process');
        var fs = require('fs');
        var util = sails.config.util;

        var datasets = fs.readdirSync(path.resolve('..', 'datasets', 'non_pii'));
        for (i = 0; i < datasets.length; i++) {
          datasets[i] = UtilService.fileMinusExt(datasets[i]); // filter file extensions
        }

        res.view({
          user: req.session.user,
          requests: requests,
          title: 'Dashboard',
          datasets: datasets,
          visualizations: visualizations,
          maxCount: 5
        });
      });
    });
  }  
};
