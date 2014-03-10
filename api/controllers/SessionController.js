/**
 * SessionController
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
   * (specific to SessionController)
   */
  //_config: {}

  // After clicking "log in", this action verifies and sets the new session
  new: function(req, res) {
	var bcrypt = require('bcrypt');

	// If either login field is empty, redirect to login page
	if (!(req.body.email && req.body.password)) {
		return res.redirect('/login');
	}

	// Attempt to find email from User model
	User.findOneByEmail(req.body.email).done(function(err, user) {
		if (err) {
			return res.redirect('/login');
		} else {
			if (user) {
				bcrypt.compare(req.body.password, user.password, function(err, match) {
					if (err) {
						return res.redirect('/login');
					} else {
						if (match) {
							var oldDateObj = new Date();
							var newDateObj = new Date(oldDateObj.getTime() + 3600000); // one hour before expiring
				 			req.session.cookie.expires = newDateObj;
							req.session.authenticated = true;
							req.session.user = user;
							return res.redirect('/dashboard');
						} else {
							return res.redirect('/login');
						}
					}
				});
			} else {
				return res.redirect('/login');
			}
		}
	});
  },

  // Default page if user types in the URL slug /session
  index: function(req, res) {
  	res.redirect('/home');
  }

  
};
