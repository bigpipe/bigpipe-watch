# Watch [![Build Status][status]](https://travis-ci.org/bigpipe/plugin-watch) [![NPM version][npmimgurl]](http://badge.fury.io/js/bigpipe-watch) [![Coverage Status][coverage]](http://coveralls.io/r/bigpipe/plugin-watch?branch=master)

[status]: https://travis-ci.org/bigpipe/plugin-watch.png
[npmimgurl]: https://badge.fury.io/js/bigpipe-watch.png
[coverage]: http://coveralls.io/repos/bigpipe/plugin-watch/badge.png?branch=master

[Bigpipe] plugin that will watch added pages, pagelets and their views for easy
developing. As soon as a file is changed the content will be rediscovered and
reloaded into Bigpipe's internals.

[Bigpipe]: https://github.com/bigpipe/bigpipe

## Features

- Watches the files of both temper and compiler
- Will utilize compiler to preprocess the files if required
- Debounces file changes and refreshes

## Installation

The watch plugin is released to npm and can be installed using:

```bash
npm install bigpipe-watch --save
```

To use the plugin from Bigpipe, simply add it after Bigpipe is initialized or
add it to options#plugins. `bigpipe.use` will execute the plugin logic. Make sure
the plugin name is unique, e.g. `watch` by default.

```js
// Usage after initialization
var watch = require('watch')
  , Pipe = require('bigpipe');

var pipe = new Pipe(http.createServer(), {
    pages: __dirname + '/pages',
    public: __dirname + '/public'
  }).listen(8080).use(watch);
```

```js
// Usage through createServer options
var watch = require('watch')
  , Pipe = require('bigpipe');

var pipe = Bigpipe.createServer(8080, {
      pages: __dirname + '/pages',
      public: __dirname + '/public',
      plugins: [ watch ]
    });
```

## License

MIT
