[Back to README](../README.md)

## Configuration Files
There are a small handful of config files to be aware of to configure moocRP. Below, each is discussed in detail.

* `moocRP/config/local.js`:
This file holds the local configuration that is NOT pushed to Github.

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


```moocRP/config/settings.js```
