var db = require( __dirname + '/../models/databaseManager');

var main = {
    home: function( reply ) {
      return reply.view('home');
    }
}

module.exports.main = main;
