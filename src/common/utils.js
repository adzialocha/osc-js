/**
 * Check if given object is an integer number
 * @param {*} n
 * @return {boolean}
 */
export function isInt(n) {
  return Number(n) === n && n % 1 === 0
}

/**
 * Check if given object is a float number
 * @param {*} n
 * @return {boolean}
 */
export function isFloat(n) {
  return Number(n) === n && n % 1 !== 0
}

/**
 * Check if given object is a number
 * @param {*} n
 * @return {boolean}
 */
export function isNumber(n) {
  return Number(n) === n
}

/**
 * Check if given object is a string
 * @param {*} n
 * @return {boolean}
 */
export function isString(n) {
  return typeof n === 'string'
}

/**
 * Check if given object is an array
 * @param {*} n
 * @return {boolean}
 */
export function isArray(n) {
  return Object.prototype.toString.call(n) === '[object Array]'
}

/**
 * Check if given object is an object
 * @param {*} n
 * @return {boolean}
 */
export function isObject(n) {
  return Object.prototype.toString.call(n) === '[object Object]'
}

/**
 * Check if given object is a function
 * @param {*} n
 * @return {boolean}
 */
export function isFunction(n) {
  return typeof n === 'function'
}

/**
 * Check if given object is a Uint8Array
 * @param {*} n
 * @return {boolean}
 */
export function isBlob(n) {
  return n instanceof Uint8Array
}

/**
 * Check if given object is a Date
 * @param {*} n
 * @return {boolean}
 */
export function isDate(n) {
  return n instanceof Date
}

/**
 * Check if given object is undefined
 * @param {*} n
 * @return {boolean}
 */
export function isUndefined(n) {
  return typeof n === 'undefined'
}

/**
 * Return the next multiple of four
 * @param {number} n
 */
export function pad(n) {
  return (n + 3) & ~0x03
}

/**
 * Checks if environment provides a feature
 * @param {string} name Name of needed feature
 * @return {boolean}
 */
export function hasProperty(name) {
  return Object.prototype.hasOwnProperty.call(
    (typeof global !== 'undefined' ? global : window), // eslint-disable-line no-undef
    name,
  )
}

/**
 * Wrap binary data in DataView
 * @param {*} obj
 * @return {DataView}
 */
export function dataView(obj) {
  if (obj.buffer) {
    return new DataView(obj.buffer)
  } else if (obj instanceof ArrayBuffer) {
    return new DataView(obj)
  }

  return new DataView(new Uint8Array(obj))
}
