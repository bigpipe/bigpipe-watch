'use strict';

//
// Required modules.
//
var Notify = require('fs.notify')
  , colors = require('colors')
  , path = require('path')
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

/**
 * Server side plugin to watch pages, pagelets and views for easy reloading
 * during development.
 *
 * @param {Pipe} bigpipe instance
 * @api public
 */
exports.server = function server(bigpipe, options) {
  var notifications = new Notify
    , tempers = [ bigpipe._temper ];

  //
  // Keep track of all the temper instances for each individual pagelet.
  //
  bigpipe.on('transform:pagelet:before', function transform(Pagelet, next) {
    if (Pagelet._temper) tempers.push(Pagelet._temper);
    next(null, Pagelet);
  });

  //
  // Wait till BigPipe emits listening. Compiler will have a collection of files
  // to watch at that point.
  //
  bigpipe.once('listening', function addFiles() {
    var assets = Object.keys(bigpipe._compiler.alias)
      , views = Object.keys(bigpipe._temper.compiled);

    /**
     * Check cache and prefetch if the file is part of the compiler.
     *
     * @param {String} file name
     * @api private
     */
    function refresh(file, event, full) {
      views.forEach(function loopViews(path) {
        if (path !== full) return;

        tempers.forEach(function eachTemper(temper) {
          delete temper.file[path];
          delete temper.compiled[path];

          temper.prefetch(path);
        });
      });

      assets.forEach(function loopAssets(path) {
        if (path !== full) return;

        bigpipe.compiler.put(path);
      });

      bigpipe.emit('change', file, event, full);
      console.log([
        '[watch] detected content changes --'.blue,
        file.white,
        'changed'.white
      ].join(' '));
    }

    //
    // Notify the developer of changes and reload files.
    //
    notifications.add(assets).add(views).on('change', exports.debounce(refresh, 100));
  });
};
