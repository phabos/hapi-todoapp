jQuery( document ).ready(function() {
  //highlightMenu();
});

function highlightMenu() {
  jQuery('.nav li a').each(function() {
    jQuery(this).on('click', function() {
      removeAllActiveItems();
      jQuery(this).addClass( 'active' );
    });
  });
}

function removeAllActiveItems() {
  jQuery('.nav li a').each(function() {
    jQuery(this).removeClass( 'active' );
  });
}
