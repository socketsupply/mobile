'use strict'
/* global XMLHttpRequest, window */

const OK = 0
const ERROR = 1

async function ready () {
  return await new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new TypeError('Global window object is not defined.'))
    }

    return loop()

    function loop () {
      if (window._ipc) {
        return resolve()
      }

      queueMicrotask(loop)
    }
  })
}

function sendSync (command, params) {
  if (typeof window === 'undefined') {
    console.warn('Global window object is not defined')
    return {}
  }

  const request = new window.XMLHttpRequest()
  const index = window.process ? window.process.index : 0
  const seq = window._ipc ? window._ipc.nextSeq++ : 0
  const uri = `ipc://${command}`

  params = new URLSearchParams(params)
  params.set('index', index)
  params.set('seq', seq)

  const query = `?${params}`

  request.open('GET', uri + query, false)
  request.send(null)

  try {
    return JSON.parse(request.response)
  } catch (err) {
    console.warn(err.message || err)
  }

  return request.response
}

async function emit (...args) {
  await ready()
  return await window._ipc.emit(...args)
}

async function resolve (...args) {
  await ready()
  return await window._ipc.resolve(...args)
}

async function send (...args) {
  await ready()
  return await window._ipc.send(...args)
}

async function request (command, data) {
  await ready()

  const params = { ...data }

  for (const key in params) {
    if (params[key] === undefined) {
      delete params[key]
    }
  }

  const parent = typeof window === 'object' ? window : globalThis
  const promise = parent._ipc.send(command, params)

  const { seq, index } = promise
  const resolved = promise.then((result) => {
    const value = result?.value || result

    if (value?.err) {
      throw Object.assign(new Error(value.err.message), value.err)
    }

    if (value && 'data' in value) {
      if (value.data instanceof ArrayBuffer) {
        return new Uint8Array(value.data)
      }

      return value.data
    }

    return value
  })

  // handle async resolution from IPC over XHR
  parent.addEventListener('data', ondata)

  return Object.assign(resolved, { seq, index })

  function ondata (event) {
    if (event.detail?.data) {
      const { data, params } = event.detail
      if (parseInt(params.seq) === parseInt(seq)) {
        window.removeEventListener('data', ondata)
        resolve(seq, OK, data)
      }
    }
  }
}

module.exports = {
  OK,
  ERROR,

  emit,
  ready,
  resolve,
  request,
  send,
  sendSync
}
