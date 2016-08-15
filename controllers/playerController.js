const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const vlcLocation = '/Applications/VLC.app/Contents/MacOS/VLC';


var player = {
    home: function( request, reply ) {
      these = this;
      exec('pgrep -U 501 VLC', (error, stdout, stderr) => {
        if (error) {
          these.play( request.params.audioFileName );
          return;
        }
        exec('kill $(pgrep -U 501 VLC)', (error, stdout, stderr) => {
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
      vlc = spawn(vlcLocation, ['--intf', 'dummy', audioFileName, '--play-and-exit']);
      vlc.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      vlc.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });

      vlc.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });
    }
}

module.exports.player = player;
