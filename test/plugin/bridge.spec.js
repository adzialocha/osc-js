import { expect } from 'chai'

import BridgePlugin from '../../src/plugin/bridge'

/** @test {BridgePlugin} */
describe('BridgePlugin', () => {
  let plugin

  before(() => {
    plugin = new BridgePlugin({
      wsServer: {
        port: 8129,
      },
      udpServer: {
        host: '127.0.0.1',
      },
    })
  })

  it('merges the given options correctly', () => {
    expect(plugin.options.wsServer.port).to.be.equals(8129)
    expect(plugin.options.udpServer.host).to.be.equals('127.0.0.1')
    expect(plugin.options.receiver).to.be.equals('ws')
  })

  describe('status', () => {
    it('returns the initial status', () => {
      expect(plugin.status()).to.be.equals(-1)
    })
  })
})

