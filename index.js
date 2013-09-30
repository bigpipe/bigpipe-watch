'use strict';

//
// Required modules.
//
var Notify = require('fs.notify');

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
  var files = Object.keys(bigpipe.compiler.alias)
    , notifications = new Notify(files);

  notifications.on('change', function change(file) {
    files.forEach(function loopFiles(path) {
      if (~path.indexOf(file)) {
        //
        // Delete the content from cache and prefetch again.
        //
        delete bigpipe.temper.file[path];
        delete bigpipe.temper.compiled[path];

        bigpipe.temper.prefetch(path);
      }
    });

    //
    // Notify the developer of changes and reloaded files.
    //
    console.log('File changes detected, refreshing paths containing: ' + file);
  });
};
