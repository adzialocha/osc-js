import { expect } from 'chai'

import OSCMessage from '../src/message'

describe('OSCMessage', () => {
  let message

  before(() => {
    message = new OSCMessage()
  })

  it('contains a set of OSC message data', () => {
    expect(message.address).to.exist
    expect(message.types).to.exist
    expect(message.args).to.exist
    expect(message.timetag).to.exist
  })

  it('fills the arguments and address during its construction', () => {
    const anotherMessage = new OSCMessage('somekind/of/path', 221.21, 317, 'test')

    expect(anotherMessage.address).to.be.equals('/somekind/of/path')
    expect(anotherMessage.args[0]).to.be.equals(221.21)
    expect(anotherMessage.types).to.be.equals('fis')
  })

  describe('add', () => {
    before(() => {
      message = new OSCMessage()

      message.add('Hello World')
      message.add(121123)
    })

    it('pushes the values to our args array', () => {
      expect(message.args).to.deep.equal(['Hello World', 121123])
    })

    it('changes the types string accordingly', () => {
      expect(message.types).to.equal('si')
    })
  })

  describe('encode', () => {
    let result

    before(() => {
      message = new OSCMessage()

      message.address = '/sssss//sssssadss'
      message.add(12)
      message.add('Hello World')
      message.add(22111.344)
      message.add(new Uint8Array([100, 52]))

      result = message.encode()
    })

    it('returns an object we can decode again', () => {
      const decoded = message.decode(new DataView(result.buffer))

      expect(decoded.address).to.equal('/sssss//sssssadss')
      expect(decoded.args[3][0]).to.equal(100)
    })

    it('returns a multiple of 32', () => {
      expect((result.byteLength * 8) % 32).to.equal(0)
    })
  })
})
