import { isArray, isInt } from './common/utils'
import EncodeHelper from './common/helpers'

import Packet from './packet'
import Message from './message'
import AtomicString from './atomic/string'
import AtomicInt32 from './atomic/int32'
import AtomicTimetag from './atomic/timetag'

/** OSC Bundle string */
export const BUNDLE_TAG = '#bundle'

/**
 * An OSC Bundle consist of a Timetag and one or many Bundle Elements.
 * The elements are either OSC Messages or more OSC Bundles
 */
export default class Bundle {
  /**
   * Create a Bundle instance
   * @param {...*} [args] Timetag and elements. See examples for options
   *
   * @example
   * const bundle = new Bundle(new Date() + 500)
   *
   * @example
   * const message = new Message('/test/path', 51.2)
   * const anotherBundle = new Bundle([message], Date.now() + 1500)
   *
   * @example
   * const message = new Message('/test/path', 51.2)
   * const anotherMessage = new Message('/test/message', 'test', 12)
   * const anotherBundle = new Bundle(message, anotherMessage)
   */
  constructor(...args) {
    /**
     * @type {number} offset
     * @private
     */
    this.offset = 0
    /** @type {AtomicTimetag} timetag */
    this.timetag = new AtomicTimetag()
    /** @type {array} bundleElements */
    this.bundleElements = []

    if (args.length > 0) {
      // first argument is an Date or js timestamp (number)
      if (args[0] instanceof Date || isInt(args[0])) {
        this.timetag = new AtomicTimetag(args[0])
      } else if (isArray(args[0])) {
        // first argument is an Array of Bundle elements
        args[0].forEach((item) => {
          this.add(item)
        })

        // second argument is an Date or js timestamp (number)
        if (args.length > 1 && (args[1] instanceof Date || isInt(args[0]))) {
          this.timetag = new AtomicTimetag(args[1])
        }
      } else {
        // take all arguments as Bundle elements
        args.forEach((item) => {
          this.add(item)
        })
      }
    }
  }

  /**
   * Take a JavaScript timestamp to set the Bundle's timetag
   * @param {number} ms JS timestamp in milliseconds
   *
   * @example
   * const bundle = new Bundle()
   * bundle.timestamp(Date.now() + 5000) // in 5 seconds
   */
  timestamp(ms) {
    if (!isInt(ms)) {
      throw new Error('OSC Bundle needs an integer for setting the timestamp')
    }

    this.timetag = new AtomicTimetag(ms)
  }

  /**
   * Add a Message or Bundle to the list of elements
   * @param {Bundle|Message} item
   */
  add(item) {
    if (!(item instanceof Message || item instanceof Bundle)) {
      throw new Error('OSC Bundle contains only Messages and Bundles')
    }

    this.bundleElements.push(item)
  }

  /**
   * Interpret the Bundle as packed binary data
   * @return {Uint8Array} Packed binary data
   */
  pack() {
    const encoder = new EncodeHelper()

    // an OSC Bundle consists of the OSC-string "#bundle"
    encoder.add(new AtomicString(BUNDLE_TAG))

    // followed by an OSC Time Tag
    if (!this.timetag) {
      this.timetag = new AtomicTimetag()
    }

    encoder.add(this.timetag)

    // followed by zero or more OSC Bundle Elements
    this.bundleElements.forEach((item) => {
      encoder.add(new AtomicInt32(item.pack().byteLength))
      encoder.add(item)
    })

    return encoder.merge()
  }

  /**
   * Unpack binary data to read a Bundle
   * @param {DataView} dataView The DataView holding the binary representation of a Bundle
   * @param {number} [initialOffset=0] Offset of DataView before unpacking
   * @return {number} Offset after unpacking
   */
  unpack(dataView, initialOffset = 0) {
    if (!(dataView instanceof DataView)) {
      throw new Error('OSC Bundle expects an instance of type DataView')
    }

    // read the beginning bundle string
    const head = new AtomicString()
    head.unpack(dataView, initialOffset)

    if (head.value !== BUNDLE_TAG) {
      throw new Error('OSC Bundle does not contain a valid #bundle head')
    }

    // read the timetag
    const timetag = new AtomicTimetag()
    let offset = timetag.unpack(dataView, head.offset)

    // read the bundle elements
    this.bundleElements = []

    while (offset < dataView.byteLength) {
      const packet = new Packet()
      const size = new AtomicInt32()

      offset = size.unpack(dataView, offset)
      offset = packet.unpack(dataView, offset, this.timetag)

      this.bundleElements.push(packet.value)
    }

    this.offset = offset
    this.timetag = timetag

    return this.offset
  }
}
