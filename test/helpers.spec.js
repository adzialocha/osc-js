import { expect } from 'chai'

import EncodeHelper, { typeChar, prepareAddress } from '../src/helpers'

import AtomicFloat64 from '../src/atomic/float64'
import AtomicString from '../src/atomic/string'

describe('typeChar', () => {
  it('returns the right  type characters', () => {
    expect(typeChar(2)).to.be.equals('i')
    expect(typeChar(2.2)).to.be.equals('f')
    expect(typeChar('joe')).to.be.equals('s')
    expect(typeChar(new Uint8Array([1, 2, 3]))).to.be.equals('b')
  })
})

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

describe('EncodeHelper', () => {
  let encoder

  before(() => {
    encoder = new EncodeHelper()
    encoder.add(new AtomicFloat64(24.12))
    encoder.add(new AtomicString('joe'))
  })

  it('adds items up and increases the byteLength accordingly', () => {
    expect(encoder.byteLength).to.be.equals(12)
    expect(encoder.data.length).to.be.equals(2)
  })

  it('merges the items to one Uint8Array', () => {
    const merged = encoder.merge()

    expect(merged.length).to.be.equals(12)
    expect(merged).to.be.a('uint8array')
  })
})
