var path = require('path');
var sid = require('shortid');
var process = require('process');
var fs = require('fs-extra');

var SUCCESS = sails.config.constants.SUCCESS,
    FAILURE = sails.config.constants.FAILURE;

var TYPES = ['pii', 'non_pii'],
    DATASET_ROOT = sails.config.paths.DATASET_ROOT,
    ENCRYPT_PATH = sails.config.paths.DATASET_ENCRYPT_PATH;

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

function mapTypes(type) {
  if (type == 'pii') return 'pii';
  if (type == 'non-pii') return 'non_pii';
  return '';
}

module.exports = {
  //TODO
  importPublicKey: function(user) {
    if (!user) {
      sails.log.debug('No user found');
      return FAILURE;
    }

    var keyDirPath = path.resolve('..', 'keys');
    fs.ensureDirSync(keyDirPath);

    var keyPath = path.resolve(keyDirPath, UtilService.addFileExt(user.id, '.key'));
    fs.writeFile(keyPath, user.publicKey, function(err) {
      if (err) {
        sails.log.error('Error while importing key - unable to write key to file: ' + err + ' [path: ' + keyPath + ']');
        //TODO: Add notice for public key
        return FAILURE;
      } else {
        var importCmd = 'gpg --import ' + keyPath;
        sails.log.debug('Importing public key for user ' + user.id + ': ' + importCmd);
        var exec = require('child_process').exec;

        exec(importCmd, function(error, stdout, stderr) {
          sails.log.debug('stdout: ' + stdout);
          sails.log.debug('stderr: ' + stderr);

          if (error) {
            sails.log.error('Error while importing key: ' + error);
            fs.unlinkSync(keyPath);
            return FAILURE;
          } else {
            fs.unlinkSync(keyPath);
            return SUCCESS;
          }
        });
      }
    });
  },

  encrypt: function(user, dataset, type, cb) {
    var exec = require('child_process').exec,
        cmd = encryptCommand(user, dataset, mapTypes(type));

    // TODO: Move this into encrypt function
    exec(cmd, function(error, stdout, stderr) {
      return cb(error, stdout, stderr, cmd);
    });
  }
}