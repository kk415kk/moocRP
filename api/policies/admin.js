/** 
 * Allow any authenticated user.
 */

module.exports = function(req, res, ok) {
	if (req.session.user && req.session.user.admin) {
		return ok();
	} else {
		var requireAdminError = [{name: 'requireAdminError', message: 'You must be an admin.'}]
		req.session.flash = {
			err: requireAdminError
		}
		res.redirect('/login');
		return;
	}
}