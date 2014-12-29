/**
 * Local environment settings
 *
 * Use this file to specify configuration settings for use while developing
 * the app on your personal system: for example, this would be a good place
 * to store database or email passwords that apply only to you, and shouldn't
 * be shared with others in your organization.
 *
 * These settings take precedence over all other config files, including those
 * in the env/ subfolder.
 *
 * PLEASE NOTE:
 *    local.js is included in your .gitignore, so if you're using git
 *    as a version control solution for your Sails app, keep in mind that
 *    this file won't be committed to your repository!
 *
 *    Good news is, that means you can specify configuration for your local
 *    machine in this file without inadvertently committing personal information
 *    (like database passwords) to the repo.  Plus, this prevents other members
 *    of your team from commiting their local configuration changes on top of yours.
 *
 *    In a production environment, you probably want to leave this file out
 *    entirely and leave all your settings in env/production.js
 *
 *
 * For more information, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.local.html
 */

module.exports = {
  /***************************************************************************
   * Your SSL certificate and key, if you want to be able to serve HTTP      *
   * responses over https:// and/or use websockets over the wss:// protocol  *
   * (recommended for HTTP, strongly encouraged for WebSockets)              *
   *                                                                         *
   * In this example, we'll assume you created a folder in your project,     *
   * `config/ssl` and dumped your certificate/key files there:               *
   ***************************************************************************/

  // ssl: {
  //   ca: require('fs').readFileSync(__dirname + './ssl/my_apps_ssl_gd_bundle.crt'),
  //   key: require('fs').readFileSync(__dirname + './ssl/my_apps_ssl.key'),
  //   cert: require('fs').readFileSync(__dirname + './ssl/my_apps_ssl.crt')
  // },

  /***************************************************************************
   * The `port` setting determines which TCP port your app will be           *
   * deployed on.                                                            *
   *                                                                         *
   * Ports are a transport-layer concept designed to allow many different    *
   * networking applications run at the same time on a single computer.      *
   * More about ports:                                                       *
   * http://en.wikipedia.org/wiki/Port_(computer_networking)                 *
   *                                                                         *
   * By default, if it's set, Sails uses the `PORT` environment variable.    *
   * Otherwise it falls back to port 1337.                                   *
   *                                                                         *
   * In env/production.js, you'll probably want to change this setting       *
   * to 80 (http://) or 443 (https://) if you have an SSL certificate        *
   ***************************************************************************/
  port: process.env.PORT || 1337,

  /***************************************************************************
   * The runtime "environment" of your Sails app is either typically         *
   * 'development' or 'production'.                                          *
   *                                                                         *
   * In development, your Sails app will go out of its way to help you       *
   * (for instance you will receive more descriptive error and               *
   * debugging output)                                                       *
   *                                                                         *
   * In production, Sails configures itself (and its dependencies) to        *
   * optimize performance. You should always put your app in production mode *
   * before you deploy it to a server.  This helps ensure that your Sails    *
   * app remains stable, performant, and scalable.                           *
   *                                                                         *
   * By default, Sails sets its environment using the `NODE_ENV` environment *
   * variable.  If NODE_ENV is not set, Sails will run in the                *
   * 'development' environment.                                              *
   ***************************************************************************/
  environment: process.env.NODE_ENV || 'development',

  /***************************************************************************
   * Database Settings                                                       *
   *                                                                         *
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
   * Mail Settings (Contact Form)                                            *
   ***************************************************************************/
  transporter: {
    service: 'Gmail',
    auth: {
        user: 'YOUR_EMAIL',
        pass: 'YOUR_PASSWORD'
    }
  },

  // The contact form will forward the email to the necessary recipients
  mailOptions: {
    subject: 'UC Berkeley moocRP Message: ',  // The request type will be tacked to the end
    from: 'UC Berkeley moocRP - Contact Form <YOUR EMAIL>',
    to: 'EMAILS_TO_SEND_TO' // Email address(es) to forward to (comma-separated)
  },

  /***************************************************************************
   * CAS Settings                                                            *
   ***************************************************************************/
  appEnvMap: {
    test: 'localhost:1337',
    development: 'localhost:1337'
  },

  casOptions: {
    casURL: 'https://ncas-test.berkeley.edu',
    login: '/cas/login',
    validate: '/cas/validate',
    logout: '/cas/logout',
    renew: true,
    gateway: false
  },

  /***************************************************************************
   * Miscellaneous Settings                                                  *
   ***************************************************************************/
  protocol: 'http://',
  bypassLogin: (process.env.NODE_ENV || 'development') == 'development' && false,
  bypassUserId: 991426,
  noCheckGPG: true,
};

