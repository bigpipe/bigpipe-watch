'use strict';

//
// Required modules.
//
var fs = require('fs')
  , watch = require('fs.notify')
  , path = require('path');

//
// Plugin name.
//
exports.name = 'watch';

/**
 * Server side plugin to watch pages, pagelets and views for easy reloading
 * during development.
 *
 * @param {Pipe} bigpipe instance
 * @param {Object} options
 * @api public
 */
exports.server = function server(bigpipe, options) {
};
