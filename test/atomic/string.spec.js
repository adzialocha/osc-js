import { expect } from 'chai'

import AtomicString from '../../src/atomic/string'

function generateLongString(length = 500000) {
  let str = ''

  for (let i = 0; i < length; i += 1) {
    str += 'a'
  }

  return str
}

/** @test {AtomicString} */
describe('AtomicString', () => {
  const bitArrayHello = [104, 97, 108, 108, 111, 0, 0, 0]

  let atomic

  before(() => {
    atomic = new AtomicString('hallo')
  })

  /** @test {AtomicString#unpack} */
  describe('unpack', () => {
    let returnValue

    before(() => {
      const data = new Uint8Array(bitArrayHello)
      const dataView = new DataView(data.buffer)

      returnValue = atomic.unpack(dataView, 0)
    })

    it('returns a number', () => {
      expect(returnValue).to.be.a('number')
    })

    it('sets the offset to a multiple of 4', () => {
      expect(atomic.offset % 4).to.equal(0)
    })

    it('sets the value to a human readable string', () => {
      expect(atomic.value).to.equal('hallo')
    })
  })

  /** @test {AtomicString#pack} */
  describe('pack', () => {
    it('returns correct bits', () => {
      expect(JSON.stringify(atomic.pack())).to.equal(
        JSON.stringify(new Int8Array(bitArrayHello))
      )
    })

    it('converts a long string without throwing RangeError', () => {
      const longString = generateLongString()
      const largeAtomic = new AtomicString(longString)
      const dataView = new DataView(largeAtomic.pack().buffer)

      expect(() => {
        largeAtomic.unpack(dataView, 0)
      }).to.not.throw(RangeError)
    })
  })
})
