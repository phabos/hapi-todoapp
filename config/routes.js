const mainController = require( __dirname + '/../controllers/mainController');

module.exports = [
  {
    method: "GET",
    path: "/assets/{path*}",
    handler: {
        directory: {
            path: "./templates/assets/",
            listing: false,
            index: false
        }
    }
  },
  {
      method: 'GET',
      path:'/insert',
      handler: function (request, reply) {
          //db.databaseManager.insert( { name : 'phabos', email: 'pahbos.soap@lokijs.org', age: 33 } );
          return reply('Users inserted');
      }
  },
  {
      method: 'GET',
      path:'/get',
      handler: function (request, reply) {
          return mainController.main.response( reply );
      }
  },
  {
      method: 'GET',
      path:'/newroute',
      handler: function (request, reply) {
          // test
          return reply('Yo TEST');
      }
  }
]
