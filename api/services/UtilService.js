/*************************************************
 * Copyright 2014, moocRP                        *
 * Author: Kevin Kao                             *
 *************************************************/

var path = require('path');
var sid = require('shortid');
var process = require('process');
var fs = require('fs-extra');
var shell = require('shelljs');

var SUCCESS = sails.config.constants.SUCCESS,
    FAILURE = sails.config.constants.FAILURE;

// Randomized Seeding - currently unused
sid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
sid.seed(42);

module.exports = {

  addFileExt: function(fileName, extension) {
    if (fileName == null || extension == null) return '';
    return fileName + extension;
  },

  /**
   * @return a random number
   */
  generateNumber: function() {
    return sid.generate();
  },

  /**
   * @return a cleaned up name for a valid file
   */
  safeFilename: function(name) {
    name = name.replace(/ /g, '-');
    name = name.replace(/[^A-Za-z0-9-_\.]/g, '');
    name = name.replace(/\.+/g, '.');
    name = name.replace(/-+/g, '-');
    name = name.replace(/_+/g, '_');
    return name;
  },

  /**
   * @return the filename without its extension
   */
  fileMinusExt: function(fileName) {
    return fileName.split('.').slice(0, -1).join('.');
  },

  /**
   * @return the file extension of the file
   */ 
  fileExtension: function(fileName) {
    return fileName.split('.').slice(-1)[0];
  },

  /**
   * @param filePath: path to file/folder to be moved
   * @param destination: path to folder to move to
   * @param allContents: if origin filePath is a folder, you can pass in a boolean true to move all contents of the folder but not the folder itself
   * @return the callback fn. with true if successful, false otherwise
   */
  moveCommand: function(filePath, destination, allContents, cb) {
    var cmd = allContents ? 'mv ' + filePath + '/* ' + destination : 'mv ' + filePath + ' ' + destination
        exec = require('child_process').exec;

    exec(cmd, function(error, stdout, stderr) {
      if (error) {
        return cb(error, FAILURE);
      } else {
        return cb(null, SUCCESS);
      }
    });
  }

};