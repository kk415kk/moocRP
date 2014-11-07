/**
 * NoticeController
 *
 * @description :: Server-side logic for managing notices
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function(req, res) {
    Notice.create(req.params.all(), function(err, notice) {
      if (err || !notice) {
        sails.log.error(err);
        FlashService.error(req, "Unable to create notice.");
        return res.redirect('/admin/manage_notices');
      } 

      FlashService.success(req, 'Successfully created a notice.');
      return res.redirect('/admin/manage_notices');
    });
  },
  destroy: function(req, res) {
    Notice.destroy(req.param('id'), function(err) {
      if (err) {
        FlashService.error(req, "Unable to destroy notice.");
      } else {
        FlashService.success(req, "Successfully destroyed notice.");
      }
      return res.redirect('/admin/manage_notices');
    });
  }
};

