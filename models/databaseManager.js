const Mongoose = require('mongoose');
const Uniqid = require('uniqid');

var databaseManager = {
    dbName: 'mediacenter',
    init: function() {
        Mongoose.connect('mongodb://localhost/' + this.dbName, function(err) {
            if (err) { throw err; }
        });
    },
    close: function() {
        Mongoose.connection.close();
    }
}

module.exports.databaseManager = databaseManager;
