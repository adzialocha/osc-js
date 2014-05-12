describe('OSCMessage', function() {

  /* OSCMessage Data:

    /test/pa
    ,iifsf
    0: 7395
    1: 4864
    2: 5684.9150390625
    3: "teststring"
    4: 2100.76953125 */

  var BINARY_DATA = new Int8Array([
    47, 116, 101, 115, 116, 47, 112, 97, 0, 0, 0, 0,
    44, 105, 105, 102, 115, 102, 0, 0, 0, 0, 28, -29,
    0, 0, 19, 0, 69, -79, -89, 82, 116, 101, 115, 116,
    115, 116, 114, 105, 110, 103, 0, 0, 69, 3, 76, 80
  ]);

  var oscTest, oscMessage;

  beforeEach(function() {
    oscTest = new OSC();
    oscMessage = new OSC.Message();
  });

  describe('#decode', function() {

    describe('without binary data', function() {

      it('holds default message data', function() {
        expect(oscMessage.addressPattern).toEqual('');
        expect(oscMessage.typesString).toEqual('');
        expect(oscMessage.args.length).toEqual(0);
      });

    });

    describe('with binary data', function() {

      beforeEach(function() {
        oscMessage.decode(BINARY_DATA.buffer);
      });

      it('reads a binary osc message', function() {
        expect(oscMessage.addressPattern).toEqual('/test/pa');
        expect(oscMessage.typesString).toEqual('iifsf');
        expect(oscMessage.args.length).toEqual(5);
        expect(oscMessage.args[0]).toEqual(7395);
        expect(oscMessage.args[1]).toEqual(4864);
        expect(oscMessage.args[2]).toEqual(5684.9150390625);
        expect(oscMessage.args[3]).toEqual('teststring');
        expect(oscMessage.args[4]).toEqual(2100.76953125);
      });

    });

  });

  describe('#encode', function() {

    beforeEach(function() {
      oscMessage.address('/test/pa');
      oscMessage.add(7395);
      oscMessage.add(4864);
      oscMessage.add(5684.9150390625);
      oscMessage.add('teststring');
      oscMessage.add(2100.76953125);
    });

    it('encodes the message properly', function() {
      expect(oscMessage.encode()).toEqual(BINARY_DATA);
    });

  });

});
