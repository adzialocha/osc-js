import { expect } from 'chai'
import AtomicString from '../../src/atomic/string'

describe('AtomicString', () => {
  const bitArrayHello = [104, 97, 108, 108, 111, 0, 0, 0]
  let atomic

  before(() => {
    atomic = new AtomicString('hallo')
  })

  describe('decode', () => {
    before(() => {
      const data = new Uint8Array(bitArrayHello)
      const dataView = new DataView(data.buffer)

      atomic.decode(dataView, 0)
    })

    it('sets the offset to a multiple of 4', () => {
      expect(atomic.offset % 4).to.equal(0)
    })

    it('sets the value to a human readable string', () => {
      expect(atomic.value).to.equal('hallo')
    })
  })

  describe('encode', () => {
    it('returns correct bits', () => {
      expect(JSON.stringify(atomic.encode())).to.equal(
        JSON.stringify(new Int8Array(bitArrayHello))
      )
    })
  })
})
