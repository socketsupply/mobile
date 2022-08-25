/**
 * @module Bluetooth
 *
 * A high level, cross-platform API for Bluetooth Pub-Sub
 */

import * as ipc from './ipc.js'
import { EventEmitter } from './events.js'

/**
 * Create an instance of a Bluetooth service.
 */
export class Bluetooth extends EventEmitter {
  static isInitalized = false;

  /**
   * constructor is an example property that is set to `true`
   * Creates a new service with key-value pairs
   * @param {string} serviceId - Given a default value to determine the type
   */
  constructor (serviceId = '') {
    super()

    if (!serviceId || serviceId.length !== 36) {
      throw new Error('expected serviceId of length 36')
    }

    this.serviceId = serviceId

    window.addEventListener('data', e => {
      if (!e.detail.params) return
      const { err, data } = e.detail.params

      if (err) return this.emit('error', err)

      if (data?.serviceId === this.serviceId) {
        this.emit(data.characteristicId, data, e.detail.data)
      }
    })

    window.addEventListener('bluetooth', e => {
      if (typeof e.detail !== 'object') return
      const { err, data } = e.detail

      if (err) {
        return this.emit('error', err)
      }

      this.emit(data.event, data)
    })
  }

  start () {
    return ipc.send('bluetooth-start', { serviceId: this.serviceId })
  }

  /**
   * Start scanning for published values that correspond to a well-known UUID
   *
   * @param {string} id - A well-known UUID
   * @return {Promise<any>}
   */
  subscribe (id = '') {
    return ipc.send('bluetooth-subscribe', {
      characteristicId: id,
      serviceId: this.serviceId
    })
  }

  /**
   * Start advertising a new value for a well-known UUID
   * @param {string} id - A well-known UUID
   * @return {Promise<any>}
   */
  async publish (id = '', value = '') {
    if (!id || id.length !== 36) {
      throw new Error('expected id of length 36')
    }

    const params = {
      characteristicId: id,
      serviceId: this.serviceId
    }

    if (!(value instanceof ArrayBuffer) && typeof value === 'object') {
      value = JSON.stringify(value)
    }

    if (typeof value === 'string') {
      const enc = new TextEncoder().encode(value)
      value = enc
      params.length = enc.length
    }

    const res = await ipc.write('bluetooth-publish', params, value)

    if (res.err) {
      throw new Error(res.err.message)
    }
  }
}

import * as exports from './bluetooth.js'
export default exports
