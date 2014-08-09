var path = require('path');
var sid = require('shortid');
var process = require('process');
var fs = require('fs-extra');
var shell = require('shelljs');

var SUCCESS = sails.config.constants.SUCCESS,
    FAILURE = sails.config.constants.FAILURE;

module.exports = {
  //TODO
  importPublicKey: function(user) {
    if (!user) {
      sails.log.debug('No user found');
      return FAILURE;
    }

    var keyDirPath = path.resolve('..', 'keys');
    fs.ensureDirSync(keyDirPath);

    var keyPath = path.resolve(keyDirPath, UtilService.addFileExt(UtilService.generateNumber(), '.key'));
    fs.writeFile(keyPath, user.publicKey, function(err) {
      if (err) {
        sails.log.error('Error while importing key: ' + err);
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
            return FAILURE;
          } else {
            return SUCCESS;
          }

          // Cleanup
          fs.rmdirSync(keyPath);
        });
      }
    });
  }
}