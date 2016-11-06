export function isInt(n) {
  return Number(n) === n && n % 1 === 0
}

export function isFloat(n) {
  return Number(n) === n && n % 1 !== 0
}

export function isString(n) {
  return typeof n === 'string'
}

export function isArray(n) {
  return Object.prototype.toString.call(n) === '[object Array]'
}

export function isBlob(n) {
  return n instanceof Uint8Array
}

export function pad(n) {
  return (n + 3) & ~0x03
}
