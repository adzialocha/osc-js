import Bundle, { BUNDLE_TAG } from './bundle'
import Message from './message'
import AtomicString from './atomic/string'

/**
 * The unit of transmission of OSC is an OSC Packet. The contents
 * of an OSC packet must be either an OSC Message or an OSC Bundle.
 */
export default class Packet {
  /**
   * Create a Packet instance holding a Message or Bundle
   * @param {Message|Bundle} value Initial Packet value
   */
  constructor(value) {
    if (value && !(value instanceof Message || value instanceof Bundle)) {
      throw new Error('OSC Packet can only consist of Message or Bundle.')
    }

    /** @type {Message|Bundle} value */
    this.value = value
    /** @type {number} offset */
    this.offset = 0
  }

  /**
   * Packs the Packet value, this is more like a wrapper, you could also skip
   * the Packet and directly pack the Message or Bundle.
   * @return {Uint8Array} Packed binary data
   *
   * @example
   * const message = new Message('/test/path', 21.5, 'test')
   * const packet = new Packet(message)
   * const packetBinary = packet.pack() // then send it via udp etc.
   *
   * // or skip the Packet for convenience
   * const messageBinary = message.pack()
   */
  pack() {
    if (!this.value) {
      throw new Error('OSC Packet can not be encoded with empty body.')
    }

    return this.value.pack()
  }

  /**
   * Unpack binary data from DataView for Messages or Bundles
   * @param {DataView} dataView The DataView holding the binary representation of a Packet
   * @param {number} initialOffset Offset of DataView before unpacking
   * @param {AtomicTimetag} timetag Pass over a AtomicTimetag, this is needed to inherit
   * timetags from parent Bundles
   * @return {number} Offset after unpacking
   */
  unpack(dataView, initialOffset = 0, timetag) {
    if (!(dataView instanceof DataView)) {
      throw new Error('OSC Packet expects an instance of type DataView.')
    }

    if (dataView.byteLength % 4 !== 0) {
      throw new Error('OSC Packet byteLength has to be a multiple of four.')
    }

    const head = new AtomicString()
    head.unpack(dataView, initialOffset)

    let item

    // check if Packet is a Bundle or a Message
    if (head.value === BUNDLE_TAG) {
      item = new Bundle()
    } else {
      item = new Message()

      // inherit the AtomicTimetag from the parent bundle when passed over
      if (timetag) {
        item.timetag = timetag
      }
    }

    item.unpack(dataView, initialOffset)

    this.offset = item.offset
    this.value = item

    return this.offset
  }
}
