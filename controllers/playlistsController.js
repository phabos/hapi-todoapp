var db = require( __dirname + '/../models/databaseManager');

var playlists = {
    home: function( reply ) {
      return reply.view('home_playlists');
    }
}

module.exports.playlists = playlists;
