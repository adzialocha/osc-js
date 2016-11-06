import { isInt } from '../utils'

import OSCAtomic from '../atomic'

export default class OSCAtomicInt32 extends OSCAtomic {
  constructor(value) {
    if (value && !isInt(value)) {
      throw new Error('OSCAtomicInt32 constructor expects value of type integer number.')
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
