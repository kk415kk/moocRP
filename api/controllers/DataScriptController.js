/**
 * DataScriptController
 *
 * @description :: Server-side logic for managing Datascripts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var PATH_CONFIG = sails.config.paths;
var DATA_DROP_PATH = PATH_CONFIG.DATASET_DROP_PATH;
var kue = require('kue');

module.exports = {
  create: function(req, res) {
    return res.redirect('/admin/manage_data_scripts');
  },
  destroy: function(req, res) {
    return res.redirect('/admin/manage_data_scripts');
  },

  script_test: function(req, res) {
    var jobs = QueueService.getQueue();
    var job = QueueService.createJob('test job', { user: 1, test: 'testparam' });

    jobs.process('archive job', 1, function (job, done) {
      var frames = job.data.frames;

      function next(i) {
        if (i > 10) {
          done();
        } else {
          sails.log(i);
          next(i+1);
        }
      }
      next(0);
    });
    return res.json({ 'progress': 'Running' });
  },

  // BUILT-IN DATA MANAGEMENT TOOLS
  // http://blog.thesparktree.com/post/92465942639/ducktyping-sailsjs-core-for-background-tasks-via
  script_archive: function(req, res) {
    var jobs = QueueService.getQueue();
    var job = QueueService.createJob('test job', { user: 1, test: 'testparam' });

    jobs.process('archive job', 1, function (job, done) {
      var frames = job.data.frames;

      function next(i) {
        if (i > 10) {
          done();
        } else {
          sails.log(i);
          next(i+1);
        }
      }
      next(0);
    });
    return res.json({ 'progress': 'Running' });
  },
  
  script_move: function(req, res) {
    return res.redirect('/admin/manage_data_scripts');
  },

  upload: function(req, res) {
    return res.redirect('/admin/manage_data_scripts');
  }
};

