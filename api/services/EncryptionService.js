var path = require('path');
var sid = require('shortid');
var process = require('process');
var fs = require('fs-extra');

var SUCCESS = sails.config.constants.SUCCESS,
    FAILURE = sails.config.constants.FAILURE;

var TYPES = ['pii', 'non_pii'],
    DATASET_ROOT = sails.config.paths.DATASET_ROOT,
    DATASET_DOWNLOAD_ROOT = sails.config.paths.DATASET_DOWNLOAD_ROOT,
    ENCRYPT_PATH = sails.config.paths.DATASET_ENCRYPT_PATH;

function generateFilePath(dataModel, dataset, type) {
  if (dataset == null || TYPES.indexOf(type) == -1) return '';
  return path.resolve(DATASET_DOWNLOAD_ROOT, type, dataModel, dataset);
}

function generateEncryptedPath(dataModel, dataset, userID) {
  if (dataset == null) return '';
  return path.resolve(ENCRYPT_PATH, dataModel, dataset + '_' + userID);
}

function encryptCommand(user, dataModel, dataset, type, cb) {
  if (!user || !dataModel) {
    sails.log('Strange encryption error in encryptCommand');
    return ""
  }

  dataModelName = dataModel.fileSafeName;
  var pathToDataset = UtilService.addFileExt(generateFilePath(dataModelName, dataset, type), '.zip'),
      pathToEncrypted = UtilService.addFileExt(generateEncryptedPath(dataModelName, dataset, user.id), '.zip.gpg')
      encryptCmd = 'gpg --trust-model always --batch --yes --output ' + pathToEncrypted + ' --encrypt -r ' + user.publicKeyID + ' ' + pathToDataset;
      sails.log.info('Encrypting: ' + encryptCmd);

  var exec = require('child_process').exec
  exec(encryptCmd, function(error, stdout, stderr) {
    return cb(error, stdout, stderr, encryptCmd);
  });
}

function mapTypes(type) {
  if (type == 'pii') return 'pii';
  if (type == 'non-pii') return 'non_pii';
  return '';
}

module.exports = {
  //TODO
  importPublicKey: function(user, cb) {
    if (!user) {
      sails.log.debug('No user found');
      return cb(FAILURE);
    }

    var keyDirPath = path.resolve('..', 'keys');
    fs.ensureDirSync(keyDirPath);

    var keyPath = path.resolve(keyDirPath, UtilService.addFileExt(user.id, '.key'));
    fs.writeFile(keyPath, user.publicKey, function(err) {
      if (err) {
        sails.log.error('Error while importing key - unable to write key to file: ' + err + ' [path: ' + keyPath + ']');
        //TODO: Add notice for public key
        return cb(FAILURE);
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
            return cb(FAILURE);
          } else {
            fs.unlinkSync(keyPath);
            return cb(SUCCESS);
          }
        });
      }
    });
  },

  encrypt: function(user, dataModel, dataset, type, cb) {
    encryptCommand(user, dataModel, dataset, mapTypes(type), cb);
  }
}