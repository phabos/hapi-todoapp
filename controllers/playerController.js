var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var config = require( "../config/env.json" )[process.env.NODE_ENV];
// Try with killall it will be simple

var player = {
    home: function( request, reply ) {
      these = this;
      exec('pgrep ' + config.vlcProcess, (error, stdout, stderr) => {
        if (error) {
          these.play( request.params.audioFileName );
          return;
        }
        exec('kill $(pgrep ' + config.vlcProcess + ')', (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          these.play( request.params.audioFileName );
        });
      });
      reply('File running');
    },
    play: function( audioFileName ) {
      vlc = spawn(config.vlcLocation, ['--intf', 'dummy', audioFileName, '--play-and-exit', '--no-video']);
      vlc.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      vlc.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });

      vlc.on('close', (code, signal) => {
        console.log(`child process exited with code ${code} / ${signal} `);
        require('../config/server').server.sendMessage('stop');
      });
    },
    stop: function( request, reply ) {
      exec('pgrep ' + config.vlcProcess, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        exec('kill $(pgrep ' + config.vlcProcess + ')', (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
        });
      });
      reply('Killing process');
    },
}

module.exports.player = player;
