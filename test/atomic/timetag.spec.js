import { expect } from 'chai'

import OSCAtomicTimetag, {
  OSCTimetag,
  SECONDS_70_YEARS,
} from '../../src/atomic/timetag'

describe('OSCTimetag', () => {
  let timetag

  before(() => {
    timetag = new OSCTimetag(SECONDS_70_YEARS + 1234, 0)
  })

  it('sets the values correctly on initialization', () => {
    expect(timetag.seconds).to.be.equals(SECONDS_70_YEARS + 1234)
    expect(timetag.fractions).to.be.equals(0)
  })

  describe('getting via timestamp', () => {
    it('converts correctly to js timestamps', () => {
      expect(timetag.timestamp()).to.be.equals(1234 * 1000)
    })
  })

  describe('setting via timestamp', () => {
    before(() => {
      timetag.timestamp(1)
    })

    it('converts correctly to NTP timestamps', () => {
      expect(timetag.seconds).to.be.equals(SECONDS_70_YEARS)
      expect(timetag.fractions).to.be.equals(4294967)
    })
  })
})

describe('OSCAtomicTimetag', () => {
  const bitArray = { 0: 0, 1: 1, 2: 248, 3: 99, 4: 0, 5: 4, 6: 84, 7: 63 }
  let atomic

  before(() => {
    atomic = new OSCAtomicTimetag(new OSCTimetag(129123, 283711))
  })

  describe('encode', () => {
    let result

    before(() => {
      result = atomic.encode()
    })

    it('returns correct bits', () => {
      expect(JSON.stringify(result)).to.equal(JSON.stringify(bitArray))
    })

    it('consists of 64 bits', () => {
      expect(result.byteLength * 8).to.equal(64)
    })
  })

  describe('decode', () => {
    before(() => {
      const data = new Uint8Array([1, 1, 1, 0, 0, 0, 1, 0])
      const dataView = new DataView(data.buffer)

      atomic.decode(dataView, 0)
    })

    it('sets the offset to 8', () => {
      expect(atomic.offset).to.equal(8)
    })

    it('sets the correct NTP values', () => {
      expect(atomic.value.seconds).to.equal(16843008)
      expect(atomic.value.fractions).to.equal(256)
    })
  })
})
