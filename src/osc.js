import {
  isFunction,
  isInt,
  isObject,
  isString,
} from './common/utils'

import Bundle from './bundle'
import EventHandler from './events'
import Message, { TypedMessage } from './message'
import Packet from './packet'

import DatagramPlugin from './plugin/dgram'
import BridgePlugin from './plugin/bridge'
import WebsocketClientPlugin from './plugin/wsclient'
import WebsocketServerPlugin from './plugin/wsserver'

/**
 * Default options
 * @private
 */
const defaultOptions = {
  discardLateMessages: false,
  plugin: new WebsocketClientPlugin(),
}

/**
 * Status flags
 */
const STATUS = {
  IS_NOT_INITIALIZED: -1,
  IS_CONNECTING: 0,
  IS_OPEN: 1,
  IS_CLOSING: 2,
  IS_CLOSED: 3,
}

/**
 * OSC interface to send OSC Packets and listen to status changes and
 * incoming message events. Offers a Plugin API for different network
 * protocols, defaults to a simple Websocket client for OSC communication
 * between a browser js-app and a js-node server
 *
 * @example
 * const osc = new OSC()
 *
 * osc.on('/input/test', message => {
 *   // print incoming OSC message arguments
 *   console.log(message.args)
 * })
 *
 * osc.on('open', () => {
 *   const message = new Message('/test/path', 55.12, 'hello')
 *   osc.send(message)
 * })
 *
 * osc.open({ host: '192.168.178.115', port: 9012 })
 */
class OSC {
  /**
   * Create an OSC instance with given options
   * @param {object} [options] Custom options
   * @param {boolean} [options.discardLateMessages=false] Ignore incoming
   * messages when given timetag lies in the past
   * @param {Plugin} [options.plugin=WebsocketClientPlugin] Add a connection plugin
   * to this interface, defaults to a plugin with Websocket client.
   * Open README.md for further information on how to handle plugins or
   * how to write your own with the Plugin API
   *
   * @example
   * const osc = new OSC() // default options with Websocket client
   *
   * @example
   * const osc = new OSC({ discardLateMessages: true })
   *
   * @example
   * const websocketPlugin = new OSC.WebsocketClientPlugin()
   * const osc = new OSC({ plugin: websocketPlugin })
   */
  constructor(options) {
    if (options && !isObject(options)) {
      throw new Error('OSC options argument has to be an object.')
    }

    /**
     * @type {object} options
     * @private
     */
    this.options = { ...defaultOptions, ...options }
    /**
     * @type {EventHandler} eventHandler
     * @private
     */
    this.eventHandler = new EventHandler({
      discardLateMessages: this.options.discardLateMessages,
    })

    // pass EventHandler's notify() to plugin
    const { eventHandler } = this
    if (this.options.plugin && this.options.plugin.registerNotify) {
      this.options.plugin.registerNotify((...args) => eventHandler.notify(...args))
    }
  }

  /**
   * Listen to a status-change event or incoming OSC message with
   * address pattern matching
   * @param {string} eventName Event name or OSC address pattern
   * @param {function} callback Function which is called on notification
   * @return {number} Subscription id (needed to unsubscribe)
   *
   * @example
   * // will be called when server receives /in!trument/* for example
   * osc.on('/instrument/1', message => {
   *   console.log(message)
   * })
   *
   * @example
   * // will be called for every message since it uses the wildcard symbol
   * osc.on('*', message => {
   *   console.log(message)
   * })
   *
   * @example
   * // will be called on network socket error
   * osc.on('error', message => {
   *   console.log(message)
   * })
   */
  on(eventName, callback) {
    if (!(isString(eventName) && isFunction(callback))) {
      throw new Error('OSC on() needs event- or address string and callback function')
    }

    return this.eventHandler.on(eventName, callback)
  }

  /**
   * Unsubscribe an event listener
   * @param {string} eventName Event name or OSC address pattern
   * @param {number} subscriptionId The subscription id
   * @return {boolean} Success state
   *
   * @example
   * const listenerId = osc.on('error', message => {
   *   console.log(message)
   * })
   * osc.off('error', listenerId) // unsubscribe from error event
   */
  off(eventName, subscriptionId) {
    if (!(isString(eventName) && isInt(subscriptionId))) {
      throw new Error('OSC off() needs string and number (subscriptionId) to unsubscribe')
    }

    return this.eventHandler.off(eventName, subscriptionId)
  }

  /**
   * Open network socket with plugin. This method is used by
   * plugins and is not available without (see Plugin API for more information)
   * @param {object} [options] Custom global options for plugin instance
   *
   * @example
   * const osc = new OSC({ plugin: new OSC.DatagramPlugin() })
   * osc.open({ host: '127.0.0.1', port: 8080 })
   */
  open(options) {
    if (options && !isObject(options)) {
      throw new Error('OSC open() options argument needs to be an object')
    }

    if (!(this.options.plugin && isFunction(this.options.plugin.open))) {
      throw new Error('OSC Plugin API #open is not implemented!')
    }

    return this.options.plugin.open(options)
  }

  /**
   * Returns the current status of the connection. See *STATUS* for
   * different possible states. This method is used by plugins
   * and is not available without (see Plugin API for more information)
   * @return {number} Status identifier
   *
   * @example
   * import OSC, { STATUS } from 'osc'
   * const osc = new OSC()
   * if (osc.status() === STATUS.IS_CONNECTING) {
   *   // do something
   * }
   */
  status() {
    if (!(this.options.plugin && isFunction(this.options.plugin.status))) {
      throw new Error('OSC Plugin API #status is not implemented!')
    }

    return this.options.plugin.status()
  }

  /**
   * Close connection. This method is used by plugins and is not
   * available without (see Plugin API for more information)
   */
  close() {
    if (!(this.options.plugin && isFunction(this.options.plugin.close))) {
      throw new Error('OSC Plugin API #close is not implemented!')
    }

    return this.options.plugin.close()
  }

  /**
   * Send an OSC Packet, Bundle or Message. This method is used by plugins
   * and is not available without (see Plugin API for more information)
   * @param {Packet|Bundle|Message} packet OSC Packet, Bundle or Message instance
   * @param {object} [options] Custom options
   *
   * @example
   * const osc = new OSC({ plugin: new OSC.DatagramPlugin() })
   * osc.open({ host: '127.0.0.1', port: 8080 })
   *
   * const message = new OSC.Message('/test/path', 55.1, 57)
   * osc.send(message)
   *
   * // send message again to custom address
   * osc.send(message, { host: '192.168.178.115', port: 9001 })
   */
  send(packet, options) {
    if (!(this.options.plugin && isFunction(this.options.plugin.send))) {
      throw new Error('OSC Plugin API #send is not implemented!')
    }

    if (!(packet instanceof TypedMessage
        || packet instanceof Message
        || packet instanceof Bundle
        || packet instanceof Packet)
    ) {
      throw new Error('OSC send() needs Messages, Bundles or Packets')
    }

    if (options && !isObject(options)) {
      throw new Error('OSC send() options argument has to be an object')
    }

    return this.options.plugin.send(packet.pack(), options)
  }
}

// expose status flags
OSC.STATUS = STATUS

// expose OSC classes
OSC.Packet = Packet
OSC.Bundle = Bundle
OSC.Message = Message
OSC.TypedMessage = TypedMessage

// expose plugins
OSC.DatagramPlugin = DatagramPlugin
OSC.WebsocketClientPlugin = WebsocketClientPlugin
OSC.WebsocketServerPlugin = WebsocketServerPlugin
OSC.BridgePlugin = BridgePlugin

export default OSC
