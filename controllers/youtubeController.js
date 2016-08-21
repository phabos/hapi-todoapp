var db = require( __dirname + '/../models/databaseManager');

var youtube = {
    home: function( request, reply ) {
      return reply.view('home_youtube');
    }
}

module.exports.youtube = youtube;
