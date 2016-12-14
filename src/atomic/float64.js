import { isFloat } from '../utils'

import Atomic from '../atomic'

export default class AtomicFloat64 extends Atomic {
  constructor(value) {
    if (value && !isFloat(value)) {
      throw new Error('OSC AtomicFloat64 constructor expects value of type float number.')
    }

    super(value)
  }

  encode() {
    return super.encode('setFloat64', 8)
  }

  decode(dataView, offset) {
    return super.decode(dataView, 'getFloat64', 8, offset)
  }
}
