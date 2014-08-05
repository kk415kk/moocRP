/*************************************************
 * Copyright 2014, moocRP                        *
 * Author: Kevin Kao                             *
 *************************************************/

module.exports.util = {

  removeFileExtension: function(filename) {
    return filename.replace(/\.[^/.]+$/, "");
  }

};