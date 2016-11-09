import { isFloat } from '../utils'

import OSCAtomic from '../atomic'

export default class OSCAtomicFloat32 extends OSCAtomic {
  constructor(value) {
    if (value && !isFloat(value)) {
      throw new Error('OSCAtomicFloat32 constructor expects value of type float number.')
    }

    super(value)
  }

  encode() {
    return super.encode('setFloat32', 4)
  }

  decode(dataView, offset) {
    return super.decode(dataView, 'getFloat32', 4, offset)
  }
}
