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

  it('can be initialized with an address and argument array', () => {
    const anotherMessage = new TypedMessage('/a/path', [
      { type: 'i', value: 123 },
      { type: 'd', value: 123.123 },
      { type: 'h', value: BigInt('0xFFFFFF') },
      { type: 'T', value: null },
    ])
    expect(anotherMessage.types.length).to.equal(4)
    expect(anotherMessage.args.length).to.equal(3)
  })

  /** @test {TypedMessage#add} */
  describe('add', () => {
    before(() => {
      typedMessage = new TypedMessage()

      typedMessage.add('s', 'Hello World')
      typedMessage.add('i', 121123)
      typedMessage.add('d', 123.123456789)
      typedMessage.add('T')
      typedMessage.add('i', 10)
    })

    it('pushes the values to our args array', () => {
      expect(typedMessage.args).to.deep.equal(['Hello World', 121123, 123.123456789, 10])
    })

    it('adds to the types string accordingly', () => {
      expect(typedMessage.types).to.equal('sidTi')
    })
  })

  /** @test {TypedMessage#pack} */
  describe('pack', () => {
    let result

    before(() => {
      typedMessage = new TypedMessage('/test/types')

      typedMessage.add('i', 1)
      typedMessage.add('h', BigInt('0x7FFFFFFFFFFFFFFF'))
      typedMessage.add('t', BigInt('0xFFFFFFFFFFFFFFFF'))
      typedMessage.add('f', 123.123)
      typedMessage.add('d', 123.123456789)
      typedMessage.add('s', 'stringValue')
      typedMessage.add('b', new Uint8Array([100, 52]))
      typedMessage.add('T') // true
      typedMessage.add('F') // false
      typedMessage.add('N') // Nil
      typedMessage.add('I') // Infinitum

      result = typedMessage.pack()
    })

    it('returns an object we can unpack again', () => {
      const anotherMessage = new TypedMessage()
      anotherMessage.unpack(new DataView(result.buffer), 0)

      expect(anotherMessage.address).to.equal('/test/types')
      expect(anotherMessage.args.length).to.equal(7)
      expect(anotherMessage.args[0]).to.equal(1)
      // chai.expect cannot handle BigInt directly
      expect(anotherMessage.args[1] === BigInt('0x7FFFFFFFFFFFFFFF')).to.be.true
      expect(anotherMessage.args[2] === BigInt('0xFFFFFFFFFFFFFFFF')).to.be.true
      expect(anotherMessage.args[3]).to.be.closeTo(123.123, 0.00001)
      expect(anotherMessage.args[4]).to.be.closeTo(123.123456789, 0.00001)
      expect(anotherMessage.args[5]).to.equal('stringValue')
      expect(anotherMessage.args[6][0]).to.equal(100)

      expect(anotherMessage.types.length).to.equal(12)
      expect(anotherMessage.types).to.equal(',ihtfdsbTFNI')
    })

    it('returns a multiple of 32', () => {
      expect((result.byteLength * 8) % 32).to.equal(0)
    })
  })

  /** @test {TypedMessage#unpack} */
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
