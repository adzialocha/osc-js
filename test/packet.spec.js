import { expect } from 'chai'

import Packet from '../src/packet'
import Message from '../src/message'

/** @test {Packet} */
describe('Packet', () => {
  let packet

  /** @test {Packet#pack} */
  describe('pack', () => {
    let result

    before(() => {
      packet = new Packet(new Message('/test/path', 21))
      result = packet.pack()
    })

    it('returns an object we can unpack again', () => {
      const anotherPacket = new Packet()
      anotherPacket.unpack(new DataView(result.buffer), 0)

      expect(anotherPacket.value.address).to.equal('/test/path')
      expect(anotherPacket.value.args[0]).to.equal(21)
    })

    it('returns a multiple of 32', () => {
      expect((result.byteLength * 8) % 32).to.equal(0)
    })
  })

  /** @test {Packet#unpack} */
  describe('unpack', () => {
    let result

    before(() => {
      const data = new Uint8Array([
        47, 116, 101, 115, 116, 47, 112, 97,
        116, 104, 0, 0, 44, 105, 0, 0, 0, 0, 2, 141])
      const dataView = new DataView(data.buffer, 0)

      packet = new Packet()
      result = packet.unpack(dataView)
    })

    it('decodes the message correctly', () => {
      expect(packet.value.address).to.equal('/test/path')
      expect(packet.value.args[0]).to.equal(653)
    })

    it('returns the offset of the data', () => {
      expect(result).to.equal(20)
    })

    it('returns a number', () => {
      expect(result).to.be.a('number')
    })
  })
})
