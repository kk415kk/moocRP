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

  // Create a user (for signup page)
  create: function(req, res, next) {
    // To prevent users from directly accessing this page through the URL
    if (req.session.authenticated || !req.session.lastPage) {
      return res.redirect('/signup');
    }

  	User.create( req.params.all(), function userCreated(err, user) {
  		if (err) {
        req.session.flash = {
            err: ["Please make sure all fields are filled in correctly, including a matching password confirmation."]
        }
        return res.redirect('/signup');
      } else {
        var oldDateObj = new Date();
        var newDateObj = new Date(oldDateObj.getTime() + 3600000); // one hour before expiring
        req.session.cookie.expires = newDateObj;
        req.session.authenticated = true;
        req.session.user = user;
        req.session.lastPage = null;
    		res.redirect('/dashboard');
      }
  	});
  },

  // Delete a user
  destroy: function(req, res, next) {
    if (!(req.session.authenticated && req.session.user && req.session.user.admin)) {
      return res.redirect('/login');
    } else {
      User.findOne(req.param('id'), function foundUser(err, user) {
        if (err) {
          req.session.flash = {
            err: ["Unknown error occurred while performing this action; please report this error."]
          }
          return next(err);
        }
        if (!user) {
          req.session.flash = {
            err: ["User does not exist"]
          }
        }

        User.destroy(req.param('id'), function userDestroyed(err) {
          if (err) return next(err);
        });

        res.redirect('/admin/manageusers');
      });
    }
  }, 

  // Edit user details
  edit: function(req, res, next) {
    // Find the user from the id passed in via params
    User.findOne(req.param('id'), function foundUser(err, user) {
      if (err) return next(err);
      if (!user) {
        req.session.flash = {
            err: ["User does not exist"]
        }
        return next();
      }

      res.view({
        user: user,
        title: 'Edit'
      });
    });
  },  

  // Redirect page only
  index: function(req, res, next) {
    if (req.session.authenticated && req.session.user && req.session.user.admin) {
      return res.redirect('/admin/manageusers');
    } else {
      return res.redirect('/home');
    }
  },

  // Login page
  login: function(req, res) {
    if (req.session.authenticated) {
      res.redirect('/dashboard');
    } else {
      // var https = require('https');
      // var url = require('url');

      // var cas_url = 'https://auth-test.berkeley.edu';
      // var login_service = '/cas/login';
      // var validation_service = '/cas/validate';
      // var service = 'https://localhost:1337';

      // res.redirect(cas_url + login_service + '?service=' + service);
      // console.log(req.headers);
      
      res.view({
        title: 'Login'
      });
    }
  },

  // Logout action
  logout: function(req, res) {
    if (req.session.authenticated) {
      req.session.user = null;
      req.session.authenticated = false;
    } 
    res.redirect('/home');
  },

  // Signup page
  signup: function(req, res) {
    if (req.session.authenticated) {
      res.redirect('/dashboard');
      return;
    }
    req.session.lastPage = 'signup';
    res.view({
      title: 'Signup'
    });
  },

  // Switches an admin to a regular user or vice versa
  switch: function(req, res, next) {
    if (!req.session.authenticated || !req.session.user || !req.session.user.admin) {
      return res.redirect('/dashboard');
    } else {
      User.findOne(req.param('id'), function foundUser(err, user) {
        if (err) return next(err);
        if (!user) return res.redirect('500');

        if (user.admin) {
          user.admin = false;
        } else {
          user.admin = true;
        }
        user.save(function (err) {
          if (err) return next(err);
        });

        res.redirect('/admin/manageusers');
      });
    }
  },

  // Updates the user information
  update: function(req, res, next) {
    return next();
  }

};
