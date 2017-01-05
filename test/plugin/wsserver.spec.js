import { expect } from 'chai'

import WebsocketServerPlugin from '../../src/plugin/wsserver'

/** @test {WebsocketServerPlugin} */
describe('WebsocketServerPlugin', () => {
  let plugin

  before(() => {
    plugin = new WebsocketServerPlugin({
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

