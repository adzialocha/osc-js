import { isArray, isString, isInt, isFunction, dataView } from './common/utils'
import { prepareAddress, prepareRegExPattern } from './common/helpers'

import Packet from './packet'
import Bundle from './bundle'
import Message from './message'

/**
 * Default options
 * @private
 */
const defaultOptions = {
  discardLateMessages: false,
}

/**
 * EventHandler to notify listeners on matching OSC messages and
 * status changes of plugins
 */
export default class EventHandler {
  /**
   * Create an EventHandler instance
   * @param {object} options Custom options
   */
  constructor(options) {
    /**
     * @type {object} options
     * @private
     */
    this.options = Object.assign({}, defaultOptions, options)
    /**
     * @type {array} addressHandlers
     * @private
     */
    this.addressHandlers = []
    /**
     * @type {object} eventHandlers
     * @private
     */
    this.eventHandlers = {
      open: [],
      error: [],
      close: [],
    }
    /**
     * @type {number} uuid
     * @private
     */
    this.uuid = 0
  }

  /**
   * Internally used method to dispatch OSC Packets. Extracts
   * given Timetags and dispatches them accordingly
   * @param {Packet} packet
   * @return {boolean} Success state
   * @private
   */
  dispatch(packet) {
    if (!(packet instanceof Packet)) {
      throw new Error('OSC EventHander dispatch() accepts only arguments of type Packet')
    }

    if (!packet.value) {
      throw new Error('OSC EventHander dispatch() can\'t read empty Packets')
    }

    if (packet.value instanceof Bundle) {
      const bundle = packet.value

      return bundle.bundleElements.forEach((bundleItem) => {
        if (bundleItem instanceof Bundle) {
          if (bundle.timetag.value.timestamp() < bundleItem.timetag.value.timestamp()) {
            throw new Error('OSC Bundle timestamp is older than the timestamp of enclosed Bundles')
          }
          return this.dispatch(bundleItem)
        } else if (bundleItem instanceof Message) {
          const message = bundleItem
          return this.notify(
            message.address,
            message,
            bundle.timetag.value.timestamp()
          )
        }

        throw new Error('OSC EventHander dispatch() can\'t dispatch unknown Packet value')
      })
    } else if (packet.value instanceof Message) {
      const message = packet.value
      return this.notify(message.address, message)
    }

    throw new Error('OSC EventHander dispatch() can\'t dispatch unknown Packet value')
  }

  /**
   * Internally used method to invoke listener callbacks. Uses regular
   * expression pattern matching for OSC addresses
   * @param {string} name OSC address or event name
   * @param {*} [data] The data of the event
   * @return {boolean} Success state
   * @private
   */
  call(name, data) {
    let success = false

    // call event handlers
    if (isString(name) && name in this.eventHandlers) {
      this.eventHandlers[name].forEach((handler) => {
        handler.callback(data)
        success = true
      })

      return success
    }

    // call address handlers
    const handlerKeys = Object.keys(this.addressHandlers)
    const handlers = this.addressHandlers

    handlerKeys.forEach((key) => {
      const regex = new RegExp(prepareRegExPattern(prepareAddress(name)), 'g')
      const test = regex.test(key)

      // found a matching address in our callback handlers
      if (test && key.length === regex.lastIndex) {
        handlers[key].forEach((handler) => {
          handler.callback(data)
          success = true
        })
      }
    })

    return success
  }

