var uniqid = require('uniqid');
var Artist = require( __dirname + '/../models/artist');
var ArtistAlbum = require( __dirname + '/../models/artistAlbum');

var artists = {
    // Homepage
    home: function( reply ) {
      // Display home
      return reply.view('home_artists');
    },
    // Insert artist endpoint
    insert: function( request, reply ) {
      var artist = new Artist({ name: request.payload.artistName, uniqid: uniqid() });
      artist.save(function(err) {
        if (err) throw err;
        return reply({ error: 0, msg: 'artist inserted' }).code( 200 );
      });
    },
    // List artists endpoint
    get: function( reply ) {
      Artist.find({}).sort('name').exec( function(err, artistList) {
        if (err) throw err;
        return reply( artistList );
      });
    },
    // Get artist DETAIL
    artist: function( request, reply ) {
      Artist.findOne({ _id: request.params.id }).exec( function(err, artistDetail) {
        if (err) throw err;
        return reply.view( 'artist', { artist: artistDetail } );
      });
    },
    //Get Album details
    albums: function( request, reply ) {
      ArtistAlbum.find({ artistId: request.params.id }).exec( function(err, albumDetail) {
        if (err) throw err;
        return reply( albumDetail );
      });
    },
    // Insert artist endpoint
    albumInsert: function( request, reply ) {
      // Validation
      var album = new ArtistAlbum({ name: request.payload.albumName, artistId: request.payload.artistId, list: request.payload.albumList});
      album.save(function(err) {
        if (err) throw err;
        return reply({ error: 0, msg: 'album inserted' }).code( 200 );
      });
    },
}

module.exports.artists = artists;
