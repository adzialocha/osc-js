describe('OSCMessage', function() {

  var oscTest, oscMessage, binary;

  beforeEach(function() {

    /* data OSC message:

      /test/pa
      ,iifsf
      0: 7395
      1: 4864
      2: 5684.9150390625
      3: "teststring"
      4: 2100.76953125 */

    binary = new Int8Array([ 47, 116, 101, 115, 116, 47, 112, 97, 0, 0, 0, 0,
            44, 105, 105, 102, 115, 102, 0, 0, 0, 0, 28, -29,
            0, 0, 19, 0, 69, -79, -89, 82, 116, 101, 115, 116,
            115, 116, 114, 105, 110, 103, 0, 0, 69, 3, 76, 80 ]);

    oscTest = new OSC();
    oscMessage = new oscTest.__OSCMessage();
  });

  describe('#decode', function() {

    describe('without binary data', function() {

      it('holds default message data', function() {
        expect(oscMessage.addressString).toEqual('');
        expect(oscMessage.address).toEqual([]);
        expect(oscMessage.typesString).toEqual('');
        expect(oscMessage.args.length).toEqual(0);
      });

    });

    describe('with binary data', function() {

      beforeEach(function() {
        oscMessage.decode(binary.buffer);
      });

      it('reads a binary osc message', function() {
        expect(oscMessage.addressString).toEqual('/test/pa');
        expect(oscMessage.address).toEqual(['test', 'pa']);
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

    // @TODO

  });

  describe('#toJSON', function() {

    beforeEach(function() {
      oscMessage.decode(binary.buffer);
    });

    it('returns it as an json', function() {
      var json = oscMessage.toJSON();
      expect(json).toEqual(jasmine.any(Object));
      expect(json).toEqual({
        address : [ 'test', 'pa' ],
        addressString : '/test/pa',
        types : 'iifsf',
        arguments : [ 7395, 4864, 5684.9150390625, 'teststring', 2100.76953125 ]
      });
    });

  });

});
