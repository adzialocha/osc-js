import { expect } from 'chai'

import EncodeHelper, { typeTag, prepareAddress } from '../../src/common/helpers'

import AtomicFloat32 from '../../src/atomic/float32'
import AtomicString from '../../src/atomic/string'

/** @test {typeTag} */
describe('typeTag', () => {
  it('returns the right OSC Type Tag characters', () => {
    expect(typeTag(2)).to.be.equals('i')
    expect(typeTag(2.2)).to.be.equals('f')
    expect(typeTag('joe')).to.be.equals('s')
    expect(typeTag(new Uint8Array([1, 2, 3]))).to.be.equals('b')
  })
})

/** @test {prepareAddress} */
describe('prepareAddress', () => {
  it('builds an valid  address from an array', () => {
    expect(prepareAddress(['hello', 'world'])).to.be.equals('/hello/world')
  })

  it('builds an valid  address from an invalid string', () => {
    expect(prepareAddress('hello/world')).to.be.equals('/hello/world')
  })

  it('removes the last slash', () => {
    expect(prepareAddress('/hello/world/')).to.be.equals('/hello/world')
  })
})

/** @test {EncodeHelper} */
describe('EncodeHelper', () => {
  let encoder

  before(() => {
    encoder = new EncodeHelper()
    encoder.add(new AtomicFloat32(24.12))
    encoder.add(new AtomicString('joe'))
  })

  it('adds items up and increases the byteLength accordingly', () => {
    expect(encoder.byteLength).to.be.equals(8)
    expect(encoder.data.length).to.be.equals(2)
  })

  it('merges the items to one Uint8Array', () => {
    const merged = encoder.merge()

    expect(merged.length).to.be.equals(8)
    expect(merged).to.be.a('uint8array')
  })
})
