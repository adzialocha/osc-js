// This file gets used instead of the `ws` package during rollup builds
// targeting browser environments.
let ws

if (typeof WebSocket !== 'undefined') {
  ws = WebSocket
} else if (typeof MozWebSocket !== 'undefined') {
  ws = MozWebSocket
} else if (typeof global !== 'undefined') {
  ws = global.WebSocket || global.MozWebSocket
} else if (typeof window !== 'undefined') {
  ws = window.WebSocket || window.MozWebSocket
} else if (typeof self !== 'undefined') {
  ws = self.WebSocket || self.MozWebSocket
}

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
