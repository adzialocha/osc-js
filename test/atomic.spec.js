import { expect } from 'chai'

import Atomic from '../src/atomic'

import AtomicInt32 from '../src/atomic/int32'
import AtomicFloat32 from '../src/atomic/float32'
import AtomicString from '../src/atomic/string'
import AtomicBlob from '../src/atomic/blob'

import AtomicTimetag, {
  Timetag,
  SECONDS_70_YEARS,
} from '../src/atomic/timetag'

/** @test {Atomic} */
describe('Atomic', () => {
  let atomic
  let atomicChildren

  before(() => {
    atomic = new Atomic(2)

    atomicChildren = [
      new AtomicInt32(0),
      new AtomicInt32(123132132),
      new AtomicFloat32(1299389992.342243),
      new AtomicString('hello'),
      new AtomicString(''),
      new AtomicBlob(new Uint8Array([5, 4, 3, 2, 1])),
      new AtomicTimetag(new Timetag(SECONDS_70_YEARS + 123, 3312123)),
    ]
  })

  it('sets the given value on construction', () => {
    expect(atomic.value).to.equal(2)
  })

  it('sets an initial offset of zero', () => {
    expect(atomic.offset).to.be.equals(0)
  })

  /** @test {Atomic#unpack} */
  describe('unpack', () => {
    it('exists', () => {
      atomicChildren.forEach((atomicItem) => {
        expect(atomicItem).to.have.property('unpack')
      })
    })
  })

  describe('pack', () => {
    it('returns a multiple of 32', () => {
      atomicChildren.forEach((atomicItem) => {
        expect((atomicItem.pack().byteLength * 8) % 32).to.equal(0)
      })
    })

    it('returns an object of type Uint8Array', () => {
      atomicChildren.forEach((atomicItem) => {
        expect(atomicItem.pack()).to.be.a('uint8Array')
      })
    })
  })

  describe('value types', () => {
    it('able to create float32 with round values', () => {
      expect(() => new AtomicFloat32(0.0)).to.not.throw()
      expect(() => new AtomicFloat32(1.0)).to.not.throw()
      expect(() => new AtomicFloat32(2.0)).to.not.throw()
    })
  })
})
