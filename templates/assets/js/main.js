jQuery( document ).ready(function() {
  highlightMenu();
});

function highlightMenu() {
  jQuery('.nav li a').each(function(){
    jQuery(this).removeClass( 'active' );
    if( jQuery(this).attr('href') == window.location.pathname )
      jQuery(this).addClass( 'active' );
  });
}
