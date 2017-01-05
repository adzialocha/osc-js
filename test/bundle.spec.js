import { expect } from 'chai'

import Bundle from '../src/bundle'
import Message from '../src/message'

/** @test {Bundle} */
describe('Bundle', () => {
  let bundle

  it('contains a set of osc bundle data', () => {
    bundle = new Bundle()
    expect(bundle.timetag).to.exist
  })

  describe('add', () => {
    before(() => {
      const message = new Message('/foo/bar', 1, 2, 'ho')

      bundle = new Bundle([message])
      bundle.add(new Message('/some/path', 42.1))
      bundle.add(new Bundle(Date.now() + 500))
    })

    it('contains 3 bundle elements', () => {
      expect(bundle.bundleElements.length).to.equals(3)
    })
  })

  describe('pack', () => {
    let result

    before(() => {
      bundle = new Bundle([new Message('/super/path', 12)])
      result = bundle.pack()
    })

    it('returns a multiple of 32', () => {
      expect((result.byteLength * 8) % 32).to.equal(0)
    })

    it('can be unpacked again', () => {
      const anotherBundle = new Bundle()
      anotherBundle.unpack(new DataView(result.buffer), 0)

      expect(anotherBundle.bundleElements[0].address).to.equal('/super/path')
      expect(anotherBundle.bundleElements[0].args[0]).to.equal(12)
    })
  })

  describe('unpack', () => {
    let result

    before(() => {
      const data = new Uint8Array([35, 98, 117, 110, 100, 108, 101, 0, 220, 10,
        223, 251, 100, 221, 48, 0, 0, 0, 0, 20, 47, 116, 101, 115, 116, 47, 112,
        97, 116, 104, 0, 0, 44, 102, 0, 0, 66, 76, 204, 205])
      const dataView = new DataView(data.buffer)

      bundle = new Bundle()
      result = bundle.unpack(dataView, 0)
    })

    it('decodes the correct timetag', () => {
      expect(bundle.timetag.value.seconds).to.equal(3691700219)
    })

    it('returns a number', () => {
      expect(result).to.be.a('number')
    })
  })

  describe('timestamp', () => {
    before(() => {
      bundle = new Bundle()
      bundle.timestamp(1234)
    })

    it('sets the timetag', () => {
      expect(bundle.timetag.value.seconds).to.equal(2208988801)
    })
  })
})
