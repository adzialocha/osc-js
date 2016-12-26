import { expect } from 'chai'
import AtomicString from '../../src/atomic/string'

describe('AtomicString', () => {
  const bitArrayHello = [104, 97, 108, 108, 111, 0, 0, 0]
  let atomic

  before(() => {
    atomic = new AtomicString('hallo')
  })

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

  describe('pack', () => {
    it('returns correct bits', () => {
      expect(JSON.stringify(atomic.pack())).to.equal(
        JSON.stringify(new Int8Array(bitArrayHello))
      )
    })
  })
})
