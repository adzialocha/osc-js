import { expect } from 'chai'

import WebsocketPlugin from '../../src/plugin/websocket'

/** @test {WebsocketPlugin} */
describe('WebsocketPlugin', () => {
  let plugin

  before(() => {
    plugin = new WebsocketPlugin({
      udpServer: {
        port: 8129,
      },
      wsServer: {
        host: '127.0.0.1',
      },
    })
  })

  it('merges the given options correctly', () => {
    expect(plugin.options.udpServer.port).to.be.equals(8129)
    expect(plugin.options.wsServer.host).to.be.equals('127.0.0.1')
  })

  describe('status', () => {
    it('returns the initial status', () => {
      expect(plugin.status()).to.be.equals(-1)
    })
  })
})

