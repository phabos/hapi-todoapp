var request = require('request');

var vlc = {
    httpRootLuaInterface: 'http://localhost:8080',
    home: function( request, reply ) {
      switch(request.params.action) {
          case 'playlist':
            this.getLuaInterfaceResponse( reply, '/requests/playlist.json' );
            break;
          case 'play':
            this.getLuaInterfaceResponse( reply, '/requests/status.json?command=pl_play' );
            break;
          case 'pause':
            this.getLuaInterfaceResponse( reply, '/requests/status.json?command=pl_pause' );
            break;
          case 'stop':
            this.getLuaInterfaceResponse( reply, '/requests/status.json?command=pl_stop' );
            break;
          case 'empty':
            this.getLuaInterfaceResponse( reply, '/requests/status.json?command=pl_empty');
            break;
          case 'volume':
            var val = (request.params.val ? request.params.val : 0);
            this.getLuaInterfaceResponse( reply, '/requests/status.json?command=volume&val=' + val );
            break;
          case 'next':
            this.getLuaInterfaceResponse( reply, '/requests/status.json?command=pl_next' );
            break;
          case 'previous':
            this.getLuaInterfaceResponse( reply, '/requests/status.json?command=pl_previous' );
            break;
          case 'add':
            var val = (request.params.val ? request.params.val : '');
            this.getLuaInterfaceResponse( reply, '/requests/status.json?command=in_enqueue&input=' + val );
            break;
          case 'state':
            this.getLuaInterfaceResponse( reply, '/requests/status.json' );
            break;
      }
    },
    getLuaInterfaceResponse: function( reply, action ) {
      request( this.httpRootLuaInterface + action, {
        'auth': {
          'user': '',
          'pass': 'phabos'
        }}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          return reply(body);
        }
      });
    },
}

module.exports.vlc = vlc;
