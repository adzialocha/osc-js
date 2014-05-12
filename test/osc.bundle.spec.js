describe('OSCBundle', function() {

  /* OSCBundle data:

    timeTag: 1399921382000

    bundleElements:

      [0] OSCMessage
        /te?t
        ,ifsf
        0: 7395
        1: 5684.9150390625
        2: "teststring"
        3: 2100.76953125

      [1] OSCMessage
        /test
        ,sif
        0: "test22"
        1: 12
        2: 22.1

  */

  var BINARY_DATA = new Int8Array([
    35, 98, 117, 110, 100, 108, 101, 0, 83, 113, 26, -26, 0, 0,
    3, -85, 0, 0, 0, 40, 47, 116, 101, 63, 116, 0, 0, 0, 44, 105,
    102, 115, 102, 0, 0, 0, 0, 0, 28, -29, 69, -79, -89, 82, 116,
    101, 115, 116, 115, 116, 114, 105, 110, 103, 0, 0, 69, 3, 76,
    80, 0, 0, 0, 32, 47, 116, 101, 115, 116, 0, 0, 0, 44, 115, 105,
    102, 0, 0, 0, 0, 116, 101, 115, 116, 50, 50, 0, 0, 0, 0, 0, 12,
    65, -80, -52, -51
  ]);

  var oscTest, oscBundle;

  beforeEach(function() {
    oscTest = new OSC();
    oscBundle = new OSC.Bundle();
  });

  describe('#decode', function() {

    describe('without binary data', function() {

      it('holds default message data', function() {
        expect(oscBundle.bundleElements).toEqual([]);
        expect(oscBundle.timeTag.milliseconds).toEqual(0);
      });

    });

    describe('with binary data', function() {

      beforeEach(function() {
        oscBundle.decode(BINARY_DATA.buffer);
      });

      it('reads a binary osc message', function() {
        expect(oscBundle.timeTag.milliseconds).toEqual(1399921382000);
        expect(oscBundle.bundleElements.length).toEqual(2);
        expect(oscBundle.bundleElements[0].addressPattern).toEqual('/te?t');
        expect(oscBundle.bundleElements[0].args[1]).toEqual(5684.9150390625);
        expect(oscBundle.bundleElements[1].args[1]).toEqual(12);
      });

    });

  });

  describe('#encode', function() {

    beforeEach(function() {
      var message = new OSC.Message('/test', 'test22', 12, 22.1);

      var message2 = new OSC.Message();
      message2.address('/te?t');
      message2.add(7395);
      message2.add(5684.9150390625);
      message2.add('teststring');
      message2.add(2100.76953125);

      oscBundle.add(message2);
      oscBundle.add(message);
      oscBundle.timestamp(1399921382939);
    });

    it('encodes the message properly', function() {
      expect(oscBundle.encode()).toEqual(BINARY_DATA);
    });

  });

});
