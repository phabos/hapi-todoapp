'use strict';

// Node.js
var path = require('path');

// Export helpers
module.exports = function (filepath) {

  return path.join('/assets/', filepath).replace(/\\/g, '/');

};
