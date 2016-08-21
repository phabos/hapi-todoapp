// Node packages
var hapi = require('hapi');
var hoek = require('hoek');
var path = require('path');

// Project packages
var db = require('../models/databaseManager').databaseManager;
var routes = require('../config/routes');

// Create a server with a host and port
var server = {
    s: null,
    sio: null,
    init: function() {
        var server = new hapi.Server();
        server.connection({
            host: 'localhost',
            port: 9090
        });

        // Templating
        server.register(require('vision'), (err) => {
            hoek.assert(!err, err);
            server.views({
                engines: {
                    html: require('handlebars')
                },
                relativeTo: __dirname + '/../',
                path: 'templates',
                layout: true,
                layoutPath: path.join(__dirname, '../templates/layout'),
                helpersPath: path.join(__dirname, '../templates/helpers')
            });
        });

        // Static ressources
        server.register(require('inert'), (err) => {});

        // Add the route
        server.route(routes);

        // Start the server
        server.start((err) => {
            if (err) {
                throw err;
            }
            console.log('Server running at:', server.info.uri);
            db.init();
            console.log('db loaded');
        });

        var listener = server.listener;
        var io = require('socket.io')(listener);

        io.on('connection', function (socket) {
            console.log('Listening...');
            socket.emit('message', 'connected to server !');
        });

        // save server instance
        this.s = server;
        this.sio = io;
    },
    getServer: function() {
        return this.s;
    },
    getSocketIo: function() {
        return this.sio;
    },
    sendMessage: function( msg ) {
        this.sio.emit('message', msg);
    }
}

module.exports.server = server;
