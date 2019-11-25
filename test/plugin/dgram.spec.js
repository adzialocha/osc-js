import { expect } from 'chai'

import DatagramPlugin from '../../src/plugin/dgram'
import Message from '../../src/message'
import OSC from '../../src/osc'

const PORT_UDP = 8129

/** @test {DatagramPlugin} */
describe('DatagramPlugin', () => {
  let plugin
  let osc

  before(() => {
    plugin = new DatagramPlugin({
      send: {
        port: PORT_UDP,
      },
      open: {
        host: '127.0.0.1',
        port: PORT_UDP,
      },
    })

    osc = new OSC({
      discardLateMessages: true,
      plugin,
    })
  })

  it('merges the given options correctly', () => {
    expect(plugin.options.send.port).to.be.equals(PORT_UDP)
    expect(plugin.options.open.host).to.be.equals('127.0.0.1')
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
        port: PORT_UDP,
        size: 24,
      }

      osc.open()

      osc.on('/test/path', (message, rinfo) => {
        expect(message).to.deep.equal(expectedMessage)
        expect(rinfo).to.deep.equal(expectedRinfo)

        done()
      })

      osc.send(new Message('/test/path', 122, 554))
    })
  })
})
