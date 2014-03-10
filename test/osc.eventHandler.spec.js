describe('OSCEventHandler', function() {

  var oscTest, cbkey;

  beforeEach(function() {
    oscTest = new OSC();
    cbkey = oscTest.__OSCEventHandler.CALLBACKS_KEY;
  });

  describe('#on and #off', function() {

    describe('normal event', function() {

      var token;

      beforeEach(function() {
        token = oscTest.__OSCEventHandler.on('onClose', function(){ return true; });
      });

      it('returns a token', function() {
        expect(token).toEqual('0');
      });

      it('#on subscribes to a callback handler', function() {
        var handler = oscTest.__OSCEventHandler._callbackHandlers.onClose[0];
        expect(handler).toBeDefined();
        expect(handler.token).toEqual('0');
        expect(handler.callback).toEqual(jasmine.any(Function));
      });

      it('#off unsubscribes a callback handler', function() {
        var success = oscTest.__OSCEventHandler.off('onClose', token);
        var handler = oscTest.__OSCEventHandler._callbackHandlers.onClose[0];
        expect(handler).not.toBeDefined();
        expect(success).toBe(true);
      });
    });

    describe('osc address listener', function() {

      var token;

      describe('using an string address', function() {

        beforeEach(function() {
          token = oscTest.__OSCEventHandler.on('/a/test/path/', function(){ return true; });
        });

        it('returns a token', function() {
          expect(token).toEqual('0');
        });

        it('#on subscribes to a osc address handler', function() {
          var handler = oscTest.__OSCEventHandler._addressHandlers['a']['test']['path'];
          expect(handler).toBeDefined();
          expect(handler[cbkey][0].token).toEqual('0');
          expect(handler[cbkey][0].callback).toEqual(jasmine.any(Function));
        });

        it('#off unsubscribes a osc address handler', function() {
          var success = oscTest.__OSCEventHandler.off('/a/test/path/', token);
          var closePathFailA = oscTest.__OSCEventHandler.off('/a/test/path/further/', token);
          var closePathFailB = oscTest.__OSCEventHandler.off('/a/test/', token);
          var handler = oscTest.__OSCEventHandler._addressHandlers['a']['test']['path'];
          expect(handler[cbkey][0]).not.toBeDefined();
          expect(success).toBe(true);
          expect(closePathFailA).toBe(false);
          expect(closePathFailB).toBe(false);
        });

      });

      describe('using an array address', function() {

        beforeEach(function() {
          token = oscTest.__OSCEventHandler.on(['another', 'test'], function(){ return 42; });
        });

        it('returns a token', function() {
          expect(token).toEqual('0');
        });

        it('#on subscribes to a osc address handler', function() {
          var handler = oscTest.__OSCEventHandler._addressHandlers['another']['test'];
          expect(handler).toBeDefined();
          expect(handler[cbkey][0].token).toEqual('0');
          expect(handler[cbkey][0].callback()).toEqual(42);
        });

        it('#off unsubscribes a osc address handler', function() {
          var success = oscTest.__OSCEventHandler.off(['another','test'], token);
          var handler = oscTest.__OSCEventHandler._addressHandlers['another']['test'];
          expect(handler[cbkey][0]).not.toBeDefined();
          expect(success).toBe(true);
        });

      });

      describe('using a root address', function() {

        beforeEach(function() {
          token = oscTest.__OSCEventHandler.on('/', function(){ return true; });
        });

        it('#on subscribes to a root osc address handler', function() {
          var handler = oscTest.__OSCEventHandler._addressHandlers;
          expect(handler[cbkey][0].token).toEqual('0');
          expect(handler[cbkey][0].callback).toEqual(jasmine.any(Function));
        });

        it('#off unsubscribes a root osc address handler', function() {
          var success = oscTest.__OSCEventHandler.off([], token);
          var handler = oscTest.__OSCEventHandler._addressHandlers;
          expect(handler[cbkey][0]).not.toBeDefined();
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

        oscTest.__OSCEventHandler.on('onClose', function(hData){ return 1; });
        oscTest.__OSCEventHandler.on('onOpen', function(hData){ return 2; });
        oscTest.__OSCEventHandler.on('onOpen', function(hData){ return 3; });

        spyOn(oscTest.__OSCEventHandler._callbackHandlers.onClose[0], 'callback').and.callThrough();
        spyOn(oscTest.__OSCEventHandler._callbackHandlers.onOpen[0], 'callback').and.callThrough();
        spyOn(oscTest.__OSCEventHandler._callbackHandlers.onOpen[1], 'callback').and.callThrough();
      });

      it('passes over the event arguments', function() {
        oscTest.__OSCEventHandler.notify('onClose', testdata);
        expect(oscTest.__OSCEventHandler._callbackHandlers.onClose[0].callback).toHaveBeenCalledWith(testdata);
      });

      it('notifies the right callbacks', function() {
        oscTest.__OSCEventHandler.notify('onOpen', testdata);
        expect(oscTest.__OSCEventHandler._callbackHandlers.onClose[0].callback).not.toHaveBeenCalled();
        expect(oscTest.__OSCEventHandler._callbackHandlers.onOpen[0].callback).toHaveBeenCalled();
        expect(oscTest.__OSCEventHandler._callbackHandlers.onOpen[1].callback).toHaveBeenCalled();
      });

    });

    describe('osc address listener', function() {

      var testdata;

      beforeEach(function() {

        testdata = { test: 'data' };

        oscTest.__OSCEventHandler.on('/', function(hData){ return 1; });
        oscTest.__OSCEventHandler.on('/a/test/', function(hData){ return 2; });
        oscTest.__OSCEventHandler.on(['a', 'test'], function(hData){ return 3; });
        oscTest.__OSCEventHandler.on('/a/test/path', function(hData){ return 4; });

        spyOn(oscTest.__OSCEventHandler._addressHandlers[cbkey][0], 'callback').and.callThrough();
        spyOn(oscTest.__OSCEventHandler._addressHandlers['a']['test'][cbkey][0], 'callback').and.callThrough();
        spyOn(oscTest.__OSCEventHandler._addressHandlers['a']['test'][cbkey][1], 'callback').and.callThrough();
        spyOn(oscTest.__OSCEventHandler._addressHandlers['a']['test']['path'][cbkey][0], 'callback').and.callThrough();

      });

      it('passes over the event arguments', function() {
        oscTest.__OSCEventHandler.notify('/a/test/path', testdata);
        expect(oscTest.__OSCEventHandler._addressHandlers['a']['test']['path'][cbkey][0].callback).toHaveBeenCalledWith(testdata);
      });

      it('notifies the root listener', function() {
        oscTest.__OSCEventHandler.notify('/', testdata);
        expect(oscTest.__OSCEventHandler._addressHandlers[cbkey][0].callback).toHaveBeenCalled();
        expect(oscTest.__OSCEventHandler._addressHandlers['a']['test'][cbkey][0].callback).not.toHaveBeenCalled();
        expect(oscTest.__OSCEventHandler._addressHandlers['a']['test']['path'][cbkey][0].callback).not.toHaveBeenCalled();
      });

      it('notifies two listeners', function() {
        oscTest.__OSCEventHandler.notify('/a/test', testdata);
        expect(oscTest.__OSCEventHandler._addressHandlers['a']['test'][cbkey][0].callback).toHaveBeenCalled();
        expect(oscTest.__OSCEventHandler._addressHandlers['a']['test'][cbkey][1].callback).toHaveBeenCalled();
        expect(oscTest.__OSCEventHandler._addressHandlers['a']['test']['path'][cbkey][0].callback).not.toHaveBeenCalled();
      });

      it('notifies parent listeners as well', function() {
        oscTest.__OSCEventHandler.notify('/a/test/path', testdata);
        expect(oscTest.__OSCEventHandler._addressHandlers[cbkey][0].callback).toHaveBeenCalled();
        expect(oscTest.__OSCEventHandler._addressHandlers['a']['test'][cbkey][0].callback).toHaveBeenCalled();
        expect(oscTest.__OSCEventHandler._addressHandlers['a']['test'][cbkey][1].callback).toHaveBeenCalled();
        expect(oscTest.__OSCEventHandler._addressHandlers['a']['test']['path'][cbkey][0].callback).toHaveBeenCalled();
      });

      it('notifies two listeners with slightly different but correct path', function() {
        oscTest.__OSCEventHandler.notify('/a/test/', testdata);
        expect(oscTest.__OSCEventHandler._addressHandlers['a']['test'][cbkey][0].callback).toHaveBeenCalled();
        expect(oscTest.__OSCEventHandler._addressHandlers['a']['test'][cbkey][1].callback).toHaveBeenCalled();
        expect(oscTest.__OSCEventHandler._addressHandlers['a']['test']['path'][cbkey][0].callback).not.toHaveBeenCalled();
      });

    });

  });

});
