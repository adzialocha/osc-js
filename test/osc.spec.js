import { expect } from 'chai'

import OSC from '../src/osc'

/** @test {OSC} */
describe('OSC', () => {
  it('takes options as an argument', () => {
    const osc = new OSC({
      doublePrecisionFloats: true,
    })

    expect(osc.options.doublePrecisionFloats).to.be.true
  })

  describe('connection plugin API', () => {
    /** @test {OSC#on} */
    describe('on', () => {

    })

    /** @test {OSC#off} */
    describe('off', () => {

    })

    /** @test {OSC#open} */
    describe('open', () => {

    })

    /** @test {OSC#status} */
    describe('status', () => {

    })

    /** @test {OSC#close} */
    describe('close', () => {

    })

    /** @test {OSC#send} */
    describe('send', () => {

    })
  })
})
