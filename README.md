<div align="center">

# ausgabe

![Build](https://github.com/electerious/ausgabe/workflows/Build/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/electerious/ausgabe/badge.svg?branch=main)](https://coveralls.io/github/electerious/ausgabe?branch=master)

Tiny logger with zero defaults.

<br/>

![ausgabe in action](https://s.electerious.com/images/ausgabe/readme.png)

</div>

## Contents

- [Description](#description)
- [Install](#install)
- [Usage](#usage)
  - [Basic](#basic)
  - [Advanced](#advanced)
  - [Nested](#nested)
  - [Streams](#streams)
- [API](#api)
- [Instance API](#instance-api)
- [Miscellaneous](#miscellaneous)

## Description

`ausgabe` is designed to output user relevant log messages to the console or to a [custom stream](#streams). It's lightweight, customizable and perfect for tools that need simple, yet beautiful log messages.

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
		indention: 7,
	}
)

instance.info('Hello world')
instance.info('%s %s', 'Hello', 'world')
instance.warn(new Error('Logs error without the stack'))
instance.error(new Error('Logs error with the stack'))
```

### Nested

`ausgabe` supports nested logger instances.

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

### Streams

`ausgabe` streams to `process.stdout` by default, but also allows custom [writable streams](https://nodejs.org/api/stream.html#stream_writable_streams).

```js
import { Writable } from 'node:stream'
import { createLogger } from 'ausgabe'

const stream = new Writable({
	write: (chunk, encoding, callback) => {
		console.log(chunk.toString())
		callback()
	},
})

const instance = createLogger({
	info: {
		color: 'blue',
		badge: 'ℹ',
		label: 'info',
		streams: [stream],
	},
})

instance.info('Hello world')
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
  - `streams` `{?Array}` [Writable streams](https://nodejs.org/api/stream.html#stream_writable_streams) to which the data is written. Defaults to `[process.stdout]`.
- `options` `{?Object}` Options.
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

## Miscellaneous

### Donate

I am working hard on continuously developing and maintaining my projects. Please consider making a donation to keep the project going strong and me motivated.

- [Become a GitHub sponsor](https://github.com/sponsors/electerious)
- [Donate via PayPal](https://paypal.me/electerious)
- [Buy me a coffee](https://www.buymeacoffee.com/electerious)

### Related

- [signale](https://github.com/klaudiosinani/signale) - Highly configurable logging utility

### Links

- [Follow me on Twitter](https://twitter.com/electerious)
