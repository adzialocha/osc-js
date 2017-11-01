import { expect } from 'chai'

import AtomicTimetag, {
  Timetag,
  SECONDS_70_YEARS,
} from '../../src/atomic/timetag'

/** @test {Timetag} */
describe('Timetag', () => {
  let timetag
  let anotherTimetag

  before(() => {
    timetag = new Timetag(SECONDS_70_YEARS + 1234, 0)
    anotherTimetag = new Timetag(3718482449, 131799040)
  })

  it('sets the values correctly on initialization', () => {
    expect(timetag.seconds).to.be.equals(SECONDS_70_YEARS + 1234)
    expect(timetag.fractions).to.be.equals(0)
  })

  /** @test {Timetag#timestamp} */
  describe('timestamp', () => {
    it('converts correctly to js timestamps', () => {
      expect(timetag.timestamp()).to.be.equals(1234 * 1000)
      expect(anotherTimetag.timestamp()).to.be.equals(1509493649000)
    })

    it('converts correctly to NTP timestamps', () => {
      timetag.timestamp(1)

      expect(timetag.seconds).to.be.equals(SECONDS_70_YEARS)
      expect(timetag.fractions).to.be.equals(4294967)
    })
  })
})

/** @test {AtomicTimetag} */
describe('AtomicTimetag', () => {
  const bitArray = {
    0: 0, 1: 1, 2: 248, 3: 99, 4: 0, 5: 4, 6: 84, 7: 63,
  }

  let atomic

  before(() => {
    atomic = new AtomicTimetag(new Timetag(129123, 283711))
  })

  /** @test {AtomicTimetag#pack} */
  describe('pack', () => {
    let result

    before(() => {
      result = atomic.pack()
    })

    it('returns correct bits', () => {
      expect(JSON.stringify(result)).to.equal(JSON.stringify(bitArray))
    })

    it('consists of 64 bits', () => {
      expect(result.byteLength * 8).to.equal(64)
    })
  })

  /** @test {AtomicTimetag#unpack} */
  describe('unpack', () => {
    let returnValue

    before(() => {
      const data = new Uint8Array([1, 1, 1, 0, 0, 0, 1, 0])
      const dataView = new DataView(data.buffer)

      returnValue = atomic.unpack(dataView, 0)
    })

    it('returns a number', () => {
      expect(returnValue).to.be.a('number')
    })

    it('sets the offset to 8', () => {
      expect(atomic.offset).to.equal(8)
    })

    it('sets the correct NTP values', () => {
      expect(atomic.value.seconds).to.equal(16843008)
      expect(atomic.value.fractions).to.equal(256)
    })
  })

  describe('constructor', () => {
    it('with an integer timestamp', () => {
      atomic = new AtomicTimetag(5000)
      expect(atomic.value.seconds).to.equal(2208988805)
    })

    it('with a Date instance', () => {
      const date = new Date(2015, 2, 21, 5, 0, 21)
      date.setUTCHours(4)
      atomic = new AtomicTimetag(date)
      expect(atomic.value.seconds).to.equal(3635899221)
    })
  })
})
