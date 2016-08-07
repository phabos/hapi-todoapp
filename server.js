'use strict';

// Node packages
const Hapi = require('hapi');
const Hoek = require('hoek');
const Path = require('path');

// Project packages
const db = require('./models/databaseManager').databaseManager;
const routes = require('./config/routes');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8080
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
        layoutPath: Path.join(__dirname, 'templates/layout'),
        helpersPath: Path.join(__dirname, 'templates/helpers')
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
});
