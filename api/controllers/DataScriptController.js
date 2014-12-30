/**
 * DataScriptController
 *
 * @description :: Server-side logic for managing Datascripts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var PATH_CONFIG = sails.config.paths;
var DATA_DROP_PATH = PATH_CONFIG.DATASET_DROP_PATH;

module.exports = {
  create: function(req, res) {
    return res.redirect('/admin/manage_data_scripts');
  },
  destroy: function(req, res) {
    return res.redirect('/admin/manage_data_scripts');
  },

  // BUILT-IN DATA MANAGEMENT TOOLS
  // http://blog.thesparktree.com/post/92465942639/ducktyping-sailsjs-core-for-background-tasks-via
	script_archive: function(req, res) {
    return res.json({});
  },
  script_move: function(req, res) {
    return res.redirect('/admin/manage_data_scripts');
  }
};

