var exec = require('child_process').exec;
var fs = require('fs');
var config = require( "../config/env.json" )[process.env.NODE_ENV];

var filesystem = {
    root: config.musikFolder,
    home: function( request, reply ) {
      if( request.params.command == "empty" ) {
        currentPath = this.root;
        fs.readdir(this.root, function(err, files){
          if( err ) throw err;
          return reply( { current: currentPath, files: files } );
        });
      }else{
        fs.readdir(request.params.command, function(err, files){
          if( err ) throw err;
          return reply( { current: request.params.command, files: files } );
        });
      }
    },
}

module.exports.filesystem = filesystem;
