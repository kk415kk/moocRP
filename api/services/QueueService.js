var kue = require('kue');
var jobs;

module.exports = {
  launchQueue: function() {
    sails.log.info('Launching jobs queue...');
    jobs = kue.createQueue();
    sails.log.info('Jobs queue launched')
  },
}