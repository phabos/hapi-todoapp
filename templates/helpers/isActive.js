'use strict';

// Export helpers
module.exports = function ( path ) {
  // console.log(window.location.pathname);
  if ( path == '/' ) return 'active';
  return '';
};
