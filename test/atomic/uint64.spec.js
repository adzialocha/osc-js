import { expect } from 'chai'

import AtomicUInt64 from '../../src/atomic/uint64'

const MAX_UINT64 = BigInt('18446744073709551615')

/** @test {AtomicUInt64} */
describe('AtomicUInt64', () => {
  const bitArray = {
    0: 255, 1: 255, 2: 255, 3: 255, 4: 255, 5: 255, 6: 255, 7: 255,
  }

  let atomic

  before(() => {
    atomic = new AtomicUInt64(MAX_UINT64)
  })

  describe('bounds', () => {
    it('throws an error in constructor if out of bounds', () => {
      /* eslint-disable no-new */
      expect(() => { new AtomicUInt64(MAX_UINT64 + BigInt('1')) }).to.throw('OSC AtomicUInt64 value is out of bounds')
      expect(() => { new AtomicUInt64(BigInt('-1')) }).to.throw('OSC AtomicUInt64 value is out of bounds')
      /* eslint-enable no-new */
    })
  })

  /** @test {AtomicUInt64#pack} */
  describe('pack', () => {
    let result

    before(() => {
      result = atomic.pack()
    })

    it('returns correct bits', () => {
      expect(JSON.stringify(result)).to.equal(JSON.stringify(bitArray))
    })
  })

  /** @test {AtomicUInt64#unpack} */
  describe('unpack', () => {
    let returnValue

    before(() => {
      const data = new Uint8Array(8)
      const dataView = new DataView(data.buffer)

      dataView.setBigInt64(0, BigInt.asUintN(64, MAX_UINT64), false)

      returnValue = atomic.unpack(dataView, 0)
    })

    it('returns a number', () => {
      expect(returnValue).to.be.a('number')
    })

    it('sets the offset to 4', () => {
      expect(atomic.offset).to.equal(8)
    })

    it('sets the value to a human readable number', () => {
      const res = atomic.value === MAX_UINT64
      expect(res).to.be.true
    })
  })
})
