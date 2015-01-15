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
    Report.find(function (err, reports) {
      return res.view({ title: 'Reports', reports: reports});
    });
  },

  send: function(req, res) {
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport(sails.config.transporter);
    var mailOptions = JSON.parse(JSON.stringify(sails.config.mailOptions));

    var params = req.params.all();
    var firstName = params['firstName'],
        lastName = params['lastName'],
        type = params['type'],
        emailAddress = params['emailAddress'],
        emailMessage = params['emailMessage']

    var HTMLtext = ''
    HTMLtext += '<b>From: </b>' + firstName + ' ' + lastName;
    HTMLtext += '<br><b>Type: </b>' + type;
    HTMLtext += '<br><b>Email: </b>' + emailAddress;
    HTMLtext += '<br><b>Message: </b><br>';
    HTMLtext += emailMessage;

    mailOptions['subject'] = mailOptions['subject'] + type;
    mailOptions['text'] = HTMLtext;
    mailOptions['html'] = HTMLtext;

    if (req.session.user && req.session.user.id) params['user'] = req.session.user.id;
    Report.create(params, function (err, report) {

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          sails.log(error)
          FlashService.error(req, "Unable to send message at this time. Please try again later.");
          return res.redirect('/contact');
        } else {
          sails.log('Message sent: ' +  info.response);
          FlashService.success(req, "Successfully sent message. Please allow 1-2 business days for a response.");
          return res.redirect('/contact');
        }
      });
    });
  },

  destroy: function(req, res) {
    Report.destroy(req.param('id'), function (err, report) {
      FlashService.success(req, 'Successfully deleted report.');
      return res.redirect('/report');
    });
  },

  reply: function (req, res) {
    //TODO
  },

  update_status: function (req, res) {
    //TODO
  }
	
};

