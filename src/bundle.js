import EncodeHelper from './helpers'

import Packet from './packet'
import Message from './message'
import AtomicString from './atomic/string'
import AtomicInt32 from './atomic/int32'
import AtomicTimetag from './atomic/timetag'

export const BUNDLE_TAG = '#bundle'

export default class Bundle {
  constructor(...args) {
    this.offset = 0
    this.timetag = new AtomicTimetag()
    this.bundleElements = []

    if (args.length > 0) {
      if (args[0] instanceof AtomicTimetag) {
        this.timetag = args.shift()
      } else {
        args.forEach((item) => {
          this.add(item)
        })
      }
    }
  }

  add(item) {
    if (!(item instanceof Message || item instanceof Bundle)) {
      throw new Error('OSC Bundle contains only Messages and Bundles')
    }

    this.bundleElements.push(item)
  }

  encode() {
    const encoder = new EncodeHelper()

    encoder.add(new AtomicString(BUNDLE_TAG))
    encoder.add(this.timetag)

    this.bundleElements.forEach((item) => {
      item.encode()

      encoder.add(new AtomicInt32(item.offset))
      encoder.add(item)
    })

    return encoder.merge()
  }

  decode(dataView, offset) {
    const head = new AtomicString()
    let end = head.decode(dataView, offset)

    if (head !== BUNDLE_TAG) {
      throw new Error('OSC Bundle does not contain a valid #bundle head.')
    }

    const timetag = new AtomicTimetag()
    end = timetag.decode(dataView, end)

    this.bundleElements = []

    for (let i = 0; i < dataView.byteLength; i += 1) {
      const packet = new Packet()
      const size = new AtomicInt32()

      end = size.decode(dataView, end)
      packet.decode(dataView, end)

      this.bundleElements.push(packet)
    }

    this.offset = end
    this.timetag = timetag

    return end
  }
}