  /**
   * Notify the EventHandler of incoming OSC messages or status
   * changes (*open*, *close*, *error*). Handles OSC address patterns
   * and executes timed messages. Use binary arrays when
   * handling directly incoming network data. Packet's or Messages can
   * also be used
   * @param {...*} args
   * The OSC address pattern / event name as string}. For convenience and
   * Plugin API communication you can also use Message or Packet instances
   * or ArrayBuffer, Buffer instances (low-level access). The latter will
   * automatically be unpacked
   * When using a string you can also pass on data as a second argument
   * (any type). All regarding listeners will be notified with this data.
   * As a third argument you can define a javascript timestamp (number or
   * Date instance) for timed notification of the listeners.
   * @return {boolean} Success state of notification
   *
   * @example
   * const socket = dgram.createSocket('udp4')
   * socket.on('message', (message) => {
   *   this.notify(message)
   * })
   *
   * @example
   * this.notify('error', error.message)
   *
   * @example
   * const message = new OSC.Message('/test/path', 55)
   * this.notify(message)
   *
   * @example
   * const message = new OSC.Message('/test/path', 55)
   * // override timestamp
   * this.notify(message.address, message, Date.now() + 5000)
   */
  notify(...args) {
    if (args.length === 0) {
      throw new Error('OSC EventHandler can not be called without any argument')
    }

    // check for incoming dispatchable OSC data
    if (args[0] instanceof Packet) {
      return this.dispatch(args[0])
    } else if (args[0] instanceof Bundle || args[0] instanceof Message) {
      return this.dispatch(new Packet(args[0]))
    } else if (!isString(args[0])) {
      const packet = new Packet()
      packet.unpack(dataView(args[0]))
      return this.dispatch(packet)
    }

    const name = args[0]

    // data argument
    let data = null

    if (args.length > 1) {
      data = args[1]
    }

    // timestamp argument
    let timestamp = null

    if (args.length > 2) {
      if (isInt(args[2])) {
        timestamp = args[2]
      } else if (args[2] instanceof Date) {
        timestamp = args[2].getTime()
      } else {
        throw new Error('OSC EventHandler timestamp has to be a number or Date')
      }
    }

    // notify now or later
    if (timestamp) {
      const now = Date.now()

      // is message outdated?
      if (now > timestamp) {
        if (!this.options.discardLateMessages) {
          return this.call(name, data)
        }
      }

      // notify later
      const that = this

      setTimeout(() => {
        that.call(name, data)
      }, timestamp - now)

      return true
    }

    return this.call(name, data)
  }

  /**
   * Subscribe to a new address or event you want to listen to
   * @param {string} name The OSC address or event name
   * @param {function} callback Callback function on notification
   * @return {number} Subscription identifier (needed to unsubscribe)
   */
  on(name, callback) {
    if (!(isString(name) || isArray(name))) {
      throw new Error('OSC EventHandler accepts only strings or arrays for address patterns')
    }

    if (!isFunction(callback)) {
      throw new Error('OSC EventHandler callback has to be a function')
    }

    // get next id
    this.uuid += 1

    // prepare handler
    const handler = {
      id: this.uuid,
      callback,
    }

    // register event listener
    if (isString(name) && name in this.eventHandlers) {
      this.eventHandlers[name].push(handler)
      return this.uuid
    }

    // register address listener
    const address = prepareAddress(name)
    const regex = new RegExp(/[#*\s[\],/{}|?]/g)

    if (regex.test(address.split('/').join(''))) {
      throw new Error('OSC EventHandler address string contains invalid characters')
    }

    if (!(address in this.addressHandlers)) {
      this.addressHandlers[address] = []
    }

    this.addressHandlers[address].push(handler)

    return this.uuid
  }

  /**
   * Unsubscribe listener from event notification or address handler
   * @param {string} name The OSC address or event name
   * @param {number} subscriptionId Subscription id to identify the handler
   * @return {boolean} Success state
   */
  off(name, subscriptionId) {
    if (!(isString(name) || isArray(name))) {
      throw new Error('OSC EventHandler accepts only strings or arrays for address patterns')
    }

    if (!isInt(subscriptionId)) {
      throw new Error('OSC EventHandler subscription id has to be a number')
    }

    let key
    let haystack

    // event or address listener
    if (isString(name) && name in this.eventHandlers) {
      key = name
      haystack = this.eventHandlers
    } else {
      key = prepareAddress(name)
      haystack = this.addressHandlers
    }

    // remove the entry
    if (key in haystack) {
      return haystack[key].some((item, index) => {
        if (item.id === subscriptionId) {
          haystack[key].splice(index, 1)
          return true
        }

        return false
      })
    }

    return false
  }
}
