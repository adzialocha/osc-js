import { isArray, isInt, isFloat, isString, isBlob } from './utils'

export function typeChar(item) {
  if (isInt(item)) {
    return 'i'
  } else if (isFloat(item)) {
    return 'f'
  } else if (isString(item)) {
    return 's'
  } else if (isBlob(item)) {
    return 'b'
  }

  throw new Error('OSC Message found unknown value type.')
}

export function prepareAddress(obj) {
  let address = ''

  if (isArray(obj)) {
    return `/${obj.join('/')}`
  } else if (isString(obj)) {
    address = obj
    if (address.length > 1 && address[address.length - 1] === '/') {
      address = address.slice(0, address.length - 1)
    }
    if (address.length > 1 && address[0] !== '/') {
      address = `/${address}`
    }
    return address
  }

  throw new Error('OSC Helpers can only prepare addresses which are Array of String.')
}

export default class Helper {
  constructor() {
    this.data = []
    this.byteLength = 0
  }

  add(item) {
    const buffer = item.encode()
    this.byteLength += buffer.byteLength
    this.data.push(buffer)
    return this
  }

  merge() {
    const result = new Uint8Array(this.byteLength)
    let offset = 0

    this.data.forEach((data) => {
      result.set(data, offset)
      offset += data.byteLength
    })

    return result
  }
}
