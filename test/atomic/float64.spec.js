import { expect } from 'chai'
import OSCAtomicFloat64 from '../../src/atomic/float64'

describe('OSCAtomicFloat64', () => {
  const bitArray = { 0: 64, 1: 195, 2: 47, 3: 157, 4: 152, 5: 120, 6: 49, 7: 106 }
  let atomic

  before(() => {
    atomic = new OSCAtomicFloat64(9823.2312155)
  })

  describe('encode', () => {
    let result

    before(() => {
      result = atomic.encode()
    })

    it('returns correct bits', () => {
      expect(JSON.stringify(result)).to.equal(JSON.stringify(bitArray))
    })
  })

  describe('decode', () => {
    before(() => {
      const data = new Uint8Array(8)
      const dataView = new DataView(data.buffer)

      dataView.setFloat64(0, 1.254999123, false)

      atomic.decode(dataView, 0)
    })

    it('sets the offset to 8', () => {
      expect(atomic.offset).to.equal(8)
    })

    it('sets the value to a human readable float number', () => {
      expect(atomic.value).to.equal(1.254999123)
    })
  })
})
