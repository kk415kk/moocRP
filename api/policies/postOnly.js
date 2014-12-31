/**
 * postOnly
 *
 * @module      :: Policy
 * @description :: Only allows POST requests
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
  if (req.method === 'POST') {
    return next();
  }
  return res.badRequest();
};