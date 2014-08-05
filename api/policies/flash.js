// module.exports = function(req, res, next) {
//     res.locals.flash = {};
//     if (!req.session.flash) return next();
//     res.locals.flash = _.clone(req.session.flash);
//     req.session.flash = {};
//     next();
// };

module.exports = function(req, res, next) {
  res.locals.messages = {};

  if(!req.session.messages) return next();
  res.locals.messages = _.clone(req.session.messages);

  // Clear flash
  req.session.messages = {};
  next();
};