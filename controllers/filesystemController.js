const exec = require('child_process').exec;
const fs = require('fs');

var filesystem = {
    root: '/Users/fabienprezat/Documents/Musik',
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
