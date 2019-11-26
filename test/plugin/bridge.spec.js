import { expect } from 'chai'

import OSC from '../../src/osc'
import Message from '../../src/message'

import BridgePlugin from '../../src/plugin/bridge'
import DatagramPlugin from '../../src/plugin/dgram'
import WebsocketClientPlugin from '../../src/plugin/wsclient'

const PORT_WEBSOCKET = 9129
const PORT_UDP_SERVER = 9130
const PORT_UDP_CLIENT = 9131

/** @test {BridgePlugin} */
describe('BridgePlugin', () => {
  let plugin
  let osc
  let oscWsClient
  let oscUdpClient

  before(() => {
    plugin = new BridgePlugin({
      wsServer: {
        port: PORT_WEBSOCKET,
      },
      udpClient: {
        host: '127.0.0.1',
        port: PORT_UDP_CLIENT,
      },
      udpServer: {
        host: '127.0.0.1',
        port: PORT_UDP_SERVER,
      },
    })

    osc = new OSC({
      plugin,
    })

    oscWsClient = new OSC({
      plugin: new WebsocketClientPlugin({
        port: PORT_WEBSOCKET,
      }),
    })

    oscUdpClient = new OSC({
      plugin: new DatagramPlugin({
        open: {
          host: '127.0.0.1',
          port: PORT_UDP_CLIENT,
        },
      }),
    })
  })

  it('merges the given options correctly', () => {
    expect(plugin.options.wsServer.port).to.be.equals(PORT_WEBSOCKET)
    expect(plugin.options.udpServer.host).to.be.equals('127.0.0.1')
    expect(plugin.options.receiver).to.be.equals('ws')
  })

  describe('status', () => {
    it('returns the initial status', () => {
      expect(plugin.status()).to.be.equals(-1)
    })
  })

  describe('remote address info', () => {
    it('returns the remote address info', (done) => {
      const expectedMessage = {
        offset: 24,
        address: '/test/path',
        types: ',ii',
        args: [122, 554],
      }

      const expectedRinfo = {
        address: '127.0.0.1',
        family: 'IPv4',
        port: PORT_UDP_SERVER,
        size: 24,
      }

      oscUdpClient.on('/test/path', (message, rinfo) => {
        expect(message).to.deep.equal(expectedMessage)
        expect(rinfo).to.deep.equal(expectedRinfo)

        done()
      })

      oscWsClient.on('open', () => {
        oscWsClient.send(new Message('/test/path', 122, 554))
      })

      oscUdpClient.on('open', () => {
        oscWsClient.open()
      })

      osc.on('open', () => {
        oscUdpClient.open()
      })

      osc.open()
    })
  })
})
