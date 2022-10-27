import util from 'node:util'
import fs from 'node:fs'
import chalk from 'chalk'
import figures from 'figures'

const IDENTIFIER = Symbol('IDENTIFIER')

const defaultOptions = {
	filter: () => true,
	indention: 0,
}

const defaultTypeOptions = {
	color: 'blue',
	badge: figures.info,
	label: 'info',
	stack: true,
}

const logMessageToConsole = (prefix, message, substitutions) => {
	console.log(`${prefix}  ${message}`, ...substitutions)
}

const logStackToConsole = (stack) => {
	const [, ...parsedStack] = stack.split('\n')
	const printableStack = parsedStack.join('\n')

	console.log(chalk.gray(printableStack))
}

const logMessageToFile = (file, message, substitutions) => {
	fs.appendFileSync(file, util.format(message, ...substitutions) + '\n')
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

		const { filter, indention } = {
			...defaultOptions,
			...options,
		}

		const { color, badge, label, stack, file } = {
			...defaultTypeOptions,
			...typeOptions,
		}

		const method = (message, ...substitutions) => {
			const included = filter(typeName) === true
			const prefix = chalk[color](badge + '  ' + label + ' '.repeat(Math.max(0, indention - label.length)))

			// Log message to console
			if (included === true) logMessageToConsole(prefix, message, substitutions)

			// Check if the message is an error with a stack
			const hasErrorStack = message instanceof Error && message.stack != null
			if (hasErrorStack === true && stack === true && included === true) logStackToConsole(message.stack)

			// Log message to file
			if (file != null) logMessageToFile(file, message, substitutions)
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
