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
 * Return the next multiple of four
 * @param {number} n
 */
export function pad(n) {
  return (n + 3) & ~0x03
}
