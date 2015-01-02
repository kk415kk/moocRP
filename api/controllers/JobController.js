/**
 * JobController
 *
 * @description :: Server-side logic for managing jobs
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var updateStartTime = function (jobID, startTime, cb) {

}

var updateEndTime = function (jobID, endTime, cb) {

}

var updateStatus = function(jobID, status, cb) {

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

  },
  update: function(req, res) {
    
  }
};

