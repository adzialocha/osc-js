describe('OSCEventHandler', function() {

  var oscTest, oscHandler, cbkey;

  beforeEach(function() {
    oscTest = new OSC();
    oscHandler = new oscTest.__OSCEventHandler();
  });

  describe('#on and #off', function() {

    describe('normal event', function() {

      var token;

      beforeEach(function() {
        token = oscHandler.on('close', function(){ return true; });
      });

      it('returns a token', function() {
        expect(token).toEqual('0');
      });

      it('#on subscribes to a callback handler', function() {
        var handler = oscHandler._callbackHandlers.close[0];
        expect(handler).toBeDefined();
        expect(handler.token).toEqual('0');
        expect(handler.callback).toEqual(jasmine.any(Function));
      });

      it('#off unsubscribes a callback handler', function() {
        var success = oscHandler.off('close', token);
        var handler = oscHandler._callbackHandlers.close[0];
        expect(handler).not.toBeDefined();
        expect(success).toBe(true);
      });
    });

    describe('osc address listener', function() {

      var token;

      describe('using an string address', function() {

        beforeEach(function() {
          token = oscHandler.on('/a/test/path/', function(){ return true; });
        });

        it('returns a token', function() {
          expect(token).toEqual('0');
        });

        it('#on subscribes to a osc address handler', function() {
          var handler = oscHandler._addressHandlers['/a/test/path'];
          expect(handler).toBeDefined();
          expect(handler[0].token).toEqual('0');
          expect(handler[0].callback).toEqual(jasmine.any(Function));
        });

        it('#off unsubscribes a osc address handler', function() {
          var success = oscHandler.off('/a/test/path', token);
          var closePathFailA = oscHandler.off('/a/test/path/further', token);
          var closePathFailB = oscHandler.off('/a/test', token);
          var handler = oscHandler._addressHandlers['/a/test/path'];
          expect(handler[0]).not.toBeDefined();
          expect(success).toBe(true);
          expect(closePathFailA).toBe(false);
          expect(closePathFailB).toBe(false);
        });

      });

      describe('using an array address', function() {

        beforeEach(function() {
          token = oscHandler.on(['a', 'test', 'path'], function(){ return true; });
        });

        it('returns a token', function() {
          expect(token).toEqual('0');
        });

        it('#on subscribes to a osc address handler', function() {
          var handler = oscHandler._addressHandlers['/a/test/path'];
          expect(handler).toBeDefined();
          expect(handler[0].token).toEqual('0');
          expect(handler[0].callback).toEqual(jasmine.any(Function));
        });

        it('#off unsubscribes a osc address handler', function() {
          var success = oscHandler.off(['a','test','path'], token);
          var closePathFailA = oscHandler.off('/a/test/path/further', token);
          var closePathFailB = oscHandler.off('/a/test', token);
          var handler = oscHandler._addressHandlers['/a/test/path'];
          expect(handler[0]).not.toBeDefined();
          expect(success).toBe(true);
          expect(closePathFailA).toBe(false);
          expect(closePathFailB).toBe(false);
        });

      });

      describe('using a root address', function() {

        beforeEach(function() {
          token = oscHandler.on('/', function(){ return true; });
        });

        it('#on subscribes to a root osc address handler', function() {
          var handler = oscHandler._addressHandlers['/'];
          expect(handler[0].token).toEqual('0');
          expect(handler[0].callback).toEqual(jasmine.any(Function));
        });

        it('#off unsubscribes a root osc address handler', function() {
          var success = oscHandler.off('/', token);
          var handler = oscHandler._addressHandlers['/'];
          expect(handler[0]).not.toBeDefined();
          expect(success).toBe(true);
        });

      });

    });

  });

  describe('#notify', function() {

    describe('normal event listener', function() {

      var testdata;

      beforeEach(function() {
        testdata = { some_test: 'data' };

        oscHandler.on('close', function(hData){ return 1; });
        oscHandler.on('open', function(hData){ return 2; });
        oscHandler.on('open', function(hData){ return 3; });

        spyOn(oscHandler._callbackHandlers.close[0], 'callback').and.callThrough();
        spyOn(oscHandler._callbackHandlers.open[0], 'callback').and.callThrough();
        spyOn(oscHandler._callbackHandlers.open[1], 'callback').and.callThrough();
      });

      it('passes over the event arguments', function() {
        oscHandler.notify('close', testdata);
        expect(oscHandler._callbackHandlers.close[0].callback).toHaveBeenCalledWith(testdata);
      });

      it('notifies the right callbacks', function() {
        oscHandler.notify('open', testdata);
        expect(oscHandler._callbackHandlers.close[0].callback).not.toHaveBeenCalled();
        expect(oscHandler._callbackHandlers.open[0].callback).toHaveBeenCalled();
        expect(oscHandler._callbackHandlers.open[1].callback).toHaveBeenCalled();
      });

    });

    describe('osc address listener', function() {

      var testdata;

      beforeEach(function() {

        testdata = { test: 'data' };

        oscHandler.on('/', function(hData){ return 1; });
        oscHandler.on('/one/test', function(hData){ return 2; });
        oscHandler.on('/and/another', function(hData){ return 3; });
        oscHandler.on('/two/test/path', function(hData){ return 4; });
        oscHandler.on('/two/test/path', function(hData){ return 5; });
        oscHandler.on('/two/some/path', function(hData){ return 6; });

        spyOn(oscHandler._addressHandlers['/'][0], 'callback').and.callThrough();
        spyOn(oscHandler._addressHandlers['/one/test'][0], 'callback').and.callThrough();
        spyOn(oscHandler._addressHandlers['/and/another'][0], 'callback').and.callThrough();
        spyOn(oscHandler._addressHandlers['/two/test/path'][0], 'callback').and.callThrough();
        spyOn(oscHandler._addressHandlers['/two/test/path'][1], 'callback').and.callThrough();
        spyOn(oscHandler._addressHandlers['/two/some/path'][0], 'callback').and.callThrough();

      });

      it('passes over the event arguments', function() {
        oscHandler.notify('/and/another', testdata);
        expect(oscHandler._addressHandlers['/and/another'][0].callback).toHaveBeenCalledWith(testdata);
      });

      it('notifies the root listener', function() {
        oscHandler.notify('/', testdata);
        expect(oscHandler._addressHandlers['/'][0].callback).toHaveBeenCalled();
        expect(oscHandler._addressHandlers['/one/test'][0].callback).not.toHaveBeenCalled();
        expect(oscHandler._addressHandlers['/and/another'][0].callback).not.toHaveBeenCalled();
      });

      it('notifies two listeners', function() {
        oscHandler.notify('/two/test/path', testdata);
        expect(oscHandler._addressHandlers['/two/test/path'][0].callback).toHaveBeenCalled();
        expect(oscHandler._addressHandlers['/two/test/path'][1].callback).toHaveBeenCalled();
        expect(oscHandler._addressHandlers['/two/some/path'][0].callback).not.toHaveBeenCalled();
      });

      describe('using regular expressions', function() {

        it('with {} wildcard', function() {
          oscHandler.notify('/two/{test,some}/path', testdata);
          expect(oscHandler._addressHandlers['/two/test/path'][0].callback).toHaveBeenCalled();
          expect(oscHandler._addressHandlers['/two/some/path'][0].callback).toHaveBeenCalled();
        });

        it('with [] wildcard', function() {
          oscHandler.notify('/[pawgfo]ne/[bnit]est', testdata);
          expect(oscHandler._addressHandlers['/one/test'][0].callback).toHaveBeenCalled();
          expect(oscHandler._addressHandlers['/'][0].callback).not.toHaveBeenCalled();
        });

        it('with * wildcard', function() {
          oscHandler.notify('/two/*', testdata);
          expect(oscHandler._addressHandlers['/two/test/path'][0].callback).toHaveBeenCalled();
          expect(oscHandler._addressHandlers['/two/test/path'][1].callback).toHaveBeenCalled();
          expect(oscHandler._addressHandlers['/two/some/path'][0].callback).toHaveBeenCalled();
          expect(oscHandler._addressHandlers['/one/test'][0].callback).not.toHaveBeenCalled();
        });

        it('with * wildcard calling all', function() {
          oscHandler.notify('/*', testdata);
          expect(oscHandler._addressHandlers['/'][0].callback).toHaveBeenCalled();
          expect(oscHandler._addressHandlers['/one/test'][0].callback).toHaveBeenCalled();
          expect(oscHandler._addressHandlers['/and/another'][0].callback).toHaveBeenCalled();
          expect(oscHandler._addressHandlers['/two/test/path'][0].callback).toHaveBeenCalled();
          expect(oscHandler._addressHandlers['/two/test/path'][1].callback).toHaveBeenCalled();
          expect(oscHandler._addressHandlers['/two/some/path'][0].callback).toHaveBeenCalled();
        });

        it('with ? wildcard', function() {
          oscHandler.notify('/two/????/pa?h', testdata);
          expect(oscHandler._addressHandlers['/'][0].callback).not.toHaveBeenCalled();
          expect(oscHandler._addressHandlers['/two/test/path'][0].callback).toHaveBeenCalled();
          expect(oscHandler._addressHandlers['/two/some/path'][0].callback).toHaveBeenCalled();
        });

      });

    });

  });

});
