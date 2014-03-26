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
    if (req.session.lastPage != 'signup') {
      return res.redirect('/login');
    } else {
      var params = req.params.all();
      var uid = req.session.uid;
      params['id'] = uid;
      console.log(params);

      User.create(params, function userCreated(err, user) {
        if (err) {
          console.log(err);
          return next({err: ["Please fill in all fields"]});
        } else {
          console.log('created user successfully!');
          user.registered = true;
          user.save(function (err) {
            if (err) return next(err);
          });

          req.session.user = user;
          var oldDateObj = new Date();
          var newDateObj = new Date(oldDateObj.getTime() + 3600000); // one hour before expiring
          req.session.cookie.expires = newDateObj;
          req.session.authenticated = true;
          res.redirect('/dashboard');
        }
      });
    }
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
      var https = require('https');

      // Options should be set by admin
      // See http://www.jasig.org/cas/protocol for more options
      var options = {
        cas_url: 'https://auth-test.berkeley.edu',
        login: '/cas/login',
        validate: '/cas/validate',
        service: 'http://localhost:1337/user/validate',
        gateway: false
      };
      res.redirect(options.cas_url + options.login + '?service=' + options.service);
    }
  },

  // Logout action
  logout: function(req, res) {
    if (req.session.authenticated) {
      var request = require('request');

      var options = {
        cas_url: 'https://auth-test.berkeley.edu',
        logout: '/cas/logout',
        validate: '/cas/validate',
        service: 'http://localhost:1337',
      };
      var complete_url = options.cas_url + options.logout + '?url=' + options.service;
      req.session.user = null;
      req.session.authenticated = false;
      res.redirect(complete_url);
    } else {
      res.redirect('/home');
    }
  },

  // Signup page
  signup: function(req, res) {
    console.log(req.session.uid);
    if (req.session.authenticated) {
      req.session.lastPage = null;
      res.redirect('/dashboard');
      return;
    }

    if (!req.session.uid) {
      res.redirect('/login');
      return;
    } else {
      req.session.lastPage = 'signup';
      res.view({
        title: 'Signup'
      });
    }
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

  // Validation step called by login; redirects to signup page if necessary
  validate: function(req, res, next) {
    var ticket = req.param('ticket');

    // need to modularize this
    var https = require('https');
    var request = require('request');

    var options = {
      cas_url: 'https://auth-test.berkeley.edu',
      login: '/cas/login',
      validate: '/cas/validate',
      service: 'http://localhost:1337/user/validate',
    };

    // if a ticket was retrieved from CAS, process and verify it
    if (ticket) {
      var complete_url = options.cas_url + options.validate 
        + '?service=' + options.service + '&ticket=' + ticket;

      // validate the ticket
      request({uri: complete_url}, function(err, response, body) {
        var lines = body.split('\n');
        console.log(lines);
        if (lines[0] == 'yes') {
          var uid = lines[1];

          // look to see if user exists in our database
          User.findOne(uid, function foundUser(err, user) {
            if (err) {
              req.session.flash = {
                err: ["Unknown error occurred while performing this action; please report this error."]
              }
              return next(err);
            }

            // if user already exists, continue to dashboard
            if (user && user.registered) {
              var oldDateObj = new Date();
              var newDateObj = new Date(oldDateObj.getTime() + 3600000); // one hour before expiring
              req.session.cookie.expires = newDateObj;
              req.session.user = user;
              req.session.authenticated = true;
              res.redirect('/dashboard');
            }

            // if not, create one and go to dashboard
            if (!user || !user.registered) {
              req.session.uid = uid;
              console.log(req.session.uid);
              res.redirect('/signup');
            }
          });
        } else {
          // ticket was not valid; try to login again
          var next_url = options.cas_url + options.login + '?service=' + options.service;
          res.redirect(next_url);
        }
      });
    } else {
      // no ticket was found; login first
      var next_url = options.cas_url + options.login + '?service=' + options.service;
      res.redirect(next_url);
    }
  }

};
