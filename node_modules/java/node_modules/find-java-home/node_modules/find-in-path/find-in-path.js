var PATH  = process.env.PATH;
var path  = require('path');
var fs    = require('fs');
var del   = path.delimiter;
var siv   = {};
var paths = PATH.split(del);

module.exports = function(name, cb){
   var part;
   paths.forEach(function(v){
      var proposed;
      if(part)return;
      proposed = path.resolve(v, name);
      if(fs.existsSync(proposed)){
         part = proposed;
      }
   });
   if(part)cb(null, part);
   else cb(new Error(name+" wasn't found anywhere in the PATH"), null);
};
