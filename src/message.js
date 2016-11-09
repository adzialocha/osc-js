import { isString, isArray, isInt, isFloat, isBlob } from './utils'

import EncodeHelper, { typeChar, prepareAddress } from './helpers'

import OSCAtomicInt32 from './atomic/int32'
import OSCAtomicFloat32 from './atomic/float32'
import OSCAtomicString from './atomic/string'
import OSCAtomicBlob from './atomic/blob'

export default class OSCMessage {
  constructor(...args) {
    this.address = ''
    this.types = ''
    this.args = []
    this.timetag = 0

    if (args.length > 0) {
      if (!(isString(args[0]) || isArray(args[0]))) {
        throw new Error('OSCMessage constructor first argument (address) must be a string or array.')
      }

      this.address = prepareAddress(args.shift())
      this.types = args.map(item => typeChar(item)).join('')
      this.args = args
    }
  }

  add(value) {
    if (!value) {
      throw new Error('OSCMessage expects a valid value for adding.')
    }

    this.args.push(value)
    this.types += typeChar(value)
  }

  encode() {
    if (this.address.length === 0 || this.address[0] !== '/') {
      throw new Error('OSCMessage does not have a proper address.')
    }

    const encoder = new EncodeHelper()

    encoder.add(new OSCAtomicString(this.address))
    encoder.add(new OSCAtomicString(`,${this.types}`))

    if (this.args.length > 0) {
      let argument

      this.args.forEach((value) => {
        if (isInt(value)) {
          argument = new OSCAtomicInt32(value)
        } else if (isFloat(value)) {
          argument = new OSCAtomicFloat32(value)
        } else if (isString(value)) {
          argument = new OSCAtomicString(value)
        } else if (isBlob(value)) {
          argument = new OSCAtomicBlob(value)
        } else {
          throw new Error('OSCMessage found unknown argument type.')
        }

        encoder.add(argument)
      })
    }

    return encoder.merge()
  }

  decode(dataView) {
    const address = new OSCAtomicString()
    address.decode(dataView, 0)

    const types = new OSCAtomicString()
    types.decode(dataView, address.offset)

    if (address.value.length === 0 || address.value[0] !== '/') {
      throw new Error('OSCMessage found malformed or missing OSC address string.')
    }

    if (types.value.length === 0 && types.value[0] !== ',') {
      throw new Error('OSCMessage found malformed or missing OSC type string.')
    }

    let offset = types.offset
    let next
    let type

    const args = []

    for (let i = 1; i < types.value.length; i += 1) {
      type = types.value[i]

      if (type === 'i') {
        next = new OSCAtomicInt32()
      } else if (type === 'f') {
        next = new OSCAtomicFloat32()
      } else if (type === 's') {
        next = new OSCAtomicString()
      } else if (type === 'b') {
        next = new OSCAtomicBlob()
      } else {
        throw new Error('OSCMessage found non-standard argument type.')
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
