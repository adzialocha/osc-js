import { expect } from 'chai'

import Message from '../src/message'
import AtomicFloat32 from '../src/atomic/float32'

/** @test {Message} */
describe('Message', () => {
  let message

  before(() => {
    message = new Message()
  })

  it('contains a set of osc message data', () => {
    expect(message.address).to.exist
    expect(message.types).to.exist
    expect(message.args).to.exist
  })

  it('fills the arguments and address during its construction', () => {
    const anotherMessage = new Message('somekind/of/path', 221.21, 317, 'test')

    expect(anotherMessage.address).to.be.equals('/somekind/of/path')
    expect(anotherMessage.args[0]).to.be.equals(221.21)
    expect(anotherMessage.types).to.be.equals('fis')
  })

  /** @test {Message#add} */
  describe('add', () => {

    let messageWithAtomicFloat32
    let messageWithoutAtomicFloat32

    before(() => {

      message = new Message()

      message.add('Hello World')
      message.add(121123)

      messageWithoutAtomicFloat32 = new Message()
      messageWithoutAtomicFloat32.add(0.0)
      messageWithoutAtomicFloat32.add(0.5)
      messageWithoutAtomicFloat32.add(1.0)
      messageWithoutAtomicFloat32.add(1.5)
      messageWithoutAtomicFloat32.add(2.0)

      messageWithAtomicFloat32 = new Message()
      messageWithAtomicFloat32.add(new AtomicFloat32(0.0))
      messageWithAtomicFloat32.add(new AtomicFloat32(0.5))
      messageWithAtomicFloat32.add(new AtomicFloat32(1.0))
      messageWithAtomicFloat32.add(new AtomicFloat32(1.5))
      messageWithAtomicFloat32.add(new AtomicFloat32(2.0))
    })

    it('pushes the values to our args array', () => {
      expect(message.args).to.deep.equal(['Hello World', 121123])
    })

    it('changes the types string accordingly', () => {
      expect(message.types).to.equal('si')
    })

    it('without AtomicFloat32 - unable to encode float32 with round values', () => {
      expect(messageWithoutAtomicFloat32.types).to.equal('ififi')
    })

    it('with AtomicFloat32 - able to encode float32 with round values', () => {
      expect(messageWithAtomicFloat32.types).to.equal('fffff')
    })
  })

  /** @test {Message#pack} */
  describe('pack', () => {
    let result

    before(() => {
      message = new Message()

      message.address = '/sssss/osc/sssssadss'
      message.add(12)
      message.add('Hello World')
      message.add(22111.344)
      message.add(new Uint8Array([100, 52]))

      result = message.pack()
    })

    it('returns an object we can unpack again', () => {
      const anotherMessage = new Message()
      anotherMessage.unpack(new DataView(result.buffer), 0)

      expect(anotherMessage.address).to.equal('/sssss/osc/sssssadss')
      expect(anotherMessage.args[3][0]).to.equal(100)
    })

    it('returns a multiple of 32', () => {
      expect((result.byteLength * 8) % 32).to.equal(0)
    })
  })

  /** @test {Message#unpack} */
  describe('unpack', () => {
    let result
    let anotherMessage

    const float32Array = new Float32Array([0.0, 0.5, 1.0, 1.5, 2.0])
    let messageWithFloat
    let resultWithFloat

    before(() => {
      anotherMessage = new Message()
      const data = new Uint8Array([
        47, 116, 101, 115, 116, 47, 112, 97,
        116, 104, 0, 0, 44, 105, 0, 0, 0, 0, 2, 141])
      const dataView = new DataView(data.buffer, 0)

      result = anotherMessage.unpack(dataView)

      messageWithFloat = new Message()

      messageWithFloat.address = '/test/path'
      messageWithFloat.add(new AtomicFloat32(0.0))
      messageWithFloat.add(new AtomicFloat32(0.5))
      messageWithFloat.add(new AtomicFloat32(1.0))
      messageWithFloat.add(new AtomicFloat32(1.5))
      messageWithFloat.add(new AtomicFloat32(2.0))

      resultWithFloat = new Message()
      resultWithFloat.unpack(new DataView(messageWithFloat.pack().buffer), 0)
    })

    it('decodes the message correctly', () => {
      expect(anotherMessage.address).to.equal('/test/path')
      expect(anotherMessage.args[0]).to.equal(653)
    })

    it('returns a number', () => {
      expect(result).to.be.a('number')
    })

    it('returns float values', () => {

      expect(Array.isArray(resultWithFloat.args))

      resultWithFloat.args.forEach((value, index) => {
        expect(value === float32Array[index])
      })
    })
  })
})
