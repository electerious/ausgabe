import assert from 'node:assert/strict'
import { randomUUID as uuid } from 'node:crypto'
import { Writable } from 'node:stream'
import { test } from 'node:test'
import { format } from 'node:util'

import { createLogger } from '../src/index.js'

test('logs badge', () => {
  const { resolve } = Promise.withResolvers()

  const badge = uuid()

  const stream = new Writable({
    write: (chunk, encoding, callback) => {
      assert.ok(chunk.toString().includes(badge))
      callback()
      resolve()
    },
  })

  const instance = createLogger({
    info: {
      badge,
      streams: [stream],
    },
  })

  instance.info()
})

test('logs label', () => {
  const { resolve } = Promise.withResolvers()

  const label = uuid()

  const stream = new Writable({
    write: (chunk, encoding, callback) => {
      assert.ok(chunk.toString().includes(label))
      callback()
      resolve()
    },
  })

  const instance = createLogger({
    info: {
      label,
      streams: [stream],
    },
  })

  instance.info()
})

test('logs string message', () => {
  const { resolve } = Promise.withResolvers()

  const message = uuid()

  const stream = new Writable({
    write: (chunk, encoding, callback) => {
      assert.ok(chunk.toString().includes(message))
      callback()
      resolve()
    },
  })

  const instance = createLogger({
    info: {
      streams: [stream],
    },
  })

  instance.info(message)
})

test('logs object message', () => {
  const { resolve } = Promise.withResolvers()

  const message = { test: uuid() }

  const stream = new Writable({
    write: (chunk, encoding, callback) => {
      assert.ok(chunk.toString().includes(format(message)))
      callback()
      resolve()
    },
  })

  const instance = createLogger({
    info: {
      streams: [stream],
    },
  })

  instance.info(message)
})

test('logs error message', () => {
  const { resolve } = Promise.withResolvers()

  const message = new Error(uuid())

  const stream = new Writable({
    write: (chunk, encoding, callback) => {
      assert.ok(chunk.toString().includes(message.message))
      callback()
      resolve()
    },
  })

  const instance = createLogger({
    info: {
      stack: false,
      streams: [stream],
    },
  })

  instance.info(message)
})

test('logs error stack', () => {
  const { resolve } = Promise.withResolvers()

  let count = 0

  const message = new Error(uuid())

  const stream = new Writable({
    write: (chunk, encoding, callback) => {
      count += 1
      callback()
    },
  })

  const instance = createLogger({
    info: {
      streams: [stream],
    },
  })

  instance.info(message)

  // Give it time to accumulate more writes for stack
  setTimeout(() => {
    // The test only includes one log call which means we can assume that
    // multiple write stream calls mean that the stack has been logged.
    assert.ok(count > 1)
    resolve()
  }, 10)
})

test('returns nested logger', () => {
  const instance = createLogger({
    instance: createLogger({
      info: {},
    }),
  })

  assert.equal(typeof instance.instance.info, 'function')
})
