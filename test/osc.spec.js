var oscTest;

describe('OSC', function() {

  beforeEach(function() {
    oscTest = new OSC();
  });

  describe('public methods', function() {

    it('exposes #on and #off methods', function() {
      expect(oscTest.on).toBeDefined();
      expect(oscTest.off).toBeDefined();
    });

  });

});
