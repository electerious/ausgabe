import util from 'node:util'
import chalk from 'chalk'
import figures from 'figures'

const IDENTIFIER = Symbol('IDENTIFIER')

const defaultOptions = {
	indention: 0,
}

const defaultTypeOptions = {
	color: 'blue',
	badge: figures.info,
	label: 'info',
	stack: true,
	streams: [process.stdout],
}

const parse = (message, ...substitutions) => {
	if (message instanceof Error) {
		const parsedMessage = message.message
		const parsedStack = message.stack ?? ''

		return [parsedMessage, parsedStack.split('\n').slice(1)]
	}

	return [util.format(message, ...substitutions), []]
}

const write =
	(streams) =>
	(...messages) => {
		streams.forEach((stream) => {
			stream.write(`${messages.join('')} \n`)
		})
	}

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
