import OSCBundle, { BUNDLE_TAG } from './bundle'
import OSCMessage from './message'

import OSCAtomicString from './atomic/string'

export default class OSCPacket {
  encode(item) {
    if (!(item instanceof OSCMessage || item instanceof OSCBundle)) {
      throw new Error('OSCPacket can only consist of OSCMessage or OSCBundle.')
    }

    return item.encode()
  }

  decode(dataView, timetag) {
    if (dataView.byteLength % 4 !== 0) {
      throw new Error('OSCPacket byteLength has to be a multiple of four.')
    }

    const head = new OSCAtomicString()
    head.decode(dataView, 0)

    let item

    if (head.value === BUNDLE_TAG) {
      item = new OSCBundle()
    } else {
      item = new OSCMessage()
      if (timetag) {
        item.timetag = timetag
      }
    }

    item.decode(dataView)

    return item
  }
}
