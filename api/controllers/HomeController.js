/**
 * HomeController
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
   * (specific to HomeController)
   */
  _config: {},

  about: function(req, res) {
    res.view({
      title: 'About'
    });
  },

  index: function(req, res) {
    if (req.session.authenticated) {
      res.redirect('/dashboard');
    } else {
      res.view({
        title: 'Home'
      });
    }
  },

  tos: function(req, res) {
    res.view({
      title: 'Terms of Service'
    })
  },

  privacy: function(req, res) {
    res.view({
      title: 'Privacy Policy'
    })
  },

  contact: function(req, res) {
    res.view({
      title: 'Contact'
    });
  }
  
};
