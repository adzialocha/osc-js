import { isInt } from '../utils'

import Atomic from '../atomic'

export default class AtomicInt32 extends Atomic {
  constructor(value) {
    if (value && !isInt(value)) {
      throw new Error('OSC AtomicInt32 constructor expects value of type integer number.')
    }

    super(value)
  }

  pack() {
    return super.pack('setInt32', 4)
  }

  unpack(dataView, offset = 0) {
    return super.unpack(dataView, 'getInt32', 4, offset)
  }
}
