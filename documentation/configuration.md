[Back to README](../README.md)

## Configuration Files
There are a small handful of config files to be aware of to configure moocRP. Below, each is discussed in detail.

`moocRP/config/local.js`:<br>
This file holds the local configuration that is NOT pushed to Github. Before starting the server, you *must* copy the sample `local.js` file below into `moocRP_base/moocRP/config/` and update the settings. Some settings that are necessary to configure:
* `ssl`: TODO
* `connections`: Your MySQL username and password should be updated here.
* `appEnvMap.development`: Currently, the production environment is named development due to some features provided in the development environment. This should be updated to your production server's IP address and port, or the URL.
* `casOptions`: The CAS options should be updated here for your institution. This is not necessary if your deployment is not with CAS but with another authentication system.
* `bypassLogin/bypassUserId`: For fast development purposes, this allows you to bypass login for CAS. Note that the user ID must be an existing one in the database.

A sample local.js file is displayed below:
```
module.exports = {
  // ssl: {
  //   ca: require('fs').readFileSync(__dirname + './ssl/my_apps_ssl_gd_bundle.crt'),
  //   key: require('fs').readFileSync(__dirname + './ssl/my_apps_ssl.key'),
  //   cert: require('fs').readFileSync(__dirname + './ssl/my_apps_ssl.crt')
  // },

  port: process.env.PORT || 1337,
  environment: process.env.NODE_ENV || 'development',

  /***************************************************************************
   * Please configure your local MySQL settinsg here.                        *
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
   * CAS Settings                                                            *
   ***************************************************************************/
  appEnvMap: {
    test: 'localhost:1337',
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
