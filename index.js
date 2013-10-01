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
 * Debounce function to defer the call of the supplied `fn` with `wait` ms. The
 * timer will be reset as long as the function is called.
 *
 * @param {Function} fn function to call
 * @param {Number} wait milliseconds
 * @api private
 */
function debounce(fn, wait) {
  return function defer() {
    var context = this
      , args = arguments
      , timestamp = Date.now()
      , result, timeout;

    function later() {
      var last = Date.now() - timestamp;
      if (last < wait) return timeout = setTimeout(later, wait - last);

      result = fn.apply(context, args);
    }

    if (!timeout) timeout = setTimeout(later, wait);
    return result;
  };
}

/**
 * Server side plugin to watch pages, pagelets and views for easy reloading
 * during development.
 *
 * @param {Pipe} bigpipe instance
 * @param {Object} options
 * @api public
 */
exports.server = function server(bigpipe, options) {
  var files = Object.keys(bigpipe.temper.file)
    , notifications;

  //
  // Also add compiler cache items.
  //
  Object.keys(bigpipe.compiler.alias).forEach(function loopCompilerCache(item) {
    if (!~files.indexOf(item)) files.push(item);
  });

  /**
   * Check cache and prefetch if the file is part of the compiler.
   *
   * @param {String} file name
   * @api private
   */
  function change(file) {
    files.forEach(function loopCompiler(path) {
      if (~path.indexOf(file)) {
        delete bigpipe.temper.file[path];
        delete bigpipe.temper.compiled[path];

        bigpipe.temper.prefetch(path);
      }

      // TODO add compiler stuff.
    });

    console.log('File changes detected, refreshing compiler cache using: ' + file);
  }

  //
  // Notify the developer of changes and reload files.
  //
  notifications = new Notify(files);
  notifications.on('change', debounce(change, 100));
};
