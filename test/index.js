import assert from 'node:assert/strict'
import { randomUUID as uuid } from 'node:crypto'
import { Writable } from 'node:stream'
import { test } from 'node:test'
import { format } from 'node:util'

import { createLogger } from '../src/index.js'

const isDevelopment = process.env.NODE_ENV === 'development'

const countErrorLines = (...errors) => {
  const stackLines = errors.reduce((sum, error) => sum + error.stack.split('\n').length, 0)
  const lineBreaks = errors.length - 1 // Each inner error adds a line break

  return stackLines + lineBreaks
}

const createStream = (callbacks) => {
  let timeout
  const lines = []

  const stream = new Writable({
    write: (chunk, encoding, callback) => {
      lines.push(chunk.toString())
      if (isDevelopment) process.stderr.write(chunk)

      callbacks.onWrite?.(chunk.toString())

      clearTimeout(timeout)
      timeout = setTimeout(() => {
        callbacks.onDone?.(lines)
      }, 50)

      callback()
    },
  })

  return stream
}

test('returns logger', () => {
  const instance = createLogger({
    info: {},
  })

  assert.equal(typeof instance.info, 'function')
})

test('returns nested logger', () => {
  const instance = createLogger({
    instance: createLogger({
      info: {},
    }),
  })

  assert.equal(typeof instance.instance.info, 'function')
})

test('logs badge', () => {
  const { promise, resolve } = Promise.withResolvers()

  const badge = uuid()

  const stream = createStream({
    onWrite: (chunk) => {
      assert.ok(chunk.includes(badge))
    },
    onDone: resolve,
  })

  const instance = createLogger({
    info: {
      badge,
      streams: [stream],
    },
  })

  instance.info()

  return promise
})

test('logs label', () => {
  const { promise, resolve } = Promise.withResolvers()

  const label = uuid()

  const stream = createStream({
    onWrite: (chunk) => {
      assert.ok(chunk.includes(label))
    },
    onDone: resolve,
  })

  const instance = createLogger({
    info: {
      label,
      streams: [stream],
    },
  })

  instance.info()

  return promise
})

test('logs string', () => {
  const { promise, resolve } = Promise.withResolvers()

  const message = uuid()

  const stream = createStream({
    onWrite: (chunk) => {
      assert.ok(chunk.includes(message))
    },
    onDone: resolve,
  })

  const instance = createLogger({
    info: {
      streams: [stream],
    },
  })

  instance.info(message)

  return promise
})

test('logs object', () => {
  const { promise, resolve } = Promise.withResolvers()

  const message = { test: uuid() }

  const stream = createStream({
    onWrite: (chunk) => {
      assert.ok(chunk.includes(format(message)))
    },
    onDone: resolve,
  })

  const instance = createLogger({
    info: {
      streams: [stream],
    },
  })

  instance.info(message)

  return promise
})

test('logs error without stack', () => {
  const { promise, resolve } = Promise.withResolvers()

  const message = new Error(uuid())

  const stream = createStream({
    onWrite: (chunk) => {
      assert.ok(chunk.includes(message.message))
    },
    onDone: resolve,
  })

  const instance = createLogger({
    info: {
      stack: false,
      streams: [stream],
    },
  })

  instance.info(message)

  return promise
})

test('logs error with stack', () => {
  const { promise, resolve } = Promise.withResolvers()

  const messages = [uuid()]
  const message = new Error(messages[0])
  const lineCount = countErrorLines(message)

  const stream = createStream({
    onDone: (lines) => {
      assert.equal(lines.length, lineCount)
      for (const message of messages) {
        assert.equal(
          lines.some((line) => line.includes(message)),
          true,
        )
      }

      resolve()
    },
  })

  const instance = createLogger({
    info: {
      streams: [stream],
    },
  })

  instance.info(message)

  return promise
})

test('logs complex error without stack', () => {
  const { promise, resolve } = Promise.withResolvers()

  const messages = [uuid(), uuid(), uuid(), uuid()]
  const message = new AggregateError([new Error(messages[0], { cause: new Error(messages[1]) })], messages[2], {
    cause: new Error(messages[3]),
  })
  const lineCount = 4

  const stream = createStream({
    onDone: (lines) => {
      assert.equal(lines.length, lineCount)
      for (const message of messages) {
        assert.equal(
          lines.some((line) => line.includes(message)),
          true,
        )
      }

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

  return promise
})

test('logs complex error with stack', () => {
  const { promise, resolve } = Promise.withResolvers()

  const messages = [uuid(), uuid(), uuid(), uuid()]
  const message = new AggregateError([new Error(messages[0], { cause: new Error(messages[1]) })], messages[2], {
    cause: new Error(messages[3]),
  })
  const lineCount = countErrorLines(message, message.cause, message.errors[0], message.errors[0].cause)

  const stream = createStream({
    onDone: (lines) => {
      assert.equal(lines.length, lineCount)
      for (const message of messages) {
        assert.equal(
          lines.some((line) => line.includes(message)),
          true,
        )
      }

      resolve()
    },
  })

  const instance = createLogger({
    info: {
      streams: [stream],
    },
  })

  instance.info(message)

  return promise
})
