[Back to README](../README.md)

## Configuration Files
There are a small handful of config files to be aware of to configure moocRP. Below, each is discussed in detail.

`moocRP/config/local.js`:<br>
This file holds the local configuration that is NOT pushed to Github. Before starting the server, you *must* copy the sample `local.js` file below into `moocRP_base/moocRP/config/` and update the settings. Some settings that are necessary to configure:
* `ssl`: TODO
* `connections`: Your MySQL username and password should be updated here.
* `transporter`: Your email service settings for sending out emails for the contact form
* `mailOptions`: Options related to the email being sent out, including the to/from fields and the subject
* `appEnvMap.development`: Currently, the production environment is named development due to some features provided in the development environment. This should be updated to your production server's IP address and port, or the URL.
* `casOptions`: The CAS options should be updated here for your institution. This is not necessary if your deployment is not with CAS but with another authentication system.
* `bypassLogin/bypassUserId`: For fast development purposes, this allows you to bypass login for CAS. Note that the user ID must be an existing one in the database.

A sample local.js file is displayed below:
```
module.exports = {
  // ssl: {
  //   ca: require('fs').readFileSync(__dirname + '/ssl/my_apps_ssl_gd_bundle.crt'),
  //   key: require('fs').readFileSync(__dirname + '/ssl/my_apps_ssl.key'),
  //   cert: require('fs').readFileSync(__dirname + '/ssl/my_apps_ssl.crt')
  // },

  port: process.env.PORT || 1337,
  environment: process.env.NODE_ENV || 'development',

  /***************************************************************************
   * Databasse Settings: please configure your local MySQL settings here.    *
   ***************************************************************************/
  connections: {
    mysql: {
      adapter: 'sails-mysql',
      host: 'localhost',
      user: 'YOUR_USERNAME',
      password: 'YOUR_PASSWORD',
      database: 'moocRP'
    }
  },

  /***************************************************************************
   * Mail Settings (Contact Form) - Nodemailer                               *
   ***************************************************************************/
  transporter: {
    service: 'Gmail',
    auth: {
        user: 'YOUR_EMAIL_ADDRESS@gmail.com',     // FILL IN EMAIL TO SEND FROM
        pass: 'YOUR_PASSWORD'                     // FILL IN PASSWORD
    }
  },

  // The contact form will forward the email to the necessary recipients
  // !! EDIT THE FIELDS BELOW !!
  // subject: The subject of the email to be used for all contact requests
  //    - the request type will be tacked on to the end of the subject
  // from: The 'from' field
  // to: Email address(es) to forward to

  mailOptions: {
    subject: 'UC Berkeley moocRP Message: ', 
    from: 'UC Berkeley moocRP - Contact Form <YOUR_EMAIL_ADDRESS@gmail.com>',
    to: 'SOME_EMAIL_TO_FORWARD_TO@INSTITUTION_NAME.edu'
  },

  /***************************************************************************
   * CAS Settings                                                            *
   ***************************************************************************/
  appEnvMap: {
    test: 'localhost',
    development: 'YOUR_SERVER_URL'
  },

  casOptions: {
    casURL: 'https://ncas-test.berkeley.edu', /* YOUR CAS URL GOES HERE */
    login: '/cas/login',                      /* YOUR CAS LOGIN PATH */
    validate: '/cas/validate',                /* YOUR CAS VALIDATE PATH */
    logout: '/cas/logout',                    /* YOUR CAS LOGOUT PATH */
    renew: true,
    gateway: false
  },

  /***************************************************************************
   * Miscellaneous Settings                                                  *
   ***************************************************************************/
  protocol: 'http://',

  // Set to false by default; set this to true for development purposes for 
  // bypassing login. The bypassUserId must be set to the ID of an existing
  // user.
  bypassLogin: (process.env.NODE_ENV || 'development') == 'development' && false,
  bypassUserId: 991426,

  // Disables GPG check (if the GPG key is valid or not)
  noCheckGPG: true
};
```
