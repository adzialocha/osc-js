import { expect } from 'chai'

import AtomicFloat64 from '../../src/atomic/float64'

/** @test {AtomicFloat64} */
describe('AtomicFloat64', () => {
  const bitArray = { 0: 64, 1: 195, 2: 47, 3: 157, 4: 152, 5: 120, 6: 49, 7: 106 }
  let atomic

  before(() => {
    atomic = new AtomicFloat64(9823.2312155)
  })

  /** @test {AtomicFloat64#pack} */
  describe('pack', () => {
    let result

    before(() => {
      result = atomic.pack()
    })

    it('returns correct bits', () => {
      expect(JSON.stringify(result)).to.equal(JSON.stringify(bitArray))
    })
  })

  /** @test {AtomicFloat64#unpack} */
  describe('unpack', () => {
    let returnValue

    before(() => {
      const data = new Uint8Array(8)
      const dataView = new DataView(data.buffer)

      dataView.setFloat64(0, 14232.9471832894, false)

      returnValue = atomic.unpack(dataView, 0)
    })

    it('returns a number', () => {
      expect(returnValue).to.be.a('number')
    })

    it('sets the offset to 8', () => {
      expect(atomic.offset).to.equal(8)
    })

    it('sets the value to a human readable float number', () => {
      expect(atomic.value).to.equal(14232.9471832894)
    })
  })
})
