import { expect } from 'chai'

import OSC from '../../src/osc'
import Message from '../../src/message'

import DatagramPlugin from '../../src/plugin/dgram'

/** @test {DatagramPlugin} */
describe('DatagramPlugin', () => {
  let plugin
  let osc

  before(() => {
    plugin = new DatagramPlugin({
      send: {
        port: 8129,
      },
      open: {
        host: '127.0.0.1',
        port: 8129,
      },
    })

    osc = new OSC({
      discardLateMessages: true,
      plugin,
    })
  })

  it('merges the given options correctly', () => {
    expect(plugin.options.send.port).to.be.equals(8129)
    expect(plugin.options.open.host).to.be.equals('127.0.0.1')
  })

  describe('status', () => {
    it('returns the initial status', () => {
      expect(plugin.status()).to.be.equals(-1)
    })
  })

  describe('remote address info', () => {
    it('returns the remote address info', () => new Promise((resolve, reject) => {

      let message
      let rinfo
      let resolved = false

      const expectedMessage = {
        offset: 24,
        address: '/test/path',
        types: ',ii',
        args: [ 122, 554 ]
      }

      const expectedRinfo = {
        address: '127.0.0.1',
        family: 'IPv4',
        port: 8129,
        size: 24,
      }

      osc.open()
      osc.on('/test/path', (a, b) => {
        message = a
        rinfo = b

        expect(message).to.deep.equal(expectedMessage)
        expect(rinfo).to.deep.equal(expectedRinfo)

        resolve()
        resolved = true
      })

      osc.send(new Message('/test/path', 122, 554))

      setTimeout(() => !resolved && reject(new Error('Timeout')), 1000)
    }))
  })
})
