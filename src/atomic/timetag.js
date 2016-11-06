import { isInt } from '../utils'

import OSCAtomic from '../atomic'

export const SECONDS_70_YEARS = 2208988800
export const TWO_POWER_32 = 4294967296

export class OSCTimetag {
  constructor(seconds = 0, fractions = 0) {
    if (!(isInt(seconds) && isInt(fractions))) {
      throw new Error('OSCTimetag constructor expects values of type integer number.')
    }

    this.seconds = seconds
    this.fractions = fractions
  }

  timestamp(milliseconds) {
    let seconds

    if (typeof milliseconds === 'number') {
      seconds = milliseconds / 1000
      const rounded = Math.floor(seconds)

      this.seconds = rounded + SECONDS_70_YEARS
      this.fractions = Math.round(TWO_POWER_32 * (seconds - rounded))

      return milliseconds
    }

    seconds = this.seconds - SECONDS_70_YEARS
    return (seconds + (this.fractions / TWO_POWER_32)) * 1000
  }
}

export default class OSCAtomicTimetag extends OSCAtomic {
  constructor(value) {
    if (value && !(value instanceof OSCTimetag)) {
      throw new Error('OSCAtomicTimetag constructor expects value of type OSCTimetag.')
    }

    super(value)
  }

  encode() {
    if (!this.value) {
      throw new Error('OSCAtomicTimetag can not be encoded with empty value.')
    }

    const { seconds, fractions } = this.value
    const data = new Uint8Array(8)
    const dataView = new DataView(data.buffer)

    dataView.setInt32(0, seconds, false)
    dataView.setInt32(4, fractions, false)

    return data
  }

  decode(dataView, offset) {
    const seconds = dataView.getUint32(offset, false)
    const fractions = dataView.getUint32(offset + 4, false)

    this.value = new OSCTimetag(seconds, fractions)
    this.offset += 8

    return this.offset
  }
}
