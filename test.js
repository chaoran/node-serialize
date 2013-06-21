var serialize = require('./index');
var assert = require('assert');

var foo = function(ms, callback) {
  if (typeof ms === 'number') {
    setTimeout(function() {
      callback();
    }, ms);
  } else {
    callback(new Error('got an error!'));
  }
};

var serialized = serialize(foo);

describe('.serialize()', function() {
  it("should serialize a function's execution", function(done) {
    var time = process.hrtime();
    for (var i = 0; i < 9; ++i) {
      serialized(10);
    }
    serialized(10, function() {
      time = process.hrtime(time)[1] / 1e6;
      assert(time > 100, time);
      done();
    });
  });

  it("should invoke callback with error if error occurs", function(done) {
    var time = process.hrtime();
    for (var i = 0; i < 5; ++i) serialized(10);
    serialized('bad input');
    for (var i = 0; i < 5; ++i) serialized(10);
    serialized(10, function(err) {
      assert(err instanceof Error && err.message === 'got an error!');
      time = process.hrtime(time)[1] / 1e6;
      assert(time < 100, time);
      assert(time > 50, time);
      done();
    });
  });
});

describe('serialized.free()', function() {
  it("should retrieve the original function", function() {
    assert.strictEqual(foo, serialized.free());
  });
});
