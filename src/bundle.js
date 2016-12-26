import { isArray, isInt } from './utils'

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
      } else if (isArray(args[0])) {
        args[0].forEach((item) => {
          this.add(item)
        })

        if (args.length > 1 && args[1] instanceof AtomicTimetag) {
          this.timetag = new AtomicTimetag(args[1])
        }
      } else {
        args.forEach((item) => {
          this.add(item)
        })
      }
    }
  }

  timestamp(ms) {
    if (!isInt(ms)) {
      throw new Error('OSC Bundle needs an Integer for setting its timestamp.')
    }

    this.timetag = new AtomicTimetag(ms)
  }

  add(item) {
    if (!(item instanceof Message || item instanceof Bundle)) {
      throw new Error('OSC Bundle contains only Messages and Bundles.')
    }

    this.bundleElements.push(item)
  }

  pack() {
    const encoder = new EncodeHelper()

    encoder.add(new AtomicString(BUNDLE_TAG))

    if (!this.timetag) {
      this.timetag = new AtomicTimetag()
    }

    encoder.add(this.timetag)

    this.bundleElements.forEach((item) => {
      encoder.add(new AtomicInt32(item.pack().byteLength))
      encoder.add(item)
    })

    return encoder.merge()
  }

  unpack(dataView, offset = 0) {
    const head = new AtomicString()
    head.unpack(dataView, offset)

    if (head.value !== BUNDLE_TAG) {
      throw new Error('OSC Bundle does not contain a valid #bundle head.')
    }

    const timetag = new AtomicTimetag()
    let end = timetag.unpack(dataView, head.offset)

    this.bundleElements = []

    while (end < dataView.byteLength) {
      const packet = new Packet()
      const size = new AtomicInt32()

      end = size.unpack(dataView, end)
      end = packet.unpack(dataView, end)

      this.bundleElements.push(packet.value)
    }

    this.offset = end
    this.timetag = timetag

    return this.offset
  }
}
