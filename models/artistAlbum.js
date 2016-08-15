// grab the things we need
var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

// create a schema
var ArtistAlbumSchema = new Schema({
  name: {
    type: String,
    required: true,
    min: 1,
    min: 60
  },
  artistId: {
    type: Schema.Types.Mixed,
    required: true
  },
  list: {
    type: Object,
    required: true
  }
});

var ArtistAlbum = Mongoose.model('ArtistAlbum', ArtistAlbumSchema);

module.exports = ArtistAlbum;
