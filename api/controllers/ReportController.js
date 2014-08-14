/*******************************************
 * Copyright 2014, moocRP                  *
 * Author: Kevin Kao                       *
 *******************************************/

/**
 * ReportController
 *
 * @description :: Server-side logic for managing reports
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  index: function(req, res) {
    return res.view({ title: 'Reports' });
  }
	
};

