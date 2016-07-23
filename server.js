'use strict';

const Hapi = require('hapi');
const Loki = require('lokijs');
const Hoek = require('hoek');
const Path = require('path');
const Boom = require('boom');
const Bcrypt = require('bcrypt');
const Basic = require('hapi-auth-basic');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8080
});

// Authentication
const users = {
    john: {
        username: 'john',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
        name: 'John Doe',
        id: '2133d32a'
    }
};

const validate = function (request, username, password, callback) {
    const user = users[username];
    if (!user) {
        return callback(null, false);
    }

    Bcrypt.compare(password, user.password, (err, isValid) => {
        callback(err, isValid, { id: user.id, name: user.name });
    });
};

server.register(require('hapi-auth-basic'), (err) => {
    server.auth.strategy('simple', 'basic', { validateFunc: validate });
});


// Templating
server.register(require('vision'), (err) => {
    Hoek.assert(!err, err);
    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'templates',
        layout: true,
        layoutPath: Path.join(__dirname, 'templates/layout')
    });
});

// Add the route
server.route({
    method: 'GET',
    path:'/insert',
    handler: function (request, reply) {
        //databaseManager.insert( { name : 'phabos', email: 'pahbos.soap@lokijs.org', age: 33 } );
        return reply('Users inserted');
    }
});

server.route({
    method: 'GET',
    path:'/get',
    config: {
        auth: 'simple',
        handler: function (request, reply) {
            var test = databaseManager.find( {'name': 'phabos'} );
            return reply.view('index', { name: test[0]['name'] });
        },
    }
});

server.route({
    method: 'GET',
    path:'/newroute',
    handler: function (request, reply) {
        // test
        return reply('Yo TEST');
    }
});

var databaseManager = {
    db: '',
    init: function() {
        this.loadDatabase();
    },
    getDb: function() {
        if( this.db )
            return this.db;
        this.db = new Loki('todolist');
        return this.db;
    },
    getCollection: function() {
        if( this.getDb().getCollection('users') )
            return this.getDb().getCollection('users');

        return this.getDb().addCollection('users', { indices: ['email'] })
    },
    saveDatabase: function() {
        this.getDb().saveDatabase();
    },
    loadDatabase: function() {
        this.getDb().loadDatabase({}, function() {
            console.log('Database is loaded');
        });
    },
    insert: function( datas ) {
        this.getCollection().insert( datas );
        this.saveDatabase();
    },
    find: function( datas ) {
        return this.getCollection().find( datas );
    }
}

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
    databaseManager.init();
});
