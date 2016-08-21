var mainController = require( __dirname + '/../controllers/mainController').main;
var artistsController = require( __dirname + '/../controllers/artistsController').artists;
var playlistsController = require( __dirname + '/../controllers/playlistsController').playlists;
var youtubeController = require( __dirname + '/../controllers/youtubeController').youtube;
var filesystemController = require( __dirname + '/../controllers/filesystemController').filesystem;
var playerController = require( __dirname + '/../controllers/playerController').player;

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
          return mainController.home( reply );
      }
  },
  {
      method: 'GET',
      path:'/artists',
      handler: function (request, reply) {
          return artistsController.home( reply );
      }
  },
  {
      method: 'POST',
      path:'/artists/insert',
      handler: function (request, reply) {
          return artistsController.insert( request, reply );
      }
  },
  {
      method: 'POST',
      path:'/album/insert',
      handler: function (request, reply) {
          return artistsController.albumInsert( request, reply );
      }
  },
  {
      method: 'GET',
      path:'/artists/get',
      handler: function (request, reply) {
          return artistsController.get( reply );
      }
  },
  {
      method: 'GET',
      path:'/artist/{id}',
      handler: function (request, reply) {
          return artistsController.artist( request, reply );
      }
  },
  {
      method: 'GET',
      path:'/playlists',
      handler: function (request, reply) {
          return playlistsController.home( reply );
      }
  },
  {
      method: 'GET',
      path:'/artist/albums/{id}',
      handler: function (request, reply) {
          return artistsController.albums( request, reply );
      }
  },
  {
      method: 'GET',
      path:'/artist/delete/{id}',
      handler: function (request, reply) {
          return artistsController.delete( request, reply );
      }
  },
  {
      method: 'GET',
      path:'/filesystem/{command}',
      handler: function (request, reply) {
          return filesystemController.home( request, reply );
      }
  },
  {
      method: 'GET',
      path:'/player/{audioFileName}',
      handler: function (request, reply) {
          return playerController.home( request, reply );
      }
  },
  {
      method: 'GET',
      path:'/youtube',
      handler: function (request, reply) {
          return youtubeController.home( request, reply );
      }
  },
]
