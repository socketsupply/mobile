import * as ipc from './ipc.js'
import { EventEmitter } from './events.js'

//
// const bt = new Bluetooth('chat')
//
// await bt.subscribe('messages')
//
// bt.on('messages', data => {
//   // assert(data === '{"value":"hello, world"}')
// })
//
// await bt.publish('messages', {
//   value: 'hello, world'
// })
//
export class Bluetooth extends EventEmitter {
  static isInitalized = false;

  constructor (serviceId) {
    super()

    if (!serviceId || serviceId.length !== 36) {
      throw new Error('expected serviceId of length 36')
    }

    this.serviceId = serviceId
    window.external.invoke(`ipc://bluetooth-start?serviceId=${this.serviceId}`)

    window.addEventListener('bluetooth', e => {
      console.log(e)
      // const { err, data } = e.detail.params

      // if (err) {
      //  return this.emit('error', err)
      //}

      // this.emit(data.event, data)
    })

    window.addEventListener('data', e => {
      if (e.detail?.params?.serviceId !== this.serviceId) return
      this.emit(e.detail.params.characteristicId, e.detail.data)
    })
  }

  subscribe (id) {
    return this.publish(id)
  }

  async publish (characteristicId, value = '') {
    if (!characteristicId || characteristicId.length !== 36) {
      throw new Error('expected characteristicId of length 36')
    }

    const params = {
      characteristicId: characteristicId,
      serviceId: this.serviceId
    }

    if (value.constructor.name !== 'Object') {
      value = JSON.stringify(value)
    }

    if (typeof value === 'string') {
      const enc = new TextEncoder().encode(value)
      value = enc.data
      params.length = enc.length
    }

    const res = await ipc.write('bluetooth-set', params, value)

    if (res.err) {
      throw new Error(res.err.message)
    }
  }
}
