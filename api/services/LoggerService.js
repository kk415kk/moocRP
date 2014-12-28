// Logging service to remove logging during a 'test' env
module.exports = {
  info: function(msg) {
    if (process.env.NODE_ENV !== 'test') {
      sails.log.info(msg);
    }
  },
  debug: function(msg) {
    if (process.env.NODE_ENV !== 'test') {
      sails.log.debug(msg);
    }
  },
  error: function(msg) {
    if (process.env.NODE_ENV !== 'test') {
      sails.log.error(msg);
    }
  }
}