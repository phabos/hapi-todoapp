const Loki = require('lokijs');
const Uniqid = require('uniqid');

var databaseManager = {
    db: '',
    init: function() {
        this.loadDatabase();
    },
    getDb: function() {
        if( this.db )
            return this.db;
        this.db = new Loki('mediacenter');
        return this.db;
    },
    getCollection: function( collectionName ) {
        if( this.getDb().getCollection( collectionName ) )
            return this.getDb().getCollection( collectionName );

        return this.getDb().addCollection( collectionName )
    },
    saveDatabase: function() {
        this.getDb().saveDatabase();
    },
    loadDatabase: function() {
        this.getDb().loadDatabase({}, function() {
            console.log('Database is loaded');
        });
    },
    insert: function( collectionName, datas ) {
        this.getCollection( collectionName ).insert( datas );
        this.saveDatabase();
    },
    find: function( collectionName, datas ) {
        return this.getCollection( collectionName ).find( datas );
    }
}

module.exports.databaseManager = databaseManager;
