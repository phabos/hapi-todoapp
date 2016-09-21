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
      download = 0;
      jQuery("#loading-stuff").hide();
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
mediaCenterApp.controller('PlayerCtrl', function($scope, socketIoAngular, playlistLocal, getHttp, mainDomain, animatePlaylist) {
  $scope.player = playlistLocal.getCurrent();
  stopall = 0;

  $scope.$on('audioplayer', function(evt, message){
    if( message == 'updated' )
      $scope.player = playlistLocal.getCurrent();
  });

  socketIoAngular.on('message', function(socket, args) {
    console.log( 'From player ctrl ' + socket );
    if( socket == 'stop' && ! stopall ) {
      playlistLocal.firstOut();
      playFileList();
    }
  });

  $scope.list = function() {
    completeList = playlistLocal.get();
    if( completeList.length > 0 ) {
      var text = '<ul>';
      for (var i = 0; i < completeList.length; i++) {
        text += '<li>' + completeList[i].fileName + '</li>';
      }
      text += '</ul>';
      animatePlaylist.animate( 'Current playlist : ' + text );
    } else {
      animatePlaylist.animate( 'Nothing added in current playlist' );
    }
  }

  $scope.play = function() {
    stopall = 0;
    playFileList();
  }

  $scope.stop = function() {
    stopall = 1;
    stopFileList();
  }

  $scope.next = function() {
    stopall = 0;
    stopFileList();
  }

  playFileList = function() {
    audio = playlistLocal.getFirst();
    if( audio ) {
      animatePlaylist.animate('Playin : ' + audio.fileName);
      getHttp.httpRequest(mainDomain.name + '/player/' + encodeURIComponent(audio.completePath) ).success(function(data, status, headers, config) {});
    } else {
      animatePlaylist.animate('Current playlist is empty :(');
    }
  }

  stopFileList = function() {
    getHttp.httpRequest(mainDomain.name + '/player/stop' ).success(function(data, status, headers, config) {});
  }
});

// Article détail
mediaCenterApp.controller('ArtistDetailCtrl', function($scope, $http, getHttp, mainDomain, socketIoAngular, playlistLocal, animatePlaylist, $routeParams) {
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
    return ['mp3', 'wav', 'flac', 'mp4', 'wma', 'opus'].indexOf( filename.split('.').pop() ) >= 0;
  }

  $scope.addToList = function( file ) {
    $scope.savedFiles.push({ fileName: file.replace(/^.*[\\\/]/, ''), completePath: file });
  }

  $scope.clearList = function() {
    $scope.savedFiles = [];
  }

  $scope.playFile = function( audioFileName ) {
    animatePlaylist.animate( audioFileName.fileName + ' added to list' );
    playlistLocal.set( audioFileName );
  }

  $scope.playAlbum = function( albumName ) {
    /*currentFilePlaying = 0;
    if( $scope.albums[albumName].list.length > 0 ) {
      playFile( $scope.albums[albumName].list[0].completePath );
      // Check socket io message
      socketIoAngular.on('message', function(socket, args) {
        console.log(socket);
        if(socket == 'stop') {
          currentFilePlaying++;
          console.log(currentFilePlaying);
          if( typeof $scope.albums[albumName].list[currentFilePlaying] != 'undefined' ) {
            playFile( $scope.albums[albumName].list[currentFilePlaying].completePath );
          }
        }
      });
    }
    console.log($scope.albums[albumName].list);*/
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

// Playlist
mediaCenterApp.factory('playlistLocal', function(localStorageService, $rootScope){
  this.set = function(list) {
    playlist = this.get('playlist');
    playlist.push(list);
    localStorageService.set('playlist', JSON.stringify(playlist));
    $rootScope.$broadcast('audioplayer', 'updated');
  };
  this.getCurrent = function() {
    currentList = this.get();
    if( currentList[0] )
      return currentList[0].fileName;
    return null;
  };
  this.get = function() {
    playlist = localStorageService.get('playlist');
    if( ! playlist )
      return [];
    else
      return JSON.parse(playlist);
  };
  this.getFirst = function() {
    playlist = this.get('playlist');
    if( playlist[0] )
      return playlist[0];
    return null;
  };
  this.firstOut = function() {
    playlist = this.get('playlist');
    playlist.shift();
    localStorageService.set('playlist', JSON.stringify(playlist));
    $rootScope.$broadcast('audioplayer', 'updated');
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
  this.running = 0;
  this.animate = function( msg ) {
    jQuery('#message').html(msg);
    if( ! this.running ) {
      jQuery('.playlist').addClass('animated');
      timeout = setTimeout(function() {
        this.running = 1;
        jQuery('.playlist').removeClass('animated');
      }, 10000);
    }else {
      clearTimeout(timeout);
    }
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
