import { isFloat } from '../utils'

import Atomic from '../atomic'

export default class AtomicFloat32 extends Atomic {
  constructor(value) {
    if (value && !isFloat(value)) {
      throw new Error('OSC AtomicFloat32 constructor expects value of type float number.')
    }

    super(value)
  }

  pack() {
    return super.pack('setFloat32', 4)
  }

  unpack(dataView, offset) {
    return super.unpack(dataView, 'getFloat32', 4, offset)
  }
}
