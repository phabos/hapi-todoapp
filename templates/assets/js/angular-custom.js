/******** INIT APP / SET DEPENDENCIES ********/
var mediaCenterApp = angular.module('mediaCenter', ['angular-loading-bar', 'LocalStorageModule', 'ngTouch', 'ngRoute']);

/************************/
/******** CONFIG ********/
/************************/
// Symbols config - avoid conflicts with mustache
mediaCenterApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{*');
    $interpolateProvider.endSymbol('*}');
});

// Route provider config
mediaCenterApp.config(function($routeProvider) {
    $routeProvider
    .when("/", {
      templateUrl: '/templates/home.html',
      controller: 'HomeCtrl'
    }).when("/artists", {
      templateUrl: '/templates/home_artists.html',
      controller: 'ArtistCtrl'
    }).when("/youtube", {
      templateUrl: '/templates/home_youtube.html',
      controller: 'YoutubeCtrl'
    }).when("/artist/:param", {
      templateUrl: '/templates/artist.html',
      controller: 'ArtistDetailCtrl'
    }).otherwise({
      redirectTo: '/'
    });
});

// Loader config
mediaCenterApp.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
});

/*****************************/
/******** CONTROLLERS ********/
/*****************************/
// Homepage
mediaCenterApp.controller('HomeCtrl', function($scope, $http, getHttp, mainDomain) {});

// Artistes
mediaCenterApp.controller('ArtistCtrl', function($scope, $http, getHttp, mainDomain) {
    $scope.saveArtist = function() {
      jQuery.post( "/artists/insert", {artistName: jQuery('input[name="artistName"]').val()}, function( data ) {
          console.log(data);
          jQuery('input[name="artistName"]').val('');
          $('#addArtistsModal').modal('hide');
          getArtistsList();
      });
    }

    $scope.deleteArtist = function( artistId ) {
      if( confirm( 'Etes-vous sûr ?' ) ) {
        jQuery.get( "/artist/delete/" + artistId, function( data ) {
            console.log(data);
            getArtistsList();
        });
      }
    }

    getArtistsList = function() {
      console.log('artist list called');
      getHttp.httpRequest(mainDomain.name + '/artists/get').success(function(data, status, headers, config) {
        console.log(data);
        $scope.artists = data;
      });
    }
    getArtistsList();
});

// Youtube controller
mediaCenterApp.controller('YoutubeCtrl', function($scope, $http, getHttp, mainDomain, socketIoAngular) {

  var download = 0;

  socketIoAngular.on('downloadoutput', function(socket, args) {
    jQuery("#youtubedl-msg").show();
    jQuery("#loading-stuff").show();
    msg = socket + '<br/>' + jQuery("#youtubedl-msg").html();
    jQuery("#youtubedl-msg").html(msg);
    if( socket == 'downloadStop' ) {
      jQuery("#loading-stuff").css("display", "none");
      download = 0;
    }
  });

  $scope.download = function() {
    if( ! download ) {
      download = 1;
      jQuery("#youtubedl-msg").hide().html('');
      jQuery("#loading-stuff").hide();
      getHttp.httpRequest(mainDomain.name + '/youtube/dl/' + encodeURIComponent( jQuery('input[name="youtubeurl"]').val() ) ).success(function(data, status, headers, config) {
        console.log(data);
      });
    }else {
      console.log("Downloading already launch");
    }
  }
});

// Player
mediaCenterApp.controller('PlayerCtrl', function($scope, socketIoAngular, getHttp, mainDomain, animatePlaylist) {

  $scope.currentState = 'fa-pause';

  getCurrentState = function() {
    getHttp.httpRequest( mainDomain.name + '/vlc/state' ).success(function(data, status, headers, config) {
      if( data.state == 'paused' )
        $scope.currentState = 'fa-play';
      else
        $scope.currentState = 'fa-pause';
    });
  }

  $scope.list = function() {
    getHttp.httpRequest( mainDomain.name + '/vlc/playlist' ).success(function(data, status, headers, config) {
      var playlist = data.children[0].children;
      if( playlist.length > 0 ) {
        var text = '<div>';
        for (var i = 0; i < playlist.length; i++) {
          text += '<i class="fa fa-chevron-right" aria-hidden="true"></i> ' + playlist[i].name + '<br/>';
        }
        text += '</div>';
        animatePlaylist.animate( 'Current playlist : ' + text );
      } else {
        animatePlaylist.animate( 'Nothing added in current playlist' );
      }
    });
  }

  $scope.trash = function() {
    getHttp.httpRequest( mainDomain.name + '/vlc/empty' ).success(function(data, status, headers, config) {
      $scope.currentState = 'fa-play';
      animatePlaylist.animate( 'Playlist trashed' );
    });
  }

  $scope.play = function() {
    getHttp.httpRequest( mainDomain.name + '/vlc/pause' ).success(function(data, status, headers, config) {
      if( data.state == 'paused' )
        $scope.currentState = 'fa-play';
      else
        $scope.currentState = 'fa-pause';
    });
  }

  $scope.stop = function() {
    getHttp.httpRequest( mainDomain.name + '/vlc/stop' ).success(function(data, status, headers, config) {
      $scope.currentState = 'fa-play';
    });
  }

  $scope.next = function() {
    getHttp.httpRequest( mainDomain.name + '/vlc/next' ).success(function(data, status, headers, config) {});
  }

  $scope.previous = function() {
    getHttp.httpRequest( mainDomain.name + '/vlc/previous' ).success(function(data, status, headers, config) {});
  }

  getCurrentState();
});

