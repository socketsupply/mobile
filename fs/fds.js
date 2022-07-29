import * as ipc from '../ipc.js'

/**
 * Static contsiner to map file descriptors to internal
 * identifiers with type reflection.
 */
export default new class FileDescriptorsMap {
  types = new Map()
  fds = new Map()
  ids = new Map()

  constructor () {
    if (
      typeof window === 'object' &&
      typeof window.process === 'object' &&
      window.process.openFds instanceof Map
    ) {
      for (const [id, entry] of window.process.openFds) {
        this.setEntry(id, entry)
      }

      const { set, delete: del, clear } = window.process.openFds
      window.process.openFds.set = (id, entry) => {
        this.setEntry(id, entry)
        set.call(window.process.openFds, id, entry)
      }

      window.process.openFds.delete = (id, ...args) => {
        this.delete(id)
        try {
          del.call(window.process.openFds, id, ...args)
        } catch (err) {
          console.warn(err)
        }
      }

      window.process.openFds.clear = (id, ...args) => {
        const ids = window.process.openFds.keys()

        for (const id of ids) {
          this.delete(id)
        }

        try {
          clear.call(window.process.openFds, id, ...args)
        } catch (err) {
          console.warn(err)
        }
      }
    }
  }

  get size () {
    return this.ids.size
  }

  get (id) {
    return this.fds.get(id)
  }

  set (id, fd, type) {
    this.fds.set(id, fd)
    this.ids.set(fd, id)
    this.types.set(id, type)
    this.types.set(fd, type)
  }

  has (id) {
    return this.fds.has(id) || this.ids.has(id)
  }

  setEntry (id, entry) {
    if (entry.fd.length > 16) {
      this.set(id, entry.fd)
    } else {
      this.set(id, parseInt(entry.fd))
    }
  }

  to (fd) {
    return this.ids.get(fd)
  }

  release (id) {
    const fd = this.fds.get(id)

    this.fds.delete(id)
    this.fds.delete(fd)

    this.ids.delete(fd)
    this.ids.delete(id)

    this.types.delete(id)
    this.types.delete(fd)
  }

  delete (id) {
    this.release(id)
  }

  typeof (id) {
    return this.types.get(id) || this.types.get(this.fds.get(id))
  }

  entries () {
    return this.ids.entries()
  }
}
