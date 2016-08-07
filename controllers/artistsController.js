const uniqid = require('uniqid');
const Joi = require('joi');
const Artist = require( __dirname + '/../models/artist');
const schema = {
    artistName: Joi.string().alphanum().min(3).max(30).required()
};

var artists = {
    // Homepage
    home: function( reply ) {
      // Display home
      return reply.view('home_artists');
    },
    // Insert artist endpoint
    insert: function( request, reply ) {
      // Validation
      Joi.validate({ artistName: request.payload.artistName }, schema, function (err, value) {
        if(err === null) {
          var artist = new Artist({ name: request.payload.artistName, uniqid: uniqid() });
          artist.save(function(err) {
            if (err) throw err;
            return reply({ error: 0, msg: 'user inserted' }).code( 200 );
          });
        }else{
          return reply({ error: 1, msg: 'Erreur de validation' }).code( 200 );
        }
      });
    },
    // List artists endpoint
    get: function( reply ) {
      Artist.find({}, function(err, artistList) {
        if (err) throw err;
        return reply( artistList );
      });
    }
}

module.exports.artists = artists;
