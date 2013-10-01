'use strict';

//
// Required modules.
//
var Notify = require('fs.notify')
  , fs = require('fs');

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
  var notifications = new Notify
    , files = {
        temper: Object.keys(bigpipe.temper.file),
        compiler: Object.keys(bigpipe.compiler.alias)
      };

  /**
   * Check cache and prefetch if the file is part of the compiler.
   *
   * @param {String} file name
   * @api private
   */
  function change(file) {
    console.log('\nFile changes detected\n'.green);

    files.temper.forEach(function loopTemper(path) {
      if (!~path.indexOf(file)) return;

      delete bigpipe.temper.file[path];
      delete bigpipe.temper.compiled[path];
      bigpipe.temper.prefetch(path);

      console.log(' -- refreshing temper cache using: ' + path);
    });

    files.compiler.forEach(function loopCompiler(path) {
      if (!~path.indexOf(file)) return;

      bigpipe.compiler.put(path, function compiled(error, dest) {
        if (error) return console.error(error);

        console.log(' -- refreshing compiler cache using: ' + path);
      });
    });
  }

  //
  // Notify the developer of changes and reload files.
  //
  notifications
    .add(files.temper)
    .add(files.compiler)
    .on('change', debounce(change, 100));
};
