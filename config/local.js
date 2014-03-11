var fs = require('fs');
 
module.exports = {
 
  port: process.env.PORT || 1337,
  environment: process.env.NODE_ENV || 'development',
 
  express: { serverOptions : {
    key: fs.readFileSync('ssl/key.pem'),
    cert: fs.readFileSync('ssl/cert.pem')
  }}

//   NEED SUDO TO RUN ON PORT 443
//   express: { serverOptions : {
//       key: fs.readFileSync('ssl/ia.key'),
//       cert: fs.readFileSync('ssl/ia.crt')
//     }
//   },
//   port: process.env.PORT || 443,
//   environment: process.env.NODE_ENV || 'development'

 
};