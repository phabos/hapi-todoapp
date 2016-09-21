var db = require( __dirname + '/../models/databaseManager');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var config = require( "../config/env.json" )[process.env.NODE_ENV];

var youtube = {
    home: function( request, reply ) {
      return reply.view('home_youtube');
    },
    youtubedl: function( request, reply ) {
      console.log(request.params.url);
      const ls = spawn('youtube-dl', ['-x', '-otmp/%(title)s-%(id)s.%(ext)s', request.params.url]);
      ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        require('../config/server').server.sendMessage( 'downloadoutput', `${data}` );
      });

      ls.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });

      ls.on('close', (code) => {
        require('../config/server').server.sendMessage( 'downloadoutput', 'downloadStop' );
        console.log(`child process exited with code ${code}`);
        if( code == 0 ) {
          require('../config/server').server.sendMessage( 'downloadoutput', '<div class="bg-success">Your download is ok !</div>' );
          exec('cp -R ' + __dirname + '/../tmp/. ' + config.youtubedlPath + ' && rm -R ' + __dirname + '/../tmp/', (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              require('../config/server').server.sendMessage( 'downloadoutput', `exec error: ${error}` );
              return;
            }
            require('../config/server').server.sendMessage( 'downloadoutput', 'File copied to ' + config.youtubedlPath );
          });
        }else{
          require('../config/server').server.sendMessage( 'downloadoutput', '<div class="bg-danger">Error while downloading !</div>' );
        }
      });
      reply('start downloading');
    },
}

module.exports.youtube = youtube;
