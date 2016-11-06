import { isFloat } from '../utils'

import OSCAtomic from '../atomic'

export default class OSCAtomicFloat64 extends OSCAtomic {
  constructor(value) {
    if (value && !isFloat(value)) {
      throw new Error('OSCAtomicFloat64 constructor expects value of type float number.')
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
