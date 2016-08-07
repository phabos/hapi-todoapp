const db = require( __dirname + '/../models/databaseManager');

var main = {
    response: function( reply ) {
      var user = db.databaseManager.find( 'users', { name: 'phabos' } );
      return reply.view('get', { name: user[0]['name'] });
    },
    home: function( reply ) {
      return reply.view('home');
    }
}

module.exports.main = main;
