import { expect } from 'chai'

import AtomicInt32 from '../../src/atomic/int32'

/** @test {AtomicInt32} */
describe('AtomicInt32', () => {
  const bitArray = {
    0: 0, 1: 0, 2: 0, 3: 42,
  }

  let atomic

  before(() => {
    atomic = new AtomicInt32(42)
  })

  /** @test {AtomicInt32#pack} */
  describe('pack', () => {
    let result

    before(() => {
      result = atomic.pack()
    })

    it('returns correct bits', () => {
      expect(JSON.stringify(result)).to.equal(JSON.stringify(bitArray))
    })
  })

  /** @test {AtomicInt32#unpack} */
  describe('unpack', () => {
    let returnValue

    before(() => {
      const data = new Uint8Array(4)
      const dataView = new DataView(data.buffer)

      dataView.setInt32(0, 214748364, false)

      returnValue = atomic.unpack(dataView, 0)
    })

    it('returns a number', () => {
      expect(returnValue).to.be.a('number')
    })

    it('sets the offset to 4', () => {
      expect(atomic.offset).to.equal(4)
    })

    it('sets the value to a human readable number', () => {
      expect(atomic.value).to.equal(214748364)
    })
  })
})
