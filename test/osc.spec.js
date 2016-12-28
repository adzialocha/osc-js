import { expect } from 'chai'

import OSC, { option } from '../src/osc'

/** @test {option} */
describe('option', () => {
  it('returns the default options when no osc instance is given', () => {
    expect(option('doublePrecisionFloats')).to.be.false
  })

  it('returns the instance options when created', () => {
    const osc = new OSC({ doublePrecisionFloats: true })

    expect(option('doublePrecisionFloats')).to.be.true
    expect(osc).to.exist
  })
})

/** @test {OSC} */
describe('OSC', () => {
  it('takes options as an argument', () => {
    const osc = new OSC({
      doublePrecisionFloats: true,
    })

    expect(osc.options.doublePrecisionFloats).to.be.true
  })

  it('is a singleton', () => {
    expect(new OSC() === new OSC()).to.be.true
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
