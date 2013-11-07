'use strict';

//
// Required modules.
//
var Notify = require('fs.notify')
  , path = require('path')
  , fs = require('fs')
  , hooks;

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
exports.debounce = function debounce(fn, wait) {
  var timeout;

  return function defer() {
    var context = this
      , args = arguments
      , timestamp = Date.now()
      , result;

    function later() {
      var last = Date.now() - timestamp;
      if (last < wait) return timeout = setTimeout(later, wait - last);

      timeout = null;
      result = fn.apply(context, args);
    }

    if (!timeout) timeout = setTimeout(later, wait);
    return result;
  };
};

exports.hooks = hooks = {
  'pipe.js': function rebuildPipe(path) {
    this.compiler.bigPipe(fs.readFileSync(path, 'utf-8'));
  }
};

/**
 * Server side plugin to watch pages, pagelets and views for easy reloading
 * during development.
 *
 * @param {Pipe} bigpipe instance
 * @api public
 */
exports.server = function server(bigpipe) {
  var notifications = new Notify
    , files = {
        temper: Object.keys(bigpipe.temper.file),
        compiler: Object.keys(bigpipe.compiler.origin)
      };

  /**
   * Check cache and prefetch if the file is part of the compiler.
   *
   * @param {String} file name
   * @api private
   */
  function refresh(file) {
    console.log('\nFile changes detected, refreshing pages and pagelets'.green);

    files.temper.forEach(function loopTemper(path) {
      if (!~path.indexOf(file)) return;

      delete bigpipe.temper.file[path];
      delete bigpipe.temper.compiled[path];

      if (file in hooks) return hooks[file].call(bigpipe);
      bigpipe.temper.prefetch(path);
    });

    files.compiler.forEach(function loopCompiler(path) {
      if (!~path.indexOf(file)) return;

      if (file in hooks) return hooks[file].call(bigpipe, path);
      bigpipe.compiler.put(path);
    });

    console.log('  -- '.blue + file.white + ' changed'.white);
    bigpipe.emit('change', file);
  }

  //
  // Notify the developer of changes and reload files.
  //
  notifications
    .add(files.temper)
    .add(files.compiler)
    .on('change', exports.debounce(refresh, 100));
};
