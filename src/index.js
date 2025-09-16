import chalk from 'chalk'
import { format } from 'node:util'

const IDENTIFIER = Symbol('IDENTIFIER')

const defaultOptions = {
  indention: 0,
}

const defaultTypeOptions = {
  color: 'blue',
  badge: 'ℹ',
  label: 'info',
  stack: true,
  streams: [process.stdout],
}

/**
 * Flattens a block into an array of lines, as some blocks need to be written in multiple lines
 * (e.g. errors and their stack trace).
 *
 * @param {any} block - The block to parse that may contain zero or more substitution strings.
 * @param {any[]} substitutions - Data with which to replace substitution strings within `block`.
 * @param {boolean} includeStack - Whether to include the stack trace for errors.
 * @returns {string[]} - Array of lines with stack trace (if applicable).
 */
const flattenBlock = (block, substitutions, includeStack) => {
  if (block instanceof Error) {
    const message = block.message
    if (includeStack === false) return [message]

    const stack = block.stack ?? ''
    if (stack === '') return [message]

    return [
      message,
      ...stack
        .split('\n')
        .map((line) => line.trim())
        .slice(1),
    ]
  }

  return [format(block, ...substitutions)]
}

/**
 * Flattens a message into an array of blocks, as some messages need to be written in multiple blocks
 * (e.g. errors, error causes and aggregate errors).
 *
 * @param {any} message - The message to flatten.
 * @returns {any[]} - Array of blocks.
 */
const flattenMessage = (message) => {
  const blocks = [message]

  if (message instanceof Error && message.cause instanceof Error) {
    blocks.push(...flattenMessage(message.cause))
  }

  if (message instanceof AggregateError) {
    blocks.push(...message.errors.flatMap(flattenMessage))
  }

  return blocks
}

/**
 * Creates a writer function for the provided streams.
 *
 * @param {WritableStream[]} streams - Array of writable streams to write messages to.
 * @returns {function(...string): void} - A function that writes messages to the streams.
 */
const write =
  (streams) =>
  (...messages) => {
    for (const stream of streams) {
      stream.write(`${messages.join('')} \n`)
    }
  }

/**
 * Creates a logger instance with the specified types and options.
 *
 * @param {object} types - Logger types configuration. Each key is a log type with its options.
 * @param {?object} options - Global options for the logger.
 * @param {?number} options.indention - Indentation level for log labels.
 * @returns {object} - Logger instance with methods for each log type.
 */
export const createLogger = (types, options) => {
  const methods = Object.entries(types).reduce((methods, [typeName, typeOptions]) => {
    const isNestedInstance = typeOptions[IDENTIFIER] === true
    if (isNestedInstance === true) {
      return {
        ...methods,
        [typeName]: typeOptions,
      }
    }

    const { indention } = {
      ...defaultOptions,
      ...options,
    }

    const { color, badge, label, stack, streams } = {
      ...defaultTypeOptions,
      ...typeOptions,
    }

    const writer = write(streams)

    const spacing = '  '
    const prefix = badge + spacing + label.padEnd(indention) + spacing
    const coloredPrefix = chalk[color](prefix)
    const nestedPrefix = spacing

    const method = (message, ...substitutions) => {
      const blocks = flattenMessage(message)

      for (const [index, block] of blocks.entries()) {
        const firstBlock = index === 0
        const [firstLine, ...additionalLines] = flattenBlock(block, substitutions, stack)

        if (firstBlock) {
          // The first block always starts with the prefixed line,
          // followed by any additional lines (e.g. stack trace).
          writer(coloredPrefix, firstLine)

          for (const line of additionalLines) {
            writer(nestedPrefix, chalk.gray(line))
          }
        } else {
          // Add spacing between multiple blocks with stack traces,
          // for a better visual separation.
          if (stack === true) writer()

          // Any subsequent blocks are indented to indicate nesting,
          // with the first line in gray to indicate it's a continuation.
          writer(nestedPrefix, chalk.gray(firstLine))

          for (const line of additionalLines) {
            writer(nestedPrefix + nestedPrefix, chalk.gray(line))
          }
        }
      }
    }

    return {
      ...methods,
      [typeName]: method,
    }
  }, {})

  return {
    // Unique key used to identity logger instances
    [IDENTIFIER]: true,
    // Type methods
    ...methods,
  }
}
