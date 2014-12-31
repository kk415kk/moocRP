/**
 * getOnly
 *
 * @module      :: Policy
 * @description :: Only allows GET requests
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
  if (req.method === 'GET') {
    return next();
  }
  return res.badRequest();
};