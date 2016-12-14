import { expect } from 'chai'

import Bundle from '../src/bundle'
import Message from '../src/message'
import AtomicTimetag, { Timetag } from '../src/atomic/timetag'

describe('Bundle', () => {
  let bundle
  const timetag = new Timetag()

  before(() => {
    bundle = new Bundle()
    timetag.timestamp(1234)
  })

  it('contains a set of  bundle data', () => {
    expect(bundle.timetag).to.exist
  })

  describe('add', () => {
    before(() => {
      bundle = new Bundle()
      bundle.add(new Message('/foo/bar', 1, 2, 'ho'))
      bundle.add(new Message('/some/path', 42.1))
      bundle.add(new Bundle(new AtomicTimetag(timetag)))
    })

    it('contains three bundle elements', () => {
      expect(bundle.bundleElements.length).to.equals(3)
    })
  })

  describe('pack', () => {
    let result

    before(() => {
      bundle = new Bundle(new AtomicTimetag(timetag))
      result = bundle.pack()
    })

    it('returns a multiple of 32', () => {
      expect((result.byteLength * 8) % 32).to.equal(0)
    })
  })
})
