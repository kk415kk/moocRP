/**
 * JobController
 *
 * @description :: Server-side logic for managing jobs
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var updateStartTime = function (jobID, startTime, cb) {
  Job.findOne(jobID, function (err, job) {
    if (err || !job) return cb(err);
    params = { status: status };
    job.startTime = startTime;
    job.save(function (err2) {
      if (err2) return cb(err2);
      return cb();
    });
  });
}

var updateEndTime = function (jobID, endTime, cb) {
  Job.findOne(jobID, function (err, job) {
    if (err || !job) return cb(err);
    params = { status: status };
    job.endTime = endTime;
    job.save(function (err2) {
      if (err2) return cb(err2);W
      return cb();
    });
  });
}

var updateStatus = function(jobID, status, cb) {
  Job.findOne(jobID, function (err, job) {
    if (err || !job) return cb(err);
    params = { status: status };
    job.status = status;
    job.save(function (err2) {
      if (err2) return cb(err2);
      return cb();
    });
  });
}

module.exports = {
	create: function(req, res) {
    var params = req.params.all();
    Job.create(params, function (err, job) {
      if (err || !job) return res.json( {'success': false });
      return res.json({ 'success': true });
    });
  },
  destroy: function(req, res) {
    Job.destroy(req.param['id'], function (err, job) {
      return res.json({ 'success': true });
    });
  },
  update: function(req, res) {
    // TODO
  }
};

