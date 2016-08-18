/******** INIT APP / SET DEPENDENCIES ********/
var mediaCenterApp = angular.module('mediaCenter', ['angular-loading-bar']);
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

    getArtistsList = function() {
      console.log('artist list called');
      getHttp.httpRequest(mainDomain.name + '/artists/get').success(function(data, status, headers, config) {
        console.log(data);
        $scope.artists = data;
      });
    }
    getArtistsList();
});

mediaCenterApp.controller('ArtistDetailCtrl', function($scope, $http, getHttp, mainDomain) {
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
    return ['mp3', 'wav', 'flac'].indexOf( filename.split('.').pop() ) >= 0;
  }

  $scope.addToList = function( file ) {
    $scope.savedFiles.push({ fileName: file.replace(/^.*[\\\/]/, ''), completePath: file });
  }

  $scope.clearList = function() {
    $scope.savedFiles = [];
  }

  $scope.playFile = function( audioFileName ) {
    getHttp.httpRequest(mainDomain.name + '/player/' + encodeURIComponent(audioFileName) ).success(function(data, status, headers, config) {
      console.log(data);
    });
  }

  $scope.playAlbum = function( albumName ) {
    // TO DO !!
    console.log($scope.albums[albumName].list);
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

mediaCenterApp.factory('mainDomain', function($location) {
    return {
        name: $location.protocol() + "://" + $location.host() + ':' + $location.port()
    };
});
