describe('Bigpipe static content delivery plugin', function () {
  'use strict';

  var chai = require('chai');
  chai.Assertion.includeStack = true;

  var watch = require('../')
    , Pipe = require('bigpipe')
    , expect = chai.expect
    , server = Pipe.createServer(1337, {
        public: __dirname + '/fixtures',
        dist: '/tmp/dist'
      }).use('content', content);
});
