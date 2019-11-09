import { expect } from 'chai'

import OSC from '../../src/osc'
import Message from '../../src/message'

import WebsocketClientPlugin from '../../src/plugin/wsclient'
import WebsocketServerPlugin from '../../src/plugin/wsserver'

/** @test {WebsocketClientPlugin} */
describe('WebsocketClientPlugin', () => {
  let plugin
  let osc
  let oscServer
  let oscBridge

  before(() => {
    plugin = new WebsocketClientPlugin({
      port: 8129,
      host: '127.0.0.1',
    })

    osc = new OSC({
      discardLateMessages: true,
      plugin,
    })

    oscServer = new OSC({
      discardLateMessages: true,
      plugin: new WebsocketServerPlugin({
        port: 8129,
        host: '127.0.0.1',
      }),
    })
  })

  it('merges the given options correctly', () => {
    expect(plugin.options.port).to.be.equals(8129)
    expect(plugin.options.host).to.be.equals('127.0.0.1')
    expect(plugin.options.secure).to.be.equals(false)
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

      oscServer.open()
      osc.open()

      oscServer.on('/test/path', (a, b) => {
        message = a
        rinfo = b

        expect(message).to.deep.equal(expectedMessage)
        expect(rinfo).to.deep.equal(expectedRinfo)

        resolve()
        resolved = true
      })

      osc.on('open', () => osc.send(new Message('/test/path', 122, 554)))

      setTimeout(() => !resolved && reject(new Error('Timeout')), 1000)
    }))
  })
})
