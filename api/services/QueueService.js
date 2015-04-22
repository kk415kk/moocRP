var kue = require('kue');
var jobs;

module.exports = {
  launchQueue: function() {
    sails.log.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    sails.log.info('====> Launching moocRP jobs queue...');
    jobs = kue.createQueue();
    kue.app.listen(3000);
    sails.log.info('====> Jobs queue launched!');
    sails.log.info('====> Listening on port 3000');
    sails.log.info('====> BETA IMPLEMENTATION');
    sails.log.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  },

  getQueue: function() {
    return jobs;
  },

  createJob: function(jobName, jobParams) {
    var job = jobs.create('test job', { title: 'a test job', user: '991426' });
    job
      .on('complete', function () {
        sails.log.info('[Job ID: ' + job.id + '] Job "' + jobName + '" 100% complete.');
      }).on('failed', function () {
        sails.log.error('[Job ID: ' + job.id + '] Job "' + jobName + '" failed.');
      }).on('progress', function (progress) {
        sails.log.info('[Job ID: ' + job.id + '] Job "' + jobName + '" ' + progress + '% complete.');
      });
      job.save();
    return job;
  }

}