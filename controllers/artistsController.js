var uniqid = require('uniqid');
var Artist = require( __dirname + '/../models/artist');
var ArtistAlbum = require( __dirname + '/../models/artistAlbum');

var artists = {
    home: function( reply ) {
      // Display home
      return reply.view('home_artists');
    },
    insert: function( request, reply ) {
      var artist = new Artist({ name: request.payload.artistName, uniqid: uniqid() });
      artist.save(function(err) {
        if (err) throw err;
        return reply({ error: 0, msg: 'artist inserted' }).code( 200 );
      });
    },
    get: function( reply ) {
      Artist.find({}).sort('name').exec( function(err, artistList) {
        if (err) throw err;
        return reply( artistList );
      });
    },
    artist: function( request, reply ) {
      Artist.findOne({ _id: request.params.id }).exec( function(err, artistDetail) {
        if (err) throw err;
        return reply( artistDetail );
      });
    },
    albums: function( request, reply ) {
      ArtistAlbum.find({ artistId: request.params.id }).exec( function(err, albumDetail) {
        if (err) throw err;
        return reply( albumDetail );
      });
    },
    albumInsert: function( request, reply ) {
      // Validation
      ArtistAlbum.findOne({ name: request.payload.albumName }).exec( function(err, artistAlbum) {
        if (err) throw err;
        if( ! artistAlbum ) {
          var album = new ArtistAlbum({ name: request.payload.albumName, artistId: request.payload.artistId, list: request.payload.albumList});
          album.save(function(err) {
            if (err) throw err;
            return reply({ error: 0, msg: 'album inserted' }).code( 200 );
          });
        }else{
          var concat = JSON.stringify( JSON.parse( artistAlbum.list ).concat( JSON.parse( request.payload.albumList ) ) );
          ArtistAlbum.update( { _id : artistAlbum._id }, { list : concat }, { upsert : true }, function(err){
            if (err) throw err;
            return reply({ error: 0, msg: 'album updated' }).code( 200 );
          });
        }
      });
      /*var album = new ArtistAlbum({ name: request.payload.albumName, artistId: request.payload.artistId, list: request.payload.albumList});
      album.save(function(err) {
        if (err) throw err;
        return reply({ error: 0, msg: 'album inserted' }).code( 200 );
      });*/
    },
    delete: function( request, reply ) {
      Artist.remove({ _id: request.params.id }, function(err,removed) {
        if (err) throw err;
        ArtistAlbum.remove({ artistId: request.params.id }, function(err,removed) {
          if (err) throw err;
          return reply({ error: 0, msg: 'artist deleted' }).code( 200 );
        });
      });
    },
}

module.exports.artists = artists;
