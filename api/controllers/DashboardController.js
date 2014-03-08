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
  //_config: {}
  display: function(req, res, next) {
    if (req.session.authenticated) {
      res.view({
        user: req.session.user
      });
    } else {
      User.findOne(req.param('id'), function foundUser(err, user) {
        if (err) {
          return next[err];
        }
        if (!user) {
          return next();
        } 
        res.view({
          user: user
        });
      });
    }
  }  
  
};
