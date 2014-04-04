describe('Bigpipe watch plugin', function () {
  'use strict';

  var chai = require('chai');
  chai.Assertion.includeStack = true;

  var watch = require('../')
    , fs = require('fs')
    , Pipe = require('bigpipe')
    , expect = chai.expect
    , server;

  before(function (done) {
    this.timeout(6E4);

    server = Pipe.createServer(1337, {
      public: __dirname + '/fixtures',
      plugins: [ watch ],
      dist: '/tmp/dist'
    });

    server.once('listening', done);
  });

  it('exposes server side functionality', function () {
    expect(watch).to.have.property('server');
    expect(watch.server).to.be.a('function');
  });

  it('exposes default plugin name', function () {
    expect(watch).to.have.property('name', 'watch');
  });

  it('watches the files listed as alias of compiler', function (done) {
    var toChange = __dirname + '/../node_modules/bigpipe/pagelets/diagnostics/diagnostic.ejs';

    server.once('change', function (path, event, full) {
      expect(arguments.length).to.equal(3);
      expect(path).to.equal('diagnostic.ejs');
      expect(event).to.equal('change');
      expect(full).to.include('node_modules/bigpipe/pagelets/diagnostics/diagnostic.ejs');
      done();
    });

    fs.writeFileSync(toChange, fs.readFileSync(toChange));
  });

  it('watches the files listed in temper', function (done) {
    var toChange = __dirname + '/../node_modules/bigpipe/pages/500/500.ejs';

    server.once('change', function (path, event, full) {
      expect(arguments.length).to.equal(3);
      expect(path).to.equal('500.ejs');
      expect(event).to.equal('change');
      expect(full).to.include('node_modules/bigpipe/pages/500/500.ejs');
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
