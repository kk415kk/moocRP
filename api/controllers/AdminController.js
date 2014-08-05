/**
 * AdminController
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
   * (specific to AdminController)
   */
  _config: {},

  // View to show all users on page
  manage_users: function(req, res, next) {
    User.find(function foundUsers(err, users) {
      if (err) {
        req.session.messages = { error: [err] };
        return next(err);
      }

      res.view({
        users: users,
        title: 'Manage Users'
      });
    });
  },

  // View to manage requests by researchers
  manage_requests: function (req, res, next) {
    Request.find(function foundRequests(err, requests) {
      if (err) {
        req.session.messages = { error: [err] };
        return next(err);
      }

      res.view({
        requests: requests,
        title: 'Manage Requests'
      });
    }); 
  },

  // View to manage uploads by researchers
  manage_analytics: function(req, res, next) {
    Visualization.find(function foundVisualizations(err, visualizations) {
      if (err) {
        req.session.messages = { error: [err] };
        return next(err);
      }

      res.view({
        title: 'Manage Analytics',
        visualizations: visualizations
      })
    });
  }
  
};
