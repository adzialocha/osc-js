import Bundle, { BUNDLE_TAG } from './bundle'
import Message from './message'
import AtomicString from './atomic/string'

/**
 * The unit of transmission of OSC is an OSC Packet. The contents
 * of an OSC packet must be either an OSC Message or an OSC Bundle
 */
export default class Packet {
  /**
   * Create a Packet instance holding a Message or Bundle
   * @param {Message|Bundle} [value] Initial Packet value
   */
  constructor(value) {
    if (value && !(value instanceof Message || value instanceof Bundle)) {
      throw new Error('OSC Packet value has to be Message or Bundle')
    }

    /** @type {Message|Bundle} value */
    this.value = value
    /**
     * @type {number} offset
     * @private
     */
    this.offset = 0
  }

  /**
   * Packs the Packet value. This implementation is more like
   * a wrapper due to OSC specifications, you could also skip the
   * Packet and directly work with the Message or Bundle instance
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
      throw new Error('OSC Packet can not be encoded with empty body')
    }

    return this.value.pack()
  }

  /**
   * Unpack binary data from DataView to read Messages or Bundles
   * @param {DataView} dataView The DataView holding a binary representation of a Packet
   * @param {number} [initialOffset=0] Offset of DataView before unpacking
   * @return {number} Offset after unpacking
   */
  unpack(dataView, initialOffset = 0) {
    if (!(dataView instanceof DataView)) {
      throw new Error('OSC Packet expects an instance of type DataView')
    }

    if (dataView.byteLength % 4 !== 0) {
      throw new Error('OSC Packet byteLength has to be a multiple of four')
    }

    const head = new AtomicString()
    head.unpack(dataView, initialOffset)

    let item

    // check if Packet is a Bundle or a Message
    if (head.value === BUNDLE_TAG) {
      item = new Bundle()
    } else {
      item = new Message()
    }

    item.unpack(dataView, initialOffset)

    this.offset = item.offset
    this.value = item

    return this.offset
  }
}
