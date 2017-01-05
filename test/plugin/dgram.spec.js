import { expect } from 'chai'

import DatagramPlugin from '../../src/plugin/dgram'

/** @test {DatagramPlugin} */
describe('DatagramPlugin', () => {
  let plugin

  before(() => {
    plugin = new DatagramPlugin({
      send: {
        port: 8129,
      },
      open: {
        host: '127.0.0.1',
      },
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
})

