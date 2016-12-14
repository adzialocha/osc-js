import { isString, isArray, isInt, isFloat, isBlob } from './utils'

import Helper, { typeChar, prepareAddress } from './helpers'

import AtomicInt32 from './atomic/int32'
import AtomicFloat32 from './atomic/float32'
import AtomicString from './atomic/string'
import AtomicBlob from './atomic/blob'

export default class Message {
  constructor(...args) {
    this.offset = 0
    this.address = ''
    this.types = ''
    this.args = []
    this.timetag = 0

    if (args.length > 0) {
      if (!(isString(args[0]) || isArray(args[0]))) {
        throw new Error('OSC Message constructor first argument (address) must be a string or array.')
      }

      this.address = prepareAddress(args.shift())
      this.types = args.map(item => typeChar(item)).join('')
      this.args = args
    }
  }

  add(value) {
    if (!value) {
      throw new Error('OSC Message expects a valid value for adding.')
    }

    this.args.push(value)
    this.types += typeChar(value)
  }

  encode() {
    if (this.address.length === 0 || this.address[0] !== '/') {
      throw new Error('OSC Message does not have a proper address.')
    }

    const encoder = new Helper()

    encoder.add(new AtomicString(this.address))
    encoder.add(new AtomicString(`,${this.types}`))

    if (this.args.length > 0) {
      let argument

      this.args.forEach((value) => {
        if (isInt(value)) {
          argument = new AtomicInt32(value)
        } else if (isFloat(value)) {
          argument = new AtomicFloat32(value)
        } else if (isString(value)) {
          argument = new AtomicString(value)
        } else if (isBlob(value)) {
          argument = new AtomicBlob(value)
        } else {
          throw new Error('OSC Message found unknown argument type.')
        }

        encoder.add(argument)
      })
    }

    this.offset = encoder.byteLength

    return encoder.merge()
  }

  decode(dataView) {
    const address = new AtomicString()
    address.decode(dataView, 0)

    const types = new AtomicString()
    types.decode(dataView, address.offset)

    if (address.value.length === 0 || address.value[0] !== '/') {
      throw new Error('OSC Message found malformed or missing address string.')
    }

    if (types.value.length === 0 && types.value[0] !== ',') {
      throw new Error('OSC Message found malformed or missing type string.')
    }

    let offset = types.offset
    let next
    let type

    const args = []

    for (let i = 1; i < types.value.length; i += 1) {
      type = types.value[i]

      if (type === 'i') {
        next = new AtomicInt32()
      } else if (type === 'f') {
        next = new AtomicFloat32()
      } else if (type === 's') {
        next = new AtomicString()
      } else if (type === 'b') {
        next = new AtomicBlob()
      } else {
        throw new Error('OSC Message found non-standard argument type.')
      }

      offset = next.decode(dataView, offset)
      args.push(next.value)
    }

    this.address = address.value
    this.types = types.value
    this.args = args

    return this
  }
}
