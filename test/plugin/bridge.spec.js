import { expect } from 'chai'

import OSC from '../../src/osc'
import Message from '../../src/message'

import BridgePlugin from '../../src/plugin/bridge'
import DatagramPlugin from '../../src/plugin/dgram'
import WebsocketClientPlugin from '../../src/plugin/wsclient'

const wsPort = 9129
const udpPort = 9130

/** @test {BridgePlugin} */
describe('BridgePlugin', () => {
  let plugin
  let osc
  let oscWsClient
  let oscUdpClient

  before(() => {
    plugin = new BridgePlugin({
      wsServer: {
        port: wsPort,
      },
      udpServer: {
        host: '127.0.0.1',
        port: udpPort,
      },
    })

    osc = new OSC({
      plugin,
    })

    oscWsClient = new OSC({
      plugin: new WebsocketClientPlugin({
        port: wsPort,
      })
    })

    oscUdpClient = new OSC({
      plugin: new DatagramPlugin({
        send: {
          host: '127.0.0.1',
          port: udpPort,
        }
      })
    })
  })

  it('merges the given options correctly', () => {
    expect(plugin.options.wsServer.port).to.be.equals(wsPort)
    expect(plugin.options.udpServer.host).to.be.equals('127.0.0.1')
    expect(plugin.options.receiver).to.be.equals('ws')
  })

  describe('status', () => {
    it('returns the initial status', () => {
      expect(plugin.status()).to.be.equals(-1)
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
        family: 'ws',
        port: wsPort,
        size: 0,
      }

      osc.open()

      oscWsClient.open()
      oscUdpClient.open()

      oscUdpClient.on('/test/path', (message, rinfo) => {
        expect(message).to.deep.equal(expectedMessage)
        expect(rinfo).to.deep.equal(expectedRinfo)

        timer = null
        resolve()
      })

      oscWsClient.on('open', () => oscWsClient.send(new Message('/test/path', 122, 554)))

      timer = setTimeout(() => reject(new Error('Timeout')), 1000)
    }))
  })
})
