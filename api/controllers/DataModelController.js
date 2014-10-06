/**
 * DataModelController
 *
 * @description :: Server-side logic for managing data models
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var fs = require('fs-extra');
var path = require('path');

module.exports = {
  create: function(req, res) {
    DataModel.create(req.params.all(), function dataModelCreated(err, dataModel) {
      if (err) sails.log.debug(err);

      FlashService.success(req, 'Successfully imported a new data model.');
      fs.ensureDirSync(path.join(sails.config.paths.DATASET_EXTRACT_PATH, dataModel.fileSafeName));
      return res.redirect('/admin/manage_data_models');
    });
  },
  destroy: function(req, res) {
    DataModel.destroy(req.param('id'), function (err, dataModel) {
      if (err) sails.log.debug(err);

      FlashService.success(req, 'Successfully removed a data model.');
      fs.rmdirSync(path.join(sails.config.paths.DATASET_EXTRACT_PATH, dataModel[0].fileSafeName));
      return res.redirect('/admin/manage_data_models');
    });
  },
  edit: function(req, res) {
    var params = req.params.all(),
        updateParams = {};

    DataModel.findOne(params['id'], function(err, dataModel) {
      updateParams['files'] = dataModel.files

      if (params['file'] != '') {
        updateParams['files'].append(params['file']);
      }

      DataModel.update(params['id'], updateParams, function (err) {
        if (err) sails.log.error(err);
        return res.redirect('/admin/manage_data_models')
      });
    });
  }
	
};

