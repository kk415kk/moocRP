module.exports = {
  createSession: function(req, user) {
    req.session.user = user;
    var oldDateObj = new Date();
    var newDateObj = new Date(oldDateObj.getTime() + sails.config.cookieExpiration); // one hour before expiring
    req.session.cookie.expires = newDateObj;
    req.session.authenticated = true;
  },

  destroySession: function(req, res) {
    if (req.session.authenticated) {
      req.session.user = null;
      req.session.authenticated = false;
      return res.redirect(AuthService.logoutRoute());
    } else {
      return res.redirect('/home');
    }
  }
}