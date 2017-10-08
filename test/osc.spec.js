import chai, { expect } from 'chai'
import spies from 'chai-spies-next'

import OSC from '../src/osc'

import Packet from '../src/packet'
import Message from '../src/message'

chai.use(spies)

class TestPlugin {
  constructor() {
    this.socketStatus = -1
    this.notify = null
  }

  registerNotify(fn) {
    this.notify = fn
  }

  status() {
    return this.socketStatus
  }

  open() {
    this.socketStatus = 1
    this.notify('open')
  }

  send() {
    // unused
  }

  close() {
    this.socketStatus = 3
    this.notify('close')
  }

  // mocking helpers
  mockError() {
    this.notify('error', { message: 'An error' })
  }

  mockMessage() {
    this.notify(new Message(['test/path'], 55.1, 224))
  }
}

/** @test {OSC} */
describe('OSC', () => {
  let osc
  let plugin

  before(() => {
    plugin = new TestPlugin()
    osc = new OSC({
      discardLateMessages: true,
      plugin,
    })
  })

  it('returns the instance options when created', () => {
    expect(osc.options.discardLateMessages).to.be.true
  })

  /** @test {OSC#on} */
  describe('on', () => {
    it('calls my subscription when listening to the right address', () => {
      const spy = chai.spy()
      osc.on('/test/path', spy)

      plugin.mockMessage()

      expect(spy).to.have.been.called()
    })

    it('calls an error', () => {
      const spy = chai.spy()
      osc.on('error', spy)

      plugin.mockError()

      expect(spy).to.have.been.called()
    })
  })

  /** @test {OSC#off} */
  describe('off', () => {
    it('removes a subscription', () => {
      const spy = chai.spy()
      const id = osc.on('error', spy)

      osc.off('error', id)

      plugin.mockError()

      expect(spy).to.not.have.been.called()
    })
  })

  /** @test {OSC#status} */
  describe('status', () => {
    it('returns the initial status', () => {
      expect(osc.status()).to.be.equals(OSC.STATUS.IS_NOT_INITIALIZED)
    })
  })

  /** @test {OSC#open} */
  describe('open', () => {
    let spy

    beforeEach(() => {
      spy = chai.spy()
      osc.on('open', spy)
      osc.open()
    })

    it('returns the correct status', () => {
      expect(osc.status()).to.be.equals(OSC.STATUS.IS_OPEN)
    })

    it('calls the open event', () => {
      expect(spy).to.have.been.called()
    })
  })

  /** @test {OSC#close} */
  describe('close', () => {
    let spy

    beforeEach(() => {
      spy = chai.spy()
      osc.on('close', spy)
      osc.close()
    })

    it('returns the correct status', () => {
      expect(osc.status()).to.be.equals(OSC.STATUS.IS_CLOSED)
    })

    it('calls the close event', () => {
      expect(spy).to.have.been.called()
    })
  })

  /** @test {OSC#send} */
  describe('send', () => {
    it('passes over a binary object with configs to the plugin', () => {
      const message = new Message('/test/path', 122, 554)
      const packet = new Packet(message)
      const config = { host: 'localhost', port: 9001 }
      const spy = chai.spy.on(plugin, 'send')
      const binary = packet.pack()

      osc.send(packet, config)

      expect(binary).to.be.a('Uint8Array')
      expect(spy).to.have.been.called.with(binary, config)
    })
  })
})
