import { expect } from 'chai'

import OSCAtomic from '../src/atomic'

import OSCAtomicInt32 from '../src/atomic/int32'
import OSCAtomicFloat32 from '../src/atomic/float32'
import OSCAtomicString from '../src/atomic/string'
import OSCAtomicBlob from '../src/atomic/blob'

import OSCAtomicTimetag, {
  OSCTimetag,
  SECONDS_70_YEARS,
} from '../src/atomic/timetag'

describe('OSCAtomic', () => {
  let atomic
  let atomicChildren

  before(() => {
    atomic = new OSCAtomic(2)

    atomicChildren = [
      new OSCAtomicInt32(123132132),
      new OSCAtomicFloat32(1299389992.342243),
      new OSCAtomicString('hello'),
      new OSCAtomicBlob(new Uint8Array([5, 4, 3, 2, 1])),
      new OSCAtomicTimetag(new OSCTimetag(SECONDS_70_YEARS + 123, 3312123)),
    ]
  })

  it('sets the given value on construction', () => {
    expect(atomic.value).to.equal(2)
  })

  it('sets an initial offset of zero', () => {
    expect(atomic.offset).to.be.equals(0)
  })

  describe('decode', () => {
    it('exists', () => {
      atomicChildren.forEach((atomicItem) => {
        expect(atomicItem).to.have.property('decode')
      })
    })
  })

  describe('encode', () => {
    it('returns a multiple of 32', () => {
      atomicChildren.forEach((atomicItem) => {
        expect((atomicItem.encode().byteLength * 8) % 32).to.equal(0)
      })
    })

    it('returns an object of type Uint8Array', () => {
      atomicChildren.forEach((atomicItem) => {
        expect(atomicItem.encode()).to.be.a('uint8Array')
      })
    })
  })
})
