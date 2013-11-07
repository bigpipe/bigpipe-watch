describe('Bigpipe static content delivery plugin', function () {
  'use strict';

  var chai = require('chai');
  chai.Assertion.includeStack = true;

  var watch = require('../')
    , fs = require('fs')
    , Pipe = require('bigpipe')
    , expect = chai.expect
    , server = Pipe.createServer(1337, {
        public: __dirname + '/fixtures',
        dist: '/tmp/dist'
      }).use(watch);

  it('exposes server side functionality', function () {
    expect(watch).to.have.property('server');
    expect(watch.server).to.be.a('function');
  });

  it('exposes default plugin name', function () {
    expect(watch).to.have.property('name', 'watch');
  });

  it('exposes hooks config object', function () {
    expect(watch).to.have.property('hooks');
  });

  it('hooks has pipe.js hook by default', function () {
    expect(watch.hooks).to.have.property('pipe.js');
    expect(watch.hooks['pipe.js']).to.be.a('function');
  });

  it('pipe.js hook calls compiler#bigPipe with content of filename on path', function () {
    var temp = {
      compiler: {
        bigPipe: function(content) {
          expect(content).to.include('--reporter spec');
        }
      }
    };

    watch.hooks['pipe.js'].call(temp, __dirname + '/mocha.opts');
  });

  it('watches the files listed as alias of compiler', function (done) {
    var toChange = __dirname + '/../node_modules/bigpipe/pagelets/diagnostics/diagnostic.jade';

    server.once('change', function (path) {
      expect(arguments.length).to.equal(1);
      expect(path).to.equal('diagnostic.jade');
      done();
    });

    fs.writeFileSync(toChange, fs.readFileSync(toChange));
  });

  it('watches the files listed in temper', function (done) {
    var toChange = __dirname + '/../node_modules/bigpipe/pages/500/500.jade';

    server.once('change', function (path) {
      expect(arguments.length).to.equal(1);
      expect(path).to.equal('500.jade');
      done();
    });

    fs.writeFileSync(toChange, fs.readFileSync(toChange));
  });

  it('ignores changes in non watched files', function (done) {
    var toChange = __filename;

    server.once('change', function (path, random) {
      expect(arguments.length).to.equal(2);
      expect(random).to.equal(1);
      expect(path).to.equal('manual');
      done();
    });

    fs.writeFileSync(toChange, fs.readFileSync(toChange));

    // Do manual trigger as fs.notify will not have emitted.
    server.emit('change', 'manual', 1);
  });

  it('provides a debouncer for deferred calls to refresh', function (done) {
    var i, timer, fn = watch.debounce(server.emits('debounce'), 100);
    function loop() {
      i = i || 1;
      if (i++ > 4) clearInterval(timer);
      fn();
    }

    expect(watch).to.have.property('debounce');
    expect(watch.debounce).to.be.a('function');
    expect(watch.debounce(loop, 20)).to.be.a('function');
    server.on('debounce', done);

    timer = setInterval(loop, 20);
  });
});
