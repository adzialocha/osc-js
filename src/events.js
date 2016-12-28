import { isArray, isString, isInt, isFunction } from './common/utils'
import { prepareAddress, prepareRegExPattern } from './common/helpers'

import { option } from './osc'

import { Timetag } from './atomic/timetag'

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
   * @param {string} eventName The OSC address pattern or event name
   * @param {*} data Data which will be passed onto the listeners
   * @param {Timetag} timetag Execute this notification with a timetag
   */
  notify(eventName, data, timetag) {
    if (!(isString(eventName))) {
      throw new Error('OSC EventHandler notify method accepts only strings.')
    }

    if (timetag && !(timetag instanceof Timetag)) {
      throw new Error('OSC EventHandler accepts only timetags of type Timetag.')
    }

    if (timetag) {
      const now = Date.now()

      if (now > timetag.timestamp()) {
        if (!option('discardLateMessages')) {
          this.notify(eventName, data)
        }
      } else {
        const that = this

        // notify later
        setTimeout(() => {
          that.notify(eventName, data)
        }, timetag.timestamp() - now)
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
