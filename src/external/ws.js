// This file gets used instead of the `ws` package during rollup builds
// targeting browser environments.
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
function fillWs() {
  if (typeof WebSocket !== 'undefined') {
    return WebSocket
  } else if (typeof MozWebSocket !== 'undefined') {
    return MozWebSocket
  } else if (typeof global !== 'undefined') {
    return global.WebSocket || global.MozWebSocket
  } else if (typeof window !== 'undefined') {
    return window.WebSocket || window.MozWebSocket
  } else if (typeof self !== 'undefined') {
    return self.WebSocket || self.MozWebSocket
  }
  return undefined
}
/* eslint-enable no-undef */
/* eslint-enable no-restricted-globals */

const ws = fillWs()

/**
 * Do not export server for browser environments.
 * @private
 */
export const WebSocketServer = undefined

/**
 * Return WebSocket client for browser environments.
 * @private
 */
export default ws
