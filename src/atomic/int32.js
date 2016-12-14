import { isInt } from '../utils'

import Atomic from '../atomic'

export default class AtomicInt32 extends Atomic {
  constructor(value) {
    if (value && !isInt(value)) {
      throw new Error('OSC AtomicInt32 constructor expects value of type integer number.')
    }

    super(value)
  }

  encode() {
    return super.encode('setInt32', 4)
  }

  decode(dataView, offset) {
    return super.decode(dataView, 'getInt32', 4, offset)
  }
}
