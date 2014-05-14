describe('OSC', function() {

  var oscTest;

  beforeEach(function() {
    oscTest = new OSC();
  });

  describe('public methods', function() {

    // OSCEventHandler

    describe('OSCEventHandler', function() {

      it('exposes #on and #off methods', function() {
        expect(oscTest.on).toBeDefined();
        expect(oscTest.off).toBeDefined();
      });

    });

    // OSCSocket

    describe('OSCSocket', function() {

      it('exposes #connect, #disconnect and #status methods', function() {
        expect(oscTest.connect).toBeDefined();
        expect(oscTest.status).toBeDefined();
        expect(oscTest.disconnect).toBeDefined();
      });

      it('exposes OSCSocket flags', function() {
        expect(oscTest.SOCKET.IS_CONNECTING).toBeDefined();
      });

    });

  });

});
