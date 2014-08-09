/*******************************************
 * Copyright 2014, moocRP                  *
 * Author: Kevin Kao                       *
 *******************************************/

/**
 * RequestController
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

var path = require('path');
var TYPES = ['pii', 'non_pii'],
    DATASET_ROOT = sails.config.paths.DATASET_ROOT,
    ENCRYPT_PATH = sails.config.paths.DATASET_ENCRYPT_PATH;

function mapTypes(type) {
  if (type == 'pii') return 'pii';
  if (type == 'non-pii') return 'non_pii';
  return '';
}

function generateFilePath(dataset, type) {
  if (dataset == null || TYPES.indexOf(type) == -1) return '';
  return path.resolve(DATASET_ROOT, type, dataset);
}

function generateEncryptedPath(dataset, userID) {
  if (dataset == null) return '';
  return path.resolve(ENCRYPT_PATH, dataset + '_' + userID);
}

function encryptCommand(user, dataset, type, cb) {
  if (user == null) return '';
  var pathToDataset = UtilService.addFileExt(generateFilePath(dataset, type), '.zip'),
      pathToEncrypted = UtilService.addFileExt(generateEncryptedPath(dataset, user.id), '.zip.gpg')
      encryptCmd = 'gpg --batch --yes --output ' + pathToEncrypted + ' --encrypt -r ' + user.publicKeyID + ' ' + pathToDataset;
      sails.log.info('Encrypting: ' + encryptCmd);
  return encryptCmd;
}

module.exports = {

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to RequestController)
   */
   _config: {},
   
  // Create a data request
  create: function(req, res) {
  	Request.create(req.params.all(), function requestCreated(err, request) {
  		if (err) {
  			req.session.messages = { error: ["Please fill in all fields"] };
			} else {
        req.session.messages = { success: ['Successfully created a data request']}
      }
      return res.redirect('/dashboard');
  	});
  }, 

  // Deny a data request
  deny: function(req, res) {
    Request.findOne(req.param('id'), function foundRequest(err, request) {
      if (err) {
        req.session.messages = { error: [err] };
        return next(err);
      }
      if (!request) {
        req.session.messages = { error: ['Request does not exist'] };
      }

      request.granted = false
      request.denied = true
      request.save(function (err) {
        if (err) {
          sails.log.error(err);
          req.session.messages = { error: ['An error occurred while denying the request'] };
        } else {
          req.session.messages = { success: ['Successfully denied request'] };
        }
        return res.redirect('/admin/manage_requests');
      });
    }); 
  },

  // Generate download for a data request
  download: function(req, res) {
    var path = require('path');
    var process = require('process');
    var fs = require('fs');

    Request.findOne(req.param('request_id')).exec(function foundRequest(err, request) {
      if (err) {
        req.session.messages = { error: [err] };
        return res.redirect('/dashboard');
      }
      if (!request) {
        req.session.messages = { error: ["Request does not exist"] };
      }
      var data = request.dataset + '_' + request.userID + '.zip.gpg',
          userID = req.session.user.id;
      var link = path.resolve(ENCRYPT_PATH, data);

      request.downloaded = true
      request.save(function (err) {
        if (err) {
          sails.log.error(err);
          return res.redirect('/dashboard');
        } else {
          sails.log.debug("Request " + request.id + " is being fulfilled and downloaded");
          sails.log.debug("Downloading: " + link);
          return res.download(link);
        }
      });
    });   
  },

  // Delete all data requests - used for development 
  deleteAll: function(req, res) {
    Request.find().exec(function(err, requests) {
      for (request in requests) {
        Request.destroy(request.id, function(err) {
          sails.log.debug('Request destroyed');
        });
      }
      req.session.messages = { success: ['Successfully deleted all requests'] };
      return res.redirect('/admin/manage_requests');
    });
  },

  // Grant the data request
  grant: function(req, res) {
    Request.findOne(req.param('id'), function foundRequest(err, request) {
      if (err) {
        req.session.messages = { error: [err] };
        return res.redirect('/admin/manage_requests');
      }
      if (!request) {
        req.session.messages = { error: ['Request does not exist'] };
        return res.redirect('/admin/manage_requests');
      }

      User.findOne(req.session.user.id, function foundUser(err, user) {
        if (err || !user) {
          req.session.messages = { error: ['An error has occurred'] };
          return res.redirect('/admin/manage_requests');
        }

        // KK-080114: Add script to run to encrypt the ZIP file and move it into an encrypted folder.
        var exec = require('child_process').exec,
            cmd = encryptCommand(req.session.user, request.dataset, mapTypes(request.requestType));

        // TODO: Move this into encrypt function
        exec(cmd, function(error, stdout, stderr) {
          if (error) {
            sails.log.error('Command: ' + cmd + '\t [Error: ' + error + ']');
            req.session.messages = { error: ['An error occurred while encrypting dataset: ' + error]}
            return res.redirect('/admin/manage_requests');
          }

          sails.log.debug('stdout: ' + stdout);
          sails.log.debug('stderr: ' + stderr);

          request.granted = true;
          request.denied = false;
          request.save(function (err) {
            if (err) {
              req.session.messages = { error: ['An error occurred while granting request'] };
            } else {
              req.session.messages = { success: ['Successfully granted request'] };
            }
            return res.redirect('/admin/manage_requests');
          });
        });
      }); 
    }); 
  }
};
