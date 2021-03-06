// grab the things we need
var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

// create a schema
var artistSchema = new Schema({
  name: {
    type: String,
    required: true,
    min: 1,
    min: 60
  },
  uniqid: {
    type: Schema.Types.Mixed,
  }
});

var Artist = Mongoose.model('Artist', artistSchema);

module.exports = Artist;
