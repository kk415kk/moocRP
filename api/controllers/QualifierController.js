/**
 * QualifierController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    
  


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to QualifierController)
   */
  //_config: {}
  // Action to create the qualifier
  create: function(req, res, next) {
  	// Due to some weird bug when using 'id' in the ejs view
  	var parameters = req.params.all();
  	parameters['id'] = parameters['qid'];
  	delete parameters['qid'];

    if (!req.session.authenticated || !req.session.user || !req.session.user.admin) {
      return res.redirect('/login');
    } else {
	  	Qualifier.create( parameters, function qualifierCreated(err, qualifier) {
	  		if (err) {
          req.session.flash = {
            err: ["Invalid qualifier; please make sure the qualifier id does not already exist and all fields are filled out."]
          }
	  			return res.redirect('/admin/managequalifiers');
	  		}
	  		res.redirect('/admin/managequalifiers');
	  	});
    }
  },

  destroy: function(req, res, next) {
    if (!req.session.authenticated || !req.session.user || !req.session.user.admin) {
      return res.redirect('/login');
    } else {
      Qualifier.findOne(req.param('id'), function foundQualifier(err, qualifier) {
        if (err) return next(err);
        if (!qualifier) return res.redirect('500');

        Qualifier.destroy(req.param('id'), function qualifierDestroyed(err) {
          if (err) return next(err);
        });

        res.redirect('/admin/managequalifiers');
      });
    }
  },

  index: function(req, res, next) {
    if (!req.session.authenticated || !req.session.user || !req.session.user.admin) {
      return res.redirect('/login');
    } else {
      res.redirect('/admin/managequalifiers');
    }
  }
  
};
