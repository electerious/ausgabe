import test from 'ava'

import { createLogger } from '../src/index.js'

test.serial('returns logger', (t) => {
	const instance = createLogger({
		info: {
			color: 'blue',
			badge: 'i',
			label: 'info',
			stack: true,
		},
	})

	t.is(typeof instance.info, 'function')
})

test.serial('returns nested logger', (t) => {
	const instance = createLogger({
		instance: createLogger({
			info: {
				color: 'blue',
				badge: 'i',
				label: 'info',
				stack: true,
			},
		}),
	})

	t.is(typeof instance.instance.info, 'function')
})
