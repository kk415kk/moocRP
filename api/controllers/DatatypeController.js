/**
 * DatatypeController
 *
 * @description :: Server-side logic for managing datatypes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var fs = require('fs-extra');
var path = require('path');

module.exports = {
  create: function(req, res) {
    Datatype.create(req.params.all(), function datatypeCreated(err, datatype) {
      if (err) sails.log.debug(err);

      FlashService.success(req, 'Successfully imported a new datatype.');
      fs.ensureDirSync(path.join(sails.config.paths.DATASET_EXTRACT_PATH, datatype.fileSafeName));
      return res.redirect('/admin/manage_datatypes');
    });
  },
  destroy: function(req, res) {
    Datatype.destroy(req.param('id'), function (err, datatype) {
      if (err) sails.log.debug(err);

      FlashService.success(req, 'Successfully removed a datatype.');
      fs.rmdirSync(path.join(sails.config.paths.DATASET_EXTRACT_PATH, datatype[0].fileSafeName));
      return res.redirect('/admin/manage_datatypes');
    });
  }
	
};

