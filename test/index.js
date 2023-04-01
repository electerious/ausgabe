import util from 'node:util'
import { Writable } from 'node:stream'
import { randomUUID as uuid } from 'node:crypto'
import test from 'ava'

import { createLogger } from '../src/index.js'

test.serial('logs badge', (t) => {
	t.plan(1)

	const badge = uuid()

	const stream = new Writable({
		write: (chunk, encoding, callback) => {
			t.true(chunk.toString().includes(badge))
			callback()
		},
	})

	const instance = createLogger({
		info: {
			badge: badge,
			streams: [stream],
		},
	})

	instance.info()
})

test.serial('logs label', (t) => {
	t.plan(1)

	const label = uuid()

	const stream = new Writable({
		write: (chunk, encoding, callback) => {
			t.true(chunk.toString().includes(label))
			callback()
		},
	})

	const instance = createLogger({
		info: {
			label: label,
			streams: [stream],
		},
	})

	instance.info()
})

test.serial('logs string message', (t) => {
	t.plan(1)

	const message = uuid()

	const stream = new Writable({
		write: (chunk, encoding, callback) => {
			t.true(chunk.toString().includes(message))
			callback()
		},
	})

	const instance = createLogger({
		info: {
			streams: [stream],
		},
	})

	instance.info(message)
})

test.serial('logs object message', (t) => {
	t.plan(1)

	const message = { test: uuid() }

	const stream = new Writable({
		write: (chunk, encoding, callback) => {
			t.true(chunk.toString().includes(util.format(message)))
			callback()
		},
	})

	const instance = createLogger({
		info: {
			streams: [stream],
		},
	})

	instance.info(message)
})

test.serial('logs error message', (t) => {
	t.plan(1)

	const message = new Error(uuid())

	const stream = new Writable({
		write: (chunk, encoding, callback) => {
			t.true(chunk.toString().includes(message.message))
			callback()
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

test.serial('returns nested logger', (t) => {
	const instance = createLogger({
		instance: createLogger({
			info: {},
		}),
	})

	t.is(typeof instance.instance.info, 'function')
})
