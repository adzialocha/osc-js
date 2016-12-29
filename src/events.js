import { isArray, isString, isInt, isFunction } from './common/utils'
import { prepareAddress, prepareRegExPattern } from './common/helpers'

import { option } from './osc'

import Message from './message'

/**
 * EventHandler to notify listener on address pattern match of incoming
 * Message while caring about timetags (later notification). The EventHandler
 * is also handling status changes of connection plugins.
 */
export default class EventHandler {
  /**
   * Create an EventHandler instance
   * @param {object} options OSC instance options
   */
  constructor() {
    /** @type {array} addressHandlers */
    this.addressHandlers = []
    /** @type {object} eventHandlers */
    this.eventHandlers = {
      open: [],
      error: [],
      close: [],
    }
    /** @type {number} uuid */
    this.uuid = 0
  }

  /**
   * Find a matching event handler and notify the listeners when given
   * @param {string|Message} eventItem The OSC address pattern / event name or Message
   * @param {*} eventData Data which will be passed onto the listeners. This can be
   * left empty when using Messages
   * @param {number} timestamp Execute this notification with a timestamp. This can
   * be left empty when using Messages
   */
  notify(...args) {
    let eventName
    let data
    let timestamp

    if (args.length === 1 && args[0] instanceof Message) {
      const message = args[0]

      eventName = message.address
      data = message

      if (message.timetag) {
        timestamp = message.timetag.value.timestamp()
      }
    } else if (args.length > 0 && isString(args[0])) {
      eventName = args[0]

      if (args[1]) {
        data = args[1]
      }

      if (args.length > 2 && isInt(args[2])) {
        timestamp = args[2]
      }
    } else {
      throw new Error('OSC EventHandler was notified with invalid arguments.')
    }

    if (timestamp) {
      const now = Date.now()

      if (now > timestamp) {
        if (!option('discardLateMessages')) {
          this.notify(eventName, data)
        }
      } else {
        const that = this

        // notify later
        setTimeout(() => {
          that.notify(eventName, data)
        }, timestamp - now)
      }

      return true
    }

    // call event handlers
    if (isString(eventName) && eventName in this.eventHandlers) {
      this.eventHandlers[eventName].forEach((handler) => {
        handler.callback(data)
      })

      return true
    }

    // call address handlers
    const handlerKeys = Object.keys(this.addressHandlers)
    const handlers = this.addressHandlers

    handlerKeys.forEach((key) => {
      const regex = new RegExp(prepareRegExPattern(prepareAddress(eventName)), 'g')
      const test = regex.test(key)

      // found a matching address in our callback handlers
      if (test && key.length === regex.lastIndex) {
        handlers[key].forEach((handler) => {
          handler.callback(data)
        })
      }
    })

    return true
  }

  /**
   * Subscribe to a new address or event you want to listen to
   * @param {string} eventName The OSC address or event name
   * @param {function} callback Callback function on notification
   * @return {number} Subscription Id (needed to unsubscribe)
   */
  on(eventName, callback) {
    if (!(isString(eventName) || isArray(eventName))) {
      throw new Error('OSC EventHandler accepts only strings or arrays for address patterns.')
    }

    if (!isFunction(callback)) {
      throw new Error('OSC EventHandler callback has to be a function.')
    }

    // get next id
    this.uuid += 1

    // prepare handler
    const handler = {
      id: this.uuid,
      callback,
    }

    // register event listener
    if (isString(eventName) && eventName in this.eventHandlers) {
      this.eventHandlers[eventName].push(handler)
      return this.uuid
    }

    // register address listener
    const address = prepareAddress(eventName)
    const regex = new RegExp(/[#*\s[\],/{}|?]/g)

    if (regex.test(address.split('/').join(''))) {
      throw new Error('OSC EventHandler address string contains invalid characters.')
    }

    if (!(address in this.addressHandlers)) {
      this.addressHandlers[address] = []
    }

    this.addressHandlers[address].push(handler)

    return this.uuid
  }

  /**
   * Unsubscribe listener from event notification or address handler
   * @param {string} eventName The OSC address or event name
   * @param {number} subscriptionId Subscription id to identify the handler
   * @return {boolean} Success state
   */
  off(eventName, subscriptionId) {
    if (!(isString(eventName) || isArray(eventName))) {
      throw new Error('OSC EventHandler accepts only strings or arrays for address patterns.')
    }

    if (!isInt(subscriptionId)) {
      throw new Error('OSC EventHandler subscription id has to be a number.')
    }

    let key
    let haystack

    // event or address listener
    if (isString(eventName) && eventName in this.eventHandlers) {
      key = eventName
      haystack = this.eventHandlers
    } else {
      key = prepareAddress(eventName)
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
