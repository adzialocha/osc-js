import { expect } from 'chai'
import AtomicInt32 from '../../src/atomic/int32'

describe('AtomicInt32', () => {
  const bitArray = { 0: 0, 1: 0, 2: 0, 3: 42 }
  let atomic

  before(() => {
    atomic = new AtomicInt32(42)
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
      const data = new Uint8Array(4)
      const dataView = new DataView(data.buffer)

      dataView.setInt32(0, 214748364, false)

      atomic.decode(dataView, 0)
    })

    it('sets the offset to 4', () => {
      expect(atomic.offset).to.equal(4)
    })

    it('sets the value to a human readable number', () => {
      expect(atomic.value).to.equal(214748364)
    })
  })
})
