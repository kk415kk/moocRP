/**
 * UserController
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
   * (specific to UserController)
   */
  //_config: {},

  // View for signup page
  signup: function(req, res) {
    // if (req.session.authenticated) {
    //   req.session.authenticated = false;
    // }
  	res.view();
  },

  // Action after user clicks "submit" for signup page
  create: function(req, res, next) {
  	User.create( req.params.all(), function userCreated(err, user) {
  		if (err) {
        console.log(next(err));
        req.session.flash = {
          err: err.ValidationError
        }
        return res.redirect('/user/signup');
      } else {
        var oldDateObj = new Date();
        var newDateObj = new Date(oldDateObj.getTime() + 3600000); // one hour before expiring
        req.session.cookie.expires = newDateObj;
        req.session.authenticated = true;
    		res.redirect('/dashboard/display/');
      }
  	});
  },

  // Action when user clicks for login page
  login: function(req, res) {
    if (req.session.authenticated) {
      res.redirect('/dashboard/display/');
    } else {
      res.view();
    }
  },

  // Action when user clicks for logout page
  logout: function(req, res) {
    if (req.session.authenticated) {
      req.session.user = null;
      req.session.authenticated = false;
    } 
    res.redirect('/');
  }

};
