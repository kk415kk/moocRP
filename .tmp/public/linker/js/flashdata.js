/**
* Support flash data in views.
*
* Author: Ben Barber
* Author URL: http://benbarber.co.uk
* Twitter: @BenBarber
*
* Usage:
* To set an error or notice in your controller:
*
* req.flash.error('There has been an error');
* req.flash.notice('Your action was successful');
*
* To display errors or notices in your views:
*
* <% if (flash_error) { %>
*   <div class="error"><%= flash_error_message %></div>
* <% } %>
*
* <% if (flash_notice) { %>
*   <div class="notice"><%= flash_notice_message %></div>
* <% } %>
*
* For when multiple errors are set in the same request:
*
* <% if (flash_error) { %>
*   <ul id="alerts">
*   <% flash_error.forEach(function(error){ %>
*       <li class="error"><%= error.message %></li>
*   <% }) %>
* </ul>
* <% } %>
*/
module.exports = function (req,res,ok) {
 
  var session = req.session;
 
  //////////////////////////////////////
  // Flash error message handling
  //////////////////////////////////////
 
  req.flash.error = function(message) {
    req.session.error_messages.push({'message' : message})
  }
 
  var error_messages = session.error_messages || (session.error_messages = []);
  var single_error_message = '';
 
  if (!error_messages.length)
    error_messages = false;
  else if (error_messages.length == 1)
    single_error_message = error_messages[0]['message'];
 
  // Set locals for use in views
  res.locals({
    flash_error: error_messages,
    flash_error_message: single_error_message
  });
 
  // Clear out old messages
  req.session.error_messages = [];
 
 
  //////////////////////////////////////
  // Flash notice message handling
  //////////////////////////////////////
  
  req.flash.notice = function(message) {
    req.session.notice_messages.push({'message' : message})
  }
 
  var notice_messages = session.notice_messages || (session.notice_messages = []);
  var single_notice_message = '';
 
  if (!notice_messages.length)
  	notice_messages = false;
  else if (notice_messages.length == 1)
  	single_notice_message = notice_messages[0]['message'];
 
  // Set locals for use in views
  res.locals({
    flash_notice: notice_messages,
    flash_notice_message: single_notice_message
  });
 
  // Clear out old messages
  req.session.notice_messages = [];
 
  return ok();
};