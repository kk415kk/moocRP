/*******************************************
 * Copyright 2014, moocRP                  *
 * Author: Kevin Kao                       *
 *******************************************/

/**
 * UserController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of reques      res.view({
        title: 'Signup',
      });t.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

// TODO: After deleting a user, all requests and visualizations associated
// with the user should be deleted as well.

var settings = sails.config;

module.exports = {

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {},

  // Create a user (for signup page)
  create: function(req, res, next) {
    // To prevent users from directly accessing this page through the URL
    if (req.session.lastPage != 'signup') {
      return res.redirect('500');
    } else {
      var params = req.params.all();
      params['id'] = req.session.uid;
      params['registered'] = true;

      User.create(params, function userCreated(err, user) {
        if (err || !user) {
          sails.log.debug('Error occurred: ' + err);
          FlashService.error(req, "Please fill in all fields and use a @berkeley.edu email.");
          return res.redirect('/signup');
        } else {
          SessionService.createSession(req, user);
          EncryptionService.importPublicKey(user);
          return res.redirect('/dashboard');
        }
      });
    }
  },

  // Delete a user
  destroy: function(req, res, next) {
    User.findOne(req.param('id'), function foundUser(err, user) {
      if (err) sails.log.debug(err);
      if (err || !user) return res.redirect('404');

      User.destroy(req.param('id'), function userDestroyed(err) {
        if (err) return next(err);
      });

      return res.redirect('/admin/manage_users');
    });
  }, 

  // Edit user details
  edit: function(req, res, next) {
    // Find the user from the id passed in via params
    User.findOne(req.param('id'), function foundUser(err, user) {
      if (err) sails.log.debug(err);
      if (err || !user) return res.redirect('404');
      
      return res.view({ user: user, title: 'Edit' });
    });
  },

  // Login page
  login: function(req, res) {
    // For test only -- disabled in production
    if (settings.env != 'production' && settings.bypassLogin) {
      User.findOne(settings.bypassUserId, function(err, user) {
        if (err || !user) {
          sails.log.error('Unable to bypass login!');
          return res.redirect('/')
        } else {
          FlashService.success(req, 'Bypassed login!');
          SessionService.createSession(req, user)
          return res.redirect('/dashboard');
        }
      });
    } else {
      if (req.session.authenticated) return res.redirect('/dashboard');
      return res.redirect(AuthService.loginRoute({}));
    }
  },

  // Logout action
  logout: function(req, res) {
    return SessionService.destroySession(req, res);
  },

  // TODO: Save user params (for edit/updates)
  save: function(req, res) {
    var params = req.params.all(),
        updateParams = {};

    if (params['publicKey'] != '') {
      updateParams['publicKey'] = params['publicKey'];
    }

    if (params['publicKeyID'] != '') {
      updateParams['publicKeyID'] = params['publicKeyID'];
    }

    if (params['email'] != '') {
      updateParams['email'] = params['email'];
    }

    User.findOne(params['id'], function(err, user) {
      User.update(params['id'], updateParams, function (err) {
        if (err) sails.log.error(err);

        EncryptionService.importPublicKey(user);
        FlashService.success(req, 'Successfully updated user profile');
        if (req.session.user.admin) {
          return res.redirect('/admin/manage_users');
        } else {
          return res.redirect('/');
        }
      });
    });
  },

  // Show user information
  show: function(req, res) {
    User.findOne(req.param('id')).exec(function (err, user) {
      if (err) sails.log.debug(err);
      if (err || !user) return res.redirect('404');

      Request.find().where({ userID: user.id }).exec(function (err, requests) {
        if (err) sails.log.debug(err);
        if (err || !requests) requests = [];

        Visualization.find().where({ userID: user.id }).exec(function (err, visualizations) {
        if (err) sails.log.debug(err);
        if (err || !visualizations) visualizations = [];

          res.view({
            title: 'User Information',
            user: user,
            requests: requests,
            visualizations: visualizations
          });
        });
      });
    }); 
  },

  // Signup page
  signup: function(req, res) {
    if (req.session.authenticated) {
      req.session.lastPage = null;
      return res.redirect('/dashboard');
    }

    if (!req.session.uid) {
      return res.redirect('/login');
    } else {
      req.session.lastPage = 'signup';
      res.view({
        title: 'Register',
      });
    }
  },

  // Switches an admin to a regular user or vice versa
  switch: function(req, res) {
    sails.log.debug(req.params.all());
    User.findOne(req.param('id'), function foundUser(err, user) {
      if (err) sails.log.debug(err);
      if (err || !user) return res.redirect('404');

      if (user.admin) {
        user.admin = false;
      } else {
        user.admin = true;
      }

      user.save(function (err) {
        if (err) {
          FlashService.error(req, 'Error while switching user role');
        } else {
          FlashService.success(req, 'Successfully switched user role');
        }
        return res.redirect('/admin/manage_users');
      });
    });
  },

  // Validation step called by login; redirects to signup page if necessary
  validate: function(req, res, next) {
    var ticket = req.param('ticket');
    var request = require('request');

    // If a ticket was retrieved from CAS, process and verify it
    if (ticket) {
      sails.log.debug('CAS ticket issued: ' + ticket);
      AuthService.validate(AuthService.validateRoute({ticket: ticket}), function(err, uid) {
        // Check to see if user exists in our database
        User.findOne(uid, function foundUser(err, user) {
          // If user already exists, continue to dashboard
          if (user && user.registered) {
            SessionService.createSession(req, user);
            return res.redirect('/dashboard');
          }

          // If not, create one and go to dashboard
          if (!user || !user.registered) {
            req.session.uid = uid;
            return res.redirect('/signup');
          }
        });
      });
    } else {
      sails.log.debug('No ticket was found - redirecting to login again');
      return res.redirect(AuthService.loginRoute({}));
    }
  }

};
