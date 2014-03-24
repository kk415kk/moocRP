var mod = require('./find-in-path');

mod(process.argv[2] || 'netstat', function(err, path){
   console.log(err);
   console.log(path);
});
