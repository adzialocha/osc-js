import {
  isArray,
  isBlob,
  isBoolean,
  isFloat,
  isInfinity,
  isInt,
  isNull,
  isString,
} from './utils'

/**
 * Checks type of given object and returns the regarding OSC
 * Type tag character
 * @param {*} item Any object
 * @return {string} OSC Type tag character
 */
export function typeTag(item) {
  if (isInt(item)) {
    return 'i'
  } else if (isFloat(item)) {
    return 'f'
  } else if (isString(item)) {
    return 's'
  } else if (isBlob(item)) {
    return 'b'
  } else if (isBoolean(item)) {
    return item ? 'T' : 'F'
  } else if (isNull(item)) {
    return 'N'
  } else if (isInfinity(item)) {
    return 'I'
  }

  throw new Error('OSC typeTag() found unknown value type')
}

/**
 * Sanitizes an OSC-ready Address Pattern
 * @param {string[]|string} obj Address as string or array of strings
 * @return {string} Corrected address string
 *
 * @example
 * // all calls return '/test/path' string:
 * prepareAddress('test/path')
 * prepareAddress('/test/path/')
 * prepareAddress([test, path])
 */
export function prepareAddress(obj) {
  let address = ''

  if (isArray(obj)) {
    return `/${obj.join('/')}`
  } else if (isString(obj)) {
    address = obj

    // remove slash at ending of address
    if (address.length > 1 && address[address.length - 1] === '/') {
      address = address.slice(0, address.length - 1)
    }

    // add slash at beginning of address
    if (address.length > 1 && address[0] !== '/') {
      address = `/${address}`
    }

    return address
  }

  throw new Error('OSC prepareAddress() needs addresses of type array or string')
}

/**
 * Make an OSC address pattern javascript-regex-ready
 * @param {string} str OSC address pattern
 * @return {string} Javascript RegEx string
 */
export function prepareRegExPattern(str) {
  let pattern

  if (!(isString(str))) {
    throw new Error('OSC prepareRegExPattern() needs strings')
  }

  pattern = str.replace(/\./g, '\\.')
  pattern = pattern.replace(/\(/g, '\\(')
  pattern = pattern.replace(/\)/g, '\\)')

  pattern = pattern.replace(/\{/g, '(')
  pattern = pattern.replace(/\}/g, ')')
  pattern = pattern.replace(/,/g, '|')

  pattern = pattern.replace(/\[!/g, '[^')

  pattern = pattern.replace(/\?/g, '.')
  pattern = pattern.replace(/\*/g, '.*')

  return pattern
}

/**
 * Holds a list of items and helps to merge them
 * into a single array of packed binary data
 */
export default class EncodeHelper {
  /**
   * Create a new EncodeHelper instance
   */
  constructor() {
    /** @type {array} data */
    this.data = []
    /** @type {number} byteLength */
    this.byteLength = 0
  }

  /**
   * Packs an item and adds it to the list
   * @param {*} item Any object
   * @return {EncodeHelper}
   */
  add(item) {
    // Skip encoding items which do not need a payload as they are constants
    if (isBoolean(item) || isInfinity(item) || isNull(item)) {
      return this
    }

    const buffer = item.pack()
    this.byteLength += buffer.byteLength
    this.data.push(buffer)

    return this
  }

  /**
   * Merge all added items into one Uint8Array
   * @return {Uint8Array} Merged binary data array of all items
   */
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
