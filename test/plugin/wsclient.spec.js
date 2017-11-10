import { expect } from 'chai'

import WebsocketClientPlugin from '../../src/plugin/wsclient'

/** @test {WebsocketClientPlugin} */
describe('WebsocketClientPlugin', () => {
  let plugin

  before(() => {
    plugin = new WebsocketClientPlugin({
      port: 8129,
      host: '127.0.0.1',
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
})

