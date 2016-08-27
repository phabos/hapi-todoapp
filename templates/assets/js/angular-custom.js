/******** INIT APP / SET DEPENDENCIES ********/
var mediaCenterApp = angular.module('mediaCenter', ['angular-loading-bar', 'LocalStorageModule', 'ngTouch']);
/******** CONFIG ********/
// Symbols
mediaCenterApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{*');
    $interpolateProvider.endSymbol('*}');
});
// Loader
mediaCenterApp.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
});
/******** ARTICLE DETAIL CONTROLLER ********/
mediaCenterApp.controller('ArtistCtrl', function($scope, $http, getHttp, mainDomain) {
    $scope.saveArtist = function() {
      jQuery.post( "/artists/insert", {artistName: jQuery('input[name="artistName"]').val()}, function( data ) {
          console.log(data);
          jQuery('input[name="artistName"]').val('');
          $('#addArtistsModal').modal('hide');
          getArtistsList();
      });
    }

    $scope.deleteArtist = function( artistId ){
      jQuery.get( "/artist/delete/" + artistId, function( data ) {
          console.log(data);
          getArtistsList();
      });
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

mediaCenterApp.controller('YoutubeCtrl', function($scope, $http, getHttp, mainDomain) {
  $scope.play = function() {
    getHttp.httpRequest(mainDomain.name + '/player/' + encodeURIComponent( jQuery('input[name="youtubeurl"]').val() ) ).success(function(data, status, headers, config) {
      console.log(data);
    });
  }
});

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
    if( completeList ) {
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

mediaCenterApp.controller('ArtistDetailCtrl', function($scope, $http, getHttp, mainDomain, socketIoAngular, playlistLocal, animatePlaylist) {
  currentFilePlaying = 0;
  $scope.savedFiles = [];

  $scope.addAlbum = function() {
    jQuery.post( "/album/insert", {albumName: jQuery('input[name="albumName"]').val(), artistId: jQuery('.mainartist').data('id'), albumList: angular.toJson($scope.savedFiles)}, function( data ) {
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
    return ['mp3', 'wav', 'flac', 'mp4'].indexOf( filename.split('.').pop() ) >= 0;
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
    getHttp.httpRequest(mainDomain.name + '/artist/albums/' + jQuery('.mainartist').data('id')).success(function(data, status, headers, config) {
      if( data.length > 0 ) {
        for (var i = 0; i < data.length; i++) {
          data[i].list = angular.fromJson(data[i].list);
        }
      }
      $scope.albums = data;
    });
  }

  getAlbumFolder = function( dir = '' ) {
    console.log('folder list called ' + dir);
    getHttp.httpRequest(mainDomain.name + '/filesystem/' + ( dir ? dir : 'empty' )).success(function(data, status, headers, config) {
      console.log(data);
      $scope.files = data;
    });
  }

  getAlbumList();
  getAlbumFolder();
});

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

mediaCenterApp.factory('mainDomain', function($location) {
    return {
        name: $location.protocol() + "://" + $location.host() + ':' + $location.port()
    };
});

mediaCenterApp.factory('animatePlaylist', function(){
  this.animate = function( msg ) {
    jQuery('#message').html(msg);
    jQuery('.playlist').removeClass('flipOutX');
    jQuery('.playlist').css({ display:'block' });
    jQuery('.playlist').addClass('flipInX');
    setTimeout(function(){
      jQuery('.playlist').removeClass('flipInX');
      jQuery('.playlist').css({ display:'block' });
      jQuery('.playlist').addClass('flipOutX');
    }, 3000);
  };
  return this;
});

mediaCenterApp.factory('socketIoAngular', function($rootScope){
  var socket = io.connect('http://localhost:9090');
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
