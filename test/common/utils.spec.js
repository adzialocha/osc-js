import { expect } from 'chai'

import { pad } from '../../src/common/utils'

/** @test {pad} */
describe('pad', () => {
  it('returns the next multiple of 4', () => {
    expect(pad(2)).to.be.equals(4)
    expect(pad(8)).to.be.equals(8)
    expect(pad(31)).to.be.equals(32)
    expect(pad(0)).to.be.equals(0)
  })
})