// Article détail
mediaCenterApp.controller('ArtistDetailCtrl', function($scope, $http, getHttp, mainDomain, socketIoAngular,  animatePlaylist, $routeParams) {
  currentFilePlaying = 0;
  $scope.savedFiles = [];
  artistId = $routeParams.param;

  $scope.addAlbum = function() {
    jQuery.post( "/album/insert", {albumName: jQuery('input[name="albumName"]').val(), artistId: artistId, albumList: angular.toJson($scope.savedFiles)}, function( data ) {
        console.log(data);
        jQuery('input[name="albumName"]').val('');
        $('#addAlbumModal').modal('hide');
        getAlbumList();
    });
  }

  $scope.parentDirList = function() {
    getAlbumFolder();
  }

  $scope.sonDirList = function( dir ) {
    getAlbumFolder( encodeURIComponent(dir) );
  }

  $scope.isAudioFile = function( filename ) {
    return ['mp3', 'wav', 'flac', 'mp4', 'wma', 'opus', 'm4a'].indexOf( filename.split('.').pop() ) >= 0;
  }

  $scope.addToList = function( file ) {
    $scope.savedFiles.push({ fileName: file.replace(/^.*[\\\/]/, ''), completePath: file });
  }

  $scope.clearList = function() {
    $scope.savedFiles = [];
  }

  $scope.playFile = function( audioFileName ) {
    //playlistLocal.set( audioFileName );
    getHttp.httpRequest(mainDomain.name + '/vlc/add/' + encodeURIComponent( audioFileName.completePath ) ).success(function(data, status, headers, config) {
      animatePlaylist.animate( audioFileName.fileName + ' added to list' );
    });
  }

  $scope.playAlbum = function( albumName ) {
    // TODO
  }

  getAlbumList = function() {
    console.log('artist list called ' + jQuery('.mainartist').data('id') );
    getHttp.httpRequest(mainDomain.name + '/artist/albums/' + artistId ).success(function(data, status, headers, config) {
      if( data.length > 0 ) {
        for (var i = 0; i < data.length; i++) {
          data[i].list = angular.fromJson(data[i].list);
        }
      }
      $scope.albums = data;
    });
  }

  getAlbumFolder = function( dir ) {
    if( ! dir ) dir = '';
    console.log('folder list called ' + dir);
    getHttp.httpRequest(mainDomain.name + '/filesystem/' + ( dir ? dir : 'empty' )).success(function(data, status, headers, config) {
      console.log(data);
      $scope.files = data;
    });
  }

  getArtistName = function() {
    getHttp.httpRequest(mainDomain.name + '/artist/' + artistId ).success(function(data, status, headers, config) {
      console.log(data);
      $scope.artist = data;
    });
  }

  getArtistName();
  getAlbumList();
  getAlbumFolder();
});

mediaCenterApp.controller('MenuCtrl', function($scope, $location) {
  $scope.getClass = function ( path ) {
    return ($location.path() === path) ? 'active' : '';
  }
});

/***************************/
/******** FACTORIES ********/
/***************************/
// Http
mediaCenterApp.factory('getHttp', function($http) {
    this.httpRequest = function(url) {
        return $http.get(url, {
            cache: false
        }).error(function(data, status, headers, config) {
            alert('Une erreur s\'est produite !');
        });
    };
    this.postHttpRequest = function(url, postData) {
        return $http.post(url, postData).error(function(data, status, headers, config) {
            alert('Une erreur s\'est produite !');
        });
    };
    return this;
});

// Main domain
mediaCenterApp.factory('mainDomain', function($location) {
    return {
        name: $location.protocol() + "://" + $location.host() + ':' + $location.port()
    };
});

// Animate playlist
mediaCenterApp.factory('animatePlaylist', function(){
  this.animate = function( msg ) {
    var currentElt = jQuery( '.msg' ).length;
    $(".player-ctrl").append( '<div class="playlist playlist' + currentElt + '"><div id="message' + currentElt + '" class="msg"></div></div>' );
    jQuery( '#message' + currentElt ).html( msg );
    jQuery('.playlist'  + currentElt ).addClass( 'animated' );
    timeout = setTimeout(function() {
      jQuery('.playlist' + currentElt ).remove();
    }, 10000);
  };
  return this;
});

// Socket IO
mediaCenterApp.factory('socketIoAngular', function($rootScope, $location){
  if( $location.host() == 'localhost' )
    var socket = io.connect( $location.protocol() + "://" + $location.host() + ':' + $location.port() );
  else
    var socket = io.connect( $location.protocol() + "://" + $location.host() );
  this.on = function(eventName, callback) {
    socket.on(eventName, function () {
      var args = arguments;
      $rootScope.$apply(function () {
        callback.apply(socket, args);
      });
    });
  };
  return this;
});
