jQuery( document ).ready(function() {
  // Get ready if insert new artist
  jQuery('.mainartist #addArtistsModal .btn-primary').on('click', function(){
    jQuery.post( "/artists/insert", {artistName: jQuery('input[name="artistName"]').val()}, function( data ) {
        console.log(data);
        jQuery('input[name="artistName"]').val('');
        $('#addArtistsModal').modal('hide');
        getAllArtists();
    });
  });

  if( window.location.pathname == '/artists' ) {
    // Get all artist
    getAllArtists();
  }
});

function getAllArtists() {
  jQuery.get( "/artists/get", function( data ){
      console.log('Here');
      console.log(data);
  });
}
