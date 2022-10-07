// /**
//  @constructor
//  @abstract
//  */
// const Plugin = () => {
//   if (this.constructor === Plugin) {
//   }
// }

// /**
// @abstract
// */
// Plugin.prototype.close = () => {
//   throw new Error('Abstract method!')
// }

export default class Plugin {
  constructor() {
    if (this.constructor === Plugin) {
      throw new Error('Plugin is an abstract class. Please create or use an implementation!')
    }
  }

  /**
   * Returns the current status of the connection
   * @return {number} Status ID
   */
  status() {
    throw new Error('Abstract method!')
  }

  /**
   * Open socket connection. Specifics depend on implementation.
   * @param {object} [customOptions] Custom options. See implementation specifics.
   */
  // eslint-disable-next-line no-unused-vars
  open(customOptions = {}) {
    throw new Error('Abstract method!')
  }

  /**
   * Close socket connection and anything else used in the implementation.
   */
  close() {
    throw new Error('Abstract method!')
  }

  /**
   * Send an OSC Packet, Bundle or Message. Use options here for
   * custom receiver, otherwise the global options will be taken
   * @param {Uint8Array} binary Binary representation of OSC Packet
   * @param {object} [customOptions] Custom options. Specifics depend on implementation.
   */
  // eslint-disable-next-line no-unused-vars
  send(binary, customOptions = {}) {
    throw new Error('Abstract method!')
  }
}
