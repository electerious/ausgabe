<div align="center">

# ausgabe

[![Test](https://github.com/electerious/ausgabe/actions/workflows/test.yml/badge.svg)](https://github.com/electerious/ausgabe/actions/workflows/test.yml)

Tiny logger with zero defaults.

<br/>

![ausgabe in action](https://s.electerious.com/images/ausgabe/readme.png)

</div>

## Contents

- [Description](#description)
- [Install](#install)
- [Usage](#usage)
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
  },
)

// Simple massages
instance.info('Hello world')
instance.info('%s %s', 'Hello', 'world')

// Error messages
instance.warn(new Error('Logs error without the stack'))

// Complex error messages
instance.error(new Error('Logs error with the stack'))
instance.error(new Error('Logs error with the stack and cause error', { cause: new Error('Cause error') }))
instance.error(
  new AggregateError(
    [new Error('First error'), new Error('Second error')],
    'Logs aggregate error with multiple errors',
  ),
)
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

### Log all rejections and exceptions

`ausgabe` only logs what you tell it to log. To catch all unhandled rejections and uncaught exceptions, you can use `process.on`. This isn't specific to `ausgabe`, but a general Node.js feature.

```js
import figures from 'figures'
import { createLogger } from 'ausgabe'

const instance = createLogger({
  error: {
    color: 'red',
    badge: figures.cross,
    label: 'error',
  },
})

process.on('unhandledRejection', (error) => {
  instance.error(error)
})

process.on('uncaughtException', (error) => {
  instance.error(error)
})
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
  },
)
```

### Parameters

- `types` `{object}` Methods of the logger.
  - `color` `{?string}` Color of the log. Must be supported by [chalk](https://github.com/chalk/chalk). Defaults to `blue`.
  - `badge` `{?string}` Icon to log along with the message. Using [figures](https://github.com/sindresorhus/figures) is recommended. Defaults to `ℹ`.
  - `label` `{?string}` Label to log along with the message. Defaults to `info`.
  - `stack` `{?boolean}` Determines if the stack of an error should be logged. Defaults to `true`.
  - `streams` `{?WritableStream[]}` [Writable streams](https://nodejs.org/api/stream.html#stream_writable_streams) to which the data is written. Defaults to `[process.stdout]`.
- `options` `{?object}` Options.
  - `indention` `{?number}` Aligns log messages with a custom indention. Defaults to `0`.

### Returns

- `{object}` [ausgabe instance](#instance-api).

## Instance API

### Usage

```js
instance.info('Hello world')
instance.info('%s %s', 'Hello', 'world')
```

### Parameters

- `message` `{any}` Data to log that may contain zero or more substitution strings.
- `substitutions` `{...any}` Data with which to replace substitution strings within `message`.

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
