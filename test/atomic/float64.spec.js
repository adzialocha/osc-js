import { expect } from 'chai'
import AtomicFloat32 from '../../src/atomic/float32'

describe('AtomicFloat32', () => {
  const bitArray = { 0: 70, 1: 25, 2: 124, 3: 237 }
  let atomic

  before(() => {
    atomic = new AtomicFloat32(9823.2312155)
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

      dataView.setFloat32(0, 1.254999123, false)

      atomic.decode(dataView, 0)
    })

    it('sets the offset to 4', () => {
      expect(atomic.offset).to.equal(4)
    })

    it('sets the value to a human readable float number', () => {
      expect(atomic.value).to.equal(Math.fround(1.254999123))
    })
  })
})
