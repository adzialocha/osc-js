import { isFloat } from '../utils'

import Atomic from '../atomic'

export default class AtomicFloat64 extends Atomic {
  constructor(value) {
    if (value && !isFloat(value)) {
      throw new Error('OSC AtomicFloat64 constructor expects value of type float number.')
    }

    super(value)
  }

  pack() {
    return super.pack('setFloat64', 8)
  }

  unpack(dataView, offset) {
    return super.unpack(dataView, 'getFloat64', 8, offset)
  }
}
