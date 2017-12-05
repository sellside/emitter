'use strict';

require('mocha');
const assert = require('assert');
const Emitter = require('..');

describe('Emitter', function() {
  describe('constructor', function() {
    it('should work work with new Emitter', function(cb) {
      let emitter = new Emitter();
      emitter.on('foo', cb);
      emitter.emit('foo');
    });
  });

  describe('mixin', function() {
    it('should mixin properties', function(callback) {
      let proto = {};
      new Emitter(proto);
      proto.on('something', callback);
      proto.emit('something');
    });

    it('should mixin using Emitter.mixin()', function(callback) {
      let proto = {};
      Emitter.mixin(proto);
      proto.on('something', callback);
      proto.emit('something');
    });
  });

  describe('.on(event, fn)', function() {
    it('should add listeners', function() {
      let emitter = new Emitter();
      let calls = [];

      emitter.on('foo', function(val) {
        calls.push('one', val);
      });

      emitter.on('foo', function(val) {
        calls.push('two', val);
      });

      emitter.emit('foo', 1);
      emitter.emit('bar', 1);
      emitter.emit('foo', 2);

      assert.deepEqual(calls, ['one', 1, 'two', 1, 'one', 2, 'two', 2]);
    });

    it('should add listeners with Object.prototype method names', function() {
      let emitter = new Emitter();
      let calls = [];

      emitter.on('constructor', function(val) {
        calls.push('one', val);
      });

      emitter.on('__proto__', function(val) {
        calls.push('two', val);
      });

      emitter.emit('constructor', 1);
      emitter.emit('__proto__', 2);

      assert.deepEqual(calls, ['one', 1, 'two', 2]);
    });
  });

  describe('.once(event, fn)', function() {
    it('should add a single-shot listener', function() {
      let emitter = new Emitter();
      let calls = [];

      emitter.once('foo', function(val) {
        calls.push('one', val);
      });

      emitter.emit('foo', 1);
      emitter.emit('foo', 2);
      emitter.emit('foo', 3);
      emitter.emit('bar', 1);

      assert.deepEqual(calls, ['one', 1]);
    });
  });

  describe('.only()', function() {
    it('should only call the last listener registered', function() {
      let emitter = new Emitter();
      let calls = [];

      emitter.on('foo', () => calls.push('1'));
      emitter.only('foo', () => calls.push('2'));
      emitter.on('foo', () => calls.push('3'));
      emitter.on('foo', () => calls.push('4'));
      emitter.only('foo', () => calls.push('5'));

      emitter.emit('foo');
      emitter.emit('foo');
      emitter.emit('foo');

      assert.deepEqual(calls, ['5', '5', '5']);
    });

    it('should work with .only {first: true}', function() {
      let emitter = new Emitter();
      let calls = [];

      emitter.on('foo', () => calls.push('1'));
      emitter.only('foo', {first: true}, () => calls.push('2'));
      emitter.on('foo', () => calls.push('3'));
      emitter.on('foo', () => calls.push('4'));
      emitter.on('foo', () => calls.push('5'));
      emitter.only('foo', () => calls.push('6'));

      emitter.emit('foo');
      emitter.emit('foo');
      emitter.emit('foo');

      assert.deepEqual(calls, ['2', '2', '2']);
    });

    it('should remove a listener registered with .only', function() {
      let emitter = new Emitter();
      let calls = [];

      emitter.on('foo', () => calls.push('1'));
      emitter.only('foo', () => calls.push('2'));
      emitter.on('foo', () => calls.push('3'));
      emitter.on('foo', () => calls.push('4'));
      emitter.on('foo', () => calls.push('5'));
      emitter.only('foo', () => calls.push('6'));
      emitter.only('foo'); //<= disable "foo"

      emitter.emit('foo');
      emitter.emit('foo');
      emitter.emit('foo');

      assert.deepEqual(calls, []);
    });

    it('should remove all listeners registered with .only', function() {
      let emitter = new Emitter();
      let calls = [];

      emitter.on('foo', () => calls.push('1'));
      emitter.only('foo', () => calls.push('2'));
      emitter.on('foo', () => calls.push('3'));
      emitter.on('foo', () => calls.push('4'));
      emitter.on('foo', () => calls.push('5'));
      emitter.only('foo', () => calls.push('6'));
      emitter.only(); //<= disable all "only" listeners

      emitter.emit('foo');
      emitter.emit('foo');
      emitter.emit('foo');
      assert.deepEqual(calls, []);
    });
  });

  describe('.off(event, fn)', function() {
    it('should remove a listener', function() {
      let emitter = new Emitter();
      let calls = [];

      function one() {
        calls.push('one');
      }
      function two() {
        calls.push('two');
      }

      emitter.on('foo', one);
      emitter.on('foo', two);
      emitter.off('foo', two);

      emitter.emit('foo');

      assert.deepEqual(calls, ['one']);
    });

    it('should work with .once()', function() {
      let emitter = new Emitter();
      let calls = [];

      function one() {
        calls.push('one');
      }

      emitter.once('foo', one);
      emitter.once('fee', one);
      emitter.off('foo', one);

      emitter.emit('foo');
      emitter.emit('foo');
      emitter.emit('foo');

      assert.deepEqual(calls, []);
    });

    it('should work when called from an event', function() {
      let emitter = new Emitter();
      let called;

      function b() {
        called = true;
      }

      emitter.on('foo', function() {
        emitter.off('foo', b);
      });

      emitter.on('foo', b);
      emitter.emit('foo');
      assert(called);
      called = false;
      emitter.emit('foo');
      assert(!called);
    });
  });

  describe('.off(event)', function() {
    it('should remove all listeners for an event', function() {
      let emitter = new Emitter();
      let calls = [];

      function one() {
        calls.push('one');
      }
      function two() {
        calls.push('two');
      }

      emitter.on('foo', one);
      emitter.on('foo', two);
      emitter.off('foo');

      emitter.emit('foo');
      emitter.emit('foo');

      assert.deepEqual(calls, []);
    });
  });

  describe('.off()', function() {
    it('should remove all listeners', function() {
      let emitter = new Emitter();
      let calls = [];

      function one() {
        calls.push('one');
      }
      function two() {
        calls.push('two');
      }

      emitter.on('foo', one);
      emitter.on('bar', two);

      emitter.emit('foo');
      emitter.emit('bar');

      emitter.off();

      emitter.emit('foo');
      emitter.emit('bar');

      assert.deepEqual(calls, ['one', 'two']);
    });
  });

  describe('.listeners(event)', function() {
    describe('when handlers are present', function() {
      it('should return an array of callbacks', function() {
        let emitter = new Emitter();
        function foo() {}
        emitter.on('foo', foo);
        assert.deepEqual(emitter.listeners('foo'), [foo]);
      });
    });

    describe('when no handlers are present', function() {
      it('should return an empty array', function() {
        let emitter = new Emitter();
        assert.deepEqual(emitter.listeners('foo'), []);
      });
    });
  });

  describe('.has(event)', function() {
    describe('when handlers are present', function() {
      it('should return true', function() {
        let emitter = new Emitter();
        emitter.on('foo', function() {});
        assert(emitter.has('foo'));
      });
    });

    describe('when no handlers are present', function() {
      it('should return false', function() {
        let emitter = new Emitter();
        assert(!emitter.has('foo'));
      });
    });
  });

  describe('.hasListeners(event)', function() {
    describe('when handlers are present', function() {
      it('should return true', function() {
        let emitter = new Emitter();
        emitter.on('foo', function() {});
        assert(emitter.hasListeners('foo'));
      });
    });

    describe('when no handlers are present', function() {
      it('should return false', function() {
        let emitter = new Emitter();
        assert(!emitter.hasListeners('foo'));
      });
    });
  });
});
