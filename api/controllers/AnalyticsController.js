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


module.exports = {
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to AnalyticsController)
   */
  //_config: {}

  analytics: function(req, res) {
    Visualization.find().exec(function (err, visualizations) {
      User.find().exec(function (err, users) {
        res.view({
          title: 'Analytics',
          visualizations: visualizations,
          users: users
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
    Visualization.findOne(req.param('id'), function (err, visualization) {
      
      //TODO: Add dataset extraction script in future instead of bundling dataset in ZIP file

      res.view({
        title: 'Analytics'
      });
    }
  }
};
