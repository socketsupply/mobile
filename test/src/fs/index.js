import { Buffer } from '@socketsupply/io'
import * as process from '@socketsupply/io/process.js'
import * as fs from '@socketsupply/io/fs.js'

import { test } from 'tapzero'

test('fs.access', async (t) => {
  await new Promise((resolve, reject) => {
    fs.access('fixtures', fs.constants.F_OK, (err) => {
      if (err) { return reject(err) }
      resolve()
    })
  })

  await new Promise((resolve, reject) => {
    fs.access('fixtures', fs.constants.F_OK | fs.constants.R_OK, (err) => {
      if (err) { return reject(err) }
      resolve()
    })
  })

  await new Promise((resolve, reject) => {
    fs.access('fixtures', fs.constants.W_OK, (err) => {
      if (err) { return reject(err) }
      resolve()
    })
  })

  await new Promise((resolve, reject) => {
    fs.access('fixtures', fs.constants.X_OK, (err) => {
      if (err) { return reject(err) }
      resolve()
    })
  })
})

test('fs.appendFile', async (t) => {})
test('fs.chmod', async (t) => {})
test('fs.chown', async (t) => {})
test('fs.close', async (t) => {
  await new Promise((resolve, reject) => {
    fs.open('fixtures/file.txt', (err, fd) => {
      if (err) console.warn(err)
      t.ok(Number.isFinite(fd), 'isFinite(fd)')
      fs.close(fd, (err) => {
        if (err) console.warn(err)
        t.ok(!err, 'fd closed')
        resolve()
      })
    })
  })
})

test('fs.copyFile', async (t) => {})
test('fs.createReadStream', async (t) => {
  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream('fixtures/file.txt')
    const buffers = []
    const expected = Buffer.from('test 123')
    stream.on('data', (buffer) => buffers.push(buffer))
    stream.on('error', (err) => {
      if (err) console.warn(err)
      resolve()
    })
    stream.on('close', resolve)

    stream.on('end', () => {
      let actual = Buffer.concat(buffers)
      if (actual[actual.length - 1] === 0x0A) {
        actual = actual.slice(0, -1)
      }

      t.ok(
        Buffer.compare(expected, actual) == 0,
        `fixtures/file.txt contents match "${expected}"`
      )
    })
  })
})
test('fs.createWriteStream', async (t) => {})
test('fs.fstat', async (t) => {})
test('fs.lchmod', async (t) => {})
test('fs.lchown', async (t) => {})
test('fs.lutimes', async (t) => {})
test('fs.link', async (t) => {})
test('fs.lstat', async (t) => {})
test('fs.mkdir', async (t) => {})
test('fs.open', async (t) => {})
test('fs.opendir', async (t) => {})
test('fs.read', async (t) => {})
test('fs.readdir', async (t) => {})
test('fs.readFile', async (t) => {})
test('fs.readlink', async (t) => {})
test('fs.realpath', async (t) => {})
test('fs.rename', async (t) => {})
test('fs.rmdir', async (t) => {})
test('fs.rm', async (t) => {})
test('fs.stat', async (t) => {})
test('fs.symlink', async (t) => {})
test('fs.truncate', async (t) => {})
test('fs.unlink', async (t) => {})
test('fs.utimes', async (t) => {})
test('fs.watch', async (t) => {})
test('fs.write', async (t) => {})
test('fs.writeFile', async (t) => {})
test('fs.writev', async (t) => {})
