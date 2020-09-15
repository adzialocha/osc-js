import { expect } from 'chai'

import Message, { TypedMessage } from '../src/message'

/** @test {TypedMessage} */
describe('TypedMessage', () => {
  let typedMessage

  before(() => {
    typedMessage = new TypedMessage()
  })

  it('contains a set of osc message data', () => {
    expect(typedMessage.address).to.exist
    expect(typedMessage.types).to.exist
    expect(typedMessage.args).to.exist
  })

  it('can be initialized with an address', () => {
    const anotherMessage = new TypedMessage('somekind/of/path')
    expect(anotherMessage.address).to.be.equals('/somekind/of/path')
  })

  /** @test {TypedMessage#add} */
  describe('add', () => {
    before(() => {
      typedMessage = new TypedMessage()

      typedMessage.add('s', 'Hello World')
      typedMessage.add('i', 121123)
      typedMessage.add('d', 123.123456789)
    })

    it('pushes the values to our args array', () => {
      expect(typedMessage.args).to.deep.equal(['Hello World', 121123, 123.123456789])
    })

    it('adds to the types string accordingly', () => {
      expect(typedMessage.types).to.equal('sid')
    })
  })

  /** @test {TypedMessage#pack} */
  describe('pack', () => {
    let result

    before(() => {
      typedMessage = new TypedMessage()

      typedMessage.address = '/sssss/osc/sssssadss'
      typedMessage.add('i', 12)
      typedMessage.add('s','Hello World')
      typedMessage.add('d', 22111.344)
      typedMessage.add('b', new Uint8Array([100, 52]))

      result = typedMessage.pack()
    })

    it('returns an object we can unpack again', () => {
      const anotherMessage = new TypedMessage()
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

    before(() => {
      anotherMessage = new TypedMessage()
      const data = new Uint8Array([47, 115, 111, 109, 101, 47, 97,
        100, 100, 114, 0, 0, 44, 100, 115, 105, 0, 0, 0, 0, 64, 94,
        199, 230, 183, 77, 206, 89, 116, 101, 115, 116,
        0, 0, 0, 0, 0, 0, 0, 0])
      const dataView = new DataView(data.buffer, 0)
      result = anotherMessage.unpack(dataView)
    })

    it('decodes the message correctly', () => {
      expect(anotherMessage.address).to.equal('/some/addr')
      expect(anotherMessage.args[1]).to.equal('test')
      expect(anotherMessage.args[2]).to.equal(0)
    })

    it('returns a number', () => {
      expect(result).to.be.a('number')
    })
  })
})

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
    before(() => {
      message = new Message()

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

    before(() => {
      anotherMessage = new Message()
      const data = new Uint8Array([
        47, 116, 101, 115, 116, 47, 112, 97,
        116, 104, 0, 0, 44, 105, 0, 0, 0, 0, 2, 141])
      const dataView = new DataView(data.buffer, 0)

      result = anotherMessage.unpack(dataView)
    })

    it('decodes the message correctly', () => {
      expect(anotherMessage.address).to.equal('/test/path')
      expect(anotherMessage.args[0]).to.equal(653)
    })

    it('returns a number', () => {
      expect(result).to.be.a('number')
    })
  })
})
