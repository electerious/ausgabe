import util from 'node:util'
import chalk from 'chalk'

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
 * Parses a message and its substitutions.
 * If the message is an Error, extracts the message and stack trace.
 *
 * @param {any} message - The message to parse that may contain zero or more substitution strings.
 * @param {...any} substitutions - Data with which to replace substitution strings within `message`.
 * @returns {[string, string[]]} - Parsed message and stack trace (if applicable).
 */
const parse = (message, ...substitutions) => {
	if (message instanceof Error) {
		const parsedMessage = message.message
		const parsedStack = message.stack ?? ''

		return [parsedMessage, parsedStack.split('\n').slice(1)]
	}

	return [util.format(message, ...substitutions), []]
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
		streams.forEach((stream) => {
			stream.write(`${messages.join('')} \n`)
		})
	}

/**
 * Creates a logger instance with the specified types and options.
 *
 * @param {object} types - Logger types configuration. Each key is a log type with its options.
 * @param {object} [options] - Global options for the logger.
 * @param {number} [options.indention=0] - Indentation level for log labels.
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
		const prefix = chalk[color](badge + spacing + label.padEnd(indention) + spacing)

		const method = (message, ...substitutions) => {
			const [parsedMessage, parsedStack] = parse(message, ...substitutions)

			writer(prefix, parsedMessage)
			if (stack === true) parsedStack.forEach((line) => writer(chalk.gray(line)))
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
