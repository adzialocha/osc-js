describe('OSCSocket', function() {

  var oscTest, oscSocket, binary;

  beforeEach(function() {
    binary = new Int8Array([ 47, 116, 101, 115, 116, 47, 112, 97, 0, 0, 0, 0, 44, 0, 0, 0 ]);
    oscTest = new OSC();
    oscSocket = new oscTest.__OSCSocket();
  });

  describe('#server', function() {

    describe('default state', function() {

      it('returns a IS_NOT_INITALIZED status', function() {
        expect(oscSocket.status()).toEqual(oscTest.SOCKET.IS_NOT_INITALIZED);
      });

      it('has a undefined socket', function() {
        expect(oscSocket._socket).toBeNull();
      });

    });

    describe('initalized state', function() {

      beforeEach(function() {
        oscSocket.connect('127.0.0.2', 3212);
        spyOn(oscTest.__OSCPacket.prototype, 'decode').and.callThrough();
      });

      it('does not return a IS_NOT_INITALIZED status', function() {
        expect(oscSocket.status()).not.toEqual(oscTest.SOCKET.IS_NOT_INITALIZED);
      });

      it('creates a websocket object', function() {
        expect(oscSocket._socket).toEqual(jasmine.any(Object));
      });

      it('sets the binary type to ArrayBuffer', function() {
        expect(oscSocket._socket.binaryType).toEqual('arraybuffer');
      });

      it('passes over the correct url and port', function() {
        expect(oscSocket._socket.URL).toEqual('ws://127.0.0.2:3212');
      });

      it('informs an OSCPacket object on a new packet', function() {
        oscSocket._socket.onmessage({ data: binary.buffer });
        expect(oscTest.__OSCPacket.prototype.decode).toHaveBeenCalled();
      });

    });

  });

  describe('#status', function() {

    it('returns an integer status code', function() {
      expect(oscSocket.status()).toEqual(jasmine.any(Number));
    });

  });

});
