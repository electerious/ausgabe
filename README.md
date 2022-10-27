# ausgabe

![Build](https://github.com/electerious/ausgabe/workflows/Build/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/electerious/ausgabe/badge.svg?branch=master)](https://coveralls.io/github/electerious/ausgabe?branch=master)

Tiny logger with zero defaults.

## Contents

- [Description](#description)
- [Install](#install)
- [Usage](#usage)
  - [Basic](#basic)
  - [Advanced](#advanced)
  - [Nested](#nested)
- [API](#api)
- [Instance API](#instance-api)

## Description

`ausgabe` is designed to output user relevant log messages to the console.

## Install

```
npm install ausgabe
```

## Usage

### Basic

```js
import { createLogger } from 'ausgabe'

const instance = createLogger({
	info: {
		color: 'blue',
		badge: 'ℹ',
		label: 'info',
	},
})

instance.info('Hello world')
```

### Advanced

```js
import figures from 'figures'
import { createLogger } from 'ausgabe'

const instance = createLogger(
	{
		info: {
			color: 'blue',
			badge: figures.info,
			label: 'info',
		},
		warn: {
			color: 'yellow',
			badge: figures.warning,
			label: 'warn',
			stack: false,
		},
		error: {
			color: 'red',
			badge: figures.cross,
			label: 'error',
		},
	},
	{
		filter: (typeName) => {
			switch (process.env.NODE_ENV) {
				case 'production':
					// Just log errors
					return typeName === 'error'
				default:
					// Log everything
					return true
			}
		},
		indention: 7,
	}
)

instance.info('Hello world')
instance.info('%s %s', 'Hello', 'world')
instance.warn(new Error('Logs error without the stack'))
instance.error(new Error('Logs error with the stack'))
```

### Nested

```js
import { createLogger } from 'ausgabe'

const instance = createLogger({
	requests: createLogger({
		get: {
			color: 'magenta',
			badge: '↗',
			label: 'get',
		},
		post: {
			color: 'magenta',
			badge: '↗',
			label: 'post',
		},
	}),
})

instance.requests.get('http://example.com')
instance.requests.post('http://example.com')
```

## API

### Usage

```js
import { createLogger } from 'ausgabe'

const instance = createLogger({
	info: {
		color: 'blue',
		badge: 'ℹ',
		label: 'info',
	},
})
```

```js
import { createLogger } from 'ausgabe'

const instance = createLogger(
	{
		info: {
			color: 'blue',
			badge: 'ℹ',
			label: 'info',
		},
	},
	{
		filter: (typeName) => true,
		indention: 6,
	}
)
```

### Parameters

- `types` `{Object}` Methods of the logger.
  - `color` `{?String}` Color of the log. Must be supported by [chalk](https://github.com/chalk/chalk). Defaults to `blue`.
  - `badge` `{?String}` Icon to log along with the message. Using [figures](https://github.com/sindresorhus/figures) is recommended. Defaults to `ℹ`.
  - `label` `{?String}` Label to log along with the message. Defaults to `info`.
  - `stack` `{?Boolean}` Determines if the stack of an error should be logged. Defaults to `true`.
- `types` `{?Object}` Options.
  - `filter` `{?Function}({String})` Function that filters the types that should be logged. Return `true` to include a type.
  - `indention` `{?Integer}` Aligns log messages with a custom indention.

### Returns

- `{Function}({String},{?...*})` [ausgabe instance](#instance-api).

## Instance API

### Usage

```js
instance.info('Hello world')
instance.info('%s %s', 'Hello', 'world')
```

### Parameters

- `message` `{String}` Message containing zero or more substitution strings.
- `substitutions` `{?...*}` Data with which to replace substitution strings within `message`.
