const mainController = require( __dirname + '/../controllers/mainController');
const artistsController = require( __dirname + '/../controllers/artistsController');

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
      path:'/',
      handler: function (request, reply) {
          return mainController.main.home( reply );
      }
  },
  {
      method: 'GET',
      path:'/artists',
      handler: function (request, reply) {
          return artistsController.artists.home( reply );
      }
  },
  {
      method: 'GET',
      path:'/artists/get',
      handler: function (request, reply) {
          return artistsController.artists.get( reply );
      }
  },
  {
      method: 'POST',
      path:'/artists/insert',
      handler: function (request, reply) {
          return artistsController.artists.insert( request, reply );
      }
  },
]
