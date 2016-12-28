import { isObject, isString, isFunction, isInt } from './common/utils'

import Packet from './packet'
import Bundle from './bundle'
import Message from './message'

import EventHandler from './events'

/**
 * Default options.
 * @private
 */
const defaultOptions = {
  connectionPlugin: null,
  doublePrecisionFloats: false,
  discardLateMessages: false,
}

/**
 * Status flags.
 */
export const STATUS = {
  IS_NOT_INITIALIZED: -1,
  IS_CONNECTING: 0,
  IS_OPEN: 1,
  IS_CLOSING: 2,
  IS_CLOSED: 3,
}

/**
 * Singleton instance.
 * @private
 */
let instance = null

/**
 * Helper method to get options of singleton instance. If instance
 * does not exist (low level access) we take the default options.
 * @param {string} key Key of the option
 * @return {*} Value of requested option
 */
export function option(key) {
  const options = instance ? instance.options : defaultOptions

  if (!(key in options) || !isString(key)) {
    throw new Error('OSC option key does not exist or is not valid.')
  }

  return options[key]
}

/**
 * OSC interface.
 */
export default class OSC {
  /**
   * Create an OSC instance with given options
   * @param {object} options Custom options
   * @param {boolean} [options.doublePrecisionFloats=false] Use double precision floats (64 bit)
   * for higher float precision. Default setting uses 32bit floats which is the OSC standard
   * @param {string} options.connectionPlugin Add a connection plugin to this interface (this
   * is recommended). Pass over the instance here. Check out the README for further informations.
   *
   * @example
   * const osc = new OSC({ doublePrecisionFloats: true })
   *
   * @example
   * const websocketPlugin = new OSCWebsocket()
   * const osc = new OSC({ connectionPlugin: websocketPlugin })
   */
  constructor(options = {}) {
    // singleton pattern
    if (!instance) {
      instance = this
    }

    if (!isObject(options)) {
      throw new Error('OSC options argument has to be an object.')
    }

    /** @type {object} options */
    this.options = Object.assign({}, defaultOptions, options)
    /** @type {EventHandler} eventHandler */
    this.eventHandler = new EventHandler()

    // pass over EventHandler to connectionPlugin
    if (this.options.connectionPlugin && this.options.connectionPlugin.registerEventHandler) {
      this.options.connectionPlugin.registerEventHandler(this.eventHandler)
    }

    return instance
  }

  /**
   * Listen to an event or OSC address pattern. The OSC address listener
   * notification is capable of address pattern matching. Use a connection
   * plugin or write your own for full functionality of this feature
   * (see Plugin API for more informations)
   * @param {string} eventName Event name or OSC address pattern
   * @param {function} callback Function which is called on notification
   * @return {number} Subscription id (needed to unsubscribe)
   *
   * @example
   * // will be called when server receives /in!trument/* for example
   * osc.on('/instrument/1', (message) => {
   *   console.log(message)
   * })
   *
   * @example
   * osc.on('error', (message) => {
   *   console.log(message)
   * })
   */
  on(eventName, callback) {
    if (!(isString(eventName) && isFunction(callback))) {
      throw new Error('OSC event listener needs an event or address string and a function as callback.')
    }

    return this.eventHandler.on(eventName, callback)
  }

  /**
   * Unsubscribe event listener
   * @param {string} eventName Event name or OSC address pattern
   * @param {number} subscriptionId The subscription id
   * @return {boolean} Success state
   *
   * @example
   * const listener = osc.on('error', (message) => {
   *   console.log(message)
   * })
   * osc.off('error', listener) // unsubscribe from error event
   */
  off(eventName, subscriptionId) {
    if (!(isString(eventName) && isInt(subscriptionId))) {
      throw new Error('OSC listener needs a string and a listener id number to unsubscribe from event.')
    }

    return this.eventHandler.off(eventName, subscriptionId)
  }

  /**
   * Open network socket with connection plugin. This method is used by connection plugins
   * and is not available without (see Plugin API for more informations)
   * @param {object} options Custom options for plugin instance
   *
   * @example
   * const osc = new OSC({ connectionPlugin: new OSCDatagramW() })
   * osc.open({ host: '127.0.0.1', port: 8080 })
   */
  open(options = {}) {
    if (!isObject(options)) {
      throw new Error('OSC connection options argument has to be an object.')
    }

    if (!(this.options.connectionPlugin && isFunction(this.options.connectionPlugin.open))) {
      throw new Error('OSC connection#open is not implemented.')
    }

    return this.options.connectionPlugin.open(options)
  }

  /**
   * Returns the current status of the connection. See STATUS for
   * it's different possible states. This method is used by connection plugins
   * and is not available without (see Plugin API for more informations)
   * @return {number} Status ID
   *
   * @example
   * import OSC, { STATUS } from 'osc'
   * const osc = new OSC()
   * if (osc.status() === STATUS.IS_CONNECTING) {
   *   // do something
   * }
   */
  status() {
    if (!(this.options.connectionPlugin && isFunction(this.options.connectionPlugin.status))) {
      throw new Error('OSC connection#status is not implemented.')
    }

    return this.options.connectionPlugin.status()
  }

  /**
   * Close network socket of connection plugin. This method is used by connection plugins
   * and is not available without (see Plugin API for more informations)
   */
  close() {
    if (!(this.options.connectionPlugin && isFunction(this.options.connectionPlugin.close))) {
      throw new Error('OSC connection#close is not implemented.')
    }

    return this.options.connectionPlugin.close()
  }

  /**
   * Send an OSC Packet, Bundle or Message. This method is used by connection plugins
   * and is not available without (see Plugin API for more informations)
   * @param {Packet|Bundle|Message} packet OSC Packet, Bundle or Message instance
   * @param {object} options Custom options for transport instance
   *
   * @example
   * const osc = new OSC({ connectionPlugin: new OSCDatagram() })
   * osc.open({ host: '127.0.0.1', port: 8080 })
   *
   * const message = new OSC.Message('/test/path', 55.1, 57)
   * osc.send(message)
   *
   * @example
   * osc.send(message, { host: '192.168.178.115', port: 9001 })
   */
  send(packet, options = {}) {
    if (!(this.options.connectionPlugin && isFunction(this.options.connectionPlugin.send))) {
      throw new Error('OSC connection#send is not implemented.')
    }

    if (!(packet instanceof Message || packet instanceof Bundle || packet instanceof Packet)) {
      throw new Error('OSC can only send Messages, Bundles or Packets.')
    }

    if (!isObject(options)) {
      throw new Error('OSC connection options argument has to be an object.')
    }

    return this.options.connectionPlugin.send(packet.pack(this.options), options)
  }
}
