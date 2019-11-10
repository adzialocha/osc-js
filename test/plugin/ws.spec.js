import { expect } from 'chai'

import OSC from '../../src/osc'
import Message from '../../src/message'

import WebsocketClientPlugin from '../../src/plugin/wsclient'
import WebsocketServerPlugin from '../../src/plugin/wsserver'

/** @test {WebsocketClientPlugin} */
describe('WebsocketClient/ServerPlugin', () => {
  let plugin
  let osc
  let oscServer

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

  describe('remote address info', () => {
    it('returns the remote address info', () => new Promise((resolve, reject) => {

      let timer

      const expectedMessage = {
        offset: 24,
        address: '/test/path',
        types: ',ii',
        args: [122, 554]
      }

      const expectedRinfo = {
        address: '127.0.0.1',
        family: 'wsserver',
        port: 8129,
        size: 0,
      }

      oscServer.open()
      osc.open()

      oscServer.on('/test/path', (message, rinfo) => {
        expect(message).to.deep.equal(expectedMessage)
        expect(rinfo).to.deep.equal(expectedRinfo)

        timer = null
        resolve()
      })

      osc.on('open', () => osc.send(new Message('/test/path', 122, 554)))

      timer = setTimeout(() => reject(new Error('Timeout')), 1000)
    }))
  })
})
