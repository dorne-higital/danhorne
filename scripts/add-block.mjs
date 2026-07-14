#!/usr/bin/env node
// Interactive scaffolder for content-blocks/. Run with `yarn add-block`.
// Prompts for a block name + fields, then writes <Name>.schema.ts and
// <Name>.vue matching the conventions of the existing blocks. The registry
// (content-blocks/registry.ts) auto-globs every */*.schema.ts file, so
// nothing else needs registering.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline/promises'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()
const BLOCKS_DIR = join(ROOT, 'content-blocks')
const FIELD_TYPES = ['text', 'richtext', 'image', 'number', 'select', 'boolean', 'repeater']

const rl = createInterface({ input: stdin, output: stdout })
const ask = async (question) => (await rl.question(question)).trim()

function toPascalCase(input) {
	return input
		.replace(/[_\-\s]+/g, ' ')
		.trim()
		.split(' ')
		.filter(Boolean)
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join('')
		.replace(/[^a-zA-Z0-9]/g, '')
}

function toCamelCase(input) {
	const pascal = toPascalCase(input)
	return pascal ? pascal[0].toLowerCase() + pascal.slice(1) : ''
}

function toKebabCase(pascal) {
	return pascal.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function humanize(name) {
	const spaced = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
	return spaced[0].toUpperCase() + spaced.slice(1)
}

function existingGroups() {
	const groups = new Set()
	for (const entry of readdirSync(BLOCKS_DIR, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue
		const schemaPath = join(BLOCKS_DIR, entry.name, `${entry.name}.schema.ts`)
		if (!existsSync(schemaPath)) continue
		const match = readFileSync(schemaPath, 'utf8').match(/group:\s*'([^']+)'/)
		if (match) groups.add(match[1])
	}
	return [...groups]
}

async function promptField(nested) {
	console.log(`\n${nested ? '  ' : ''}-- Field${nested ? ' (repeater item)' : ''} — blank name to finish --`)
	const rawName = await ask(`${nested ? '  ' : ''}Field name (camelCase): `)
	if (!rawName) return null
	const name = toCamelCase(rawName)

	const defaultLabel = humanize(name)
	const label = (await ask(`${nested ? '  ' : ''}Label [${defaultLabel}]: `)) || defaultLabel

	const types = nested ? FIELD_TYPES.filter((type) => type !== 'repeater') : FIELD_TYPES
	console.log(`${nested ? '  ' : ''}Type: ${types.map((type, i) => `${i + 1}) ${type}`).join('  ')}`)
	let type
	while (true) {
		const raw = await ask(`${nested ? '  ' : ''}Choose 1-${types.length} [1=text]: `)
		const index = raw ? Number(raw) - 1 : 0
		if (types[index]) {
			type = types[index]
			break
		}
		console.log(`${nested ? '  ' : ''}Invalid choice.`)
	}

	const field = { name, label, type }

	if (type === 'select') {
		const raw = await ask(`${nested ? '  ' : ''}Options as label:value, comma-separated (e.g. Left:left,Center:center): `)
		field.options = raw
			.split(',')
			.map((pair) => pair.trim())
			.filter(Boolean)
			.map((pair) => {
				const [optLabel, optValue] = pair.split(':').map((part) => part.trim())
				return { label: optLabel, value: optValue || toKebabCase(toPascalCase(optLabel)) }
			})
		field.default = field.options[0]?.value ?? ''
	} else if (type === 'boolean') {
		const raw = await ask(`${nested ? '  ' : ''}Default (y/N): `)
		field.default = /^y/i.test(raw)
	} else if (type === 'number') {
		const raw = await ask(`${nested ? '  ' : ''}Default [0]: `)
		field.default = raw ? Number(raw) : 0
	} else if (type === 'repeater') {
		console.log(`${nested ? '  ' : ''}Define the fields for each repeater item:`)
		const subFields = []
		let sub
		while ((sub = await promptField(true))) subFields.push(sub)
		field.fields = subFields
		field.default = []
	} else {
		field.default = await ask(`${nested ? '  ' : ''}Default text [""]: `)
	}

	return field
}

function serializeField(field, indent) {
	const pad = '\t'.repeat(indent)
	const parts = [`name: '${field.name}'`, `label: '${field.label}'`, `type: '${field.type}'`]

	if (field.options) {
		const opts = field.options.map((o) => `{ label: '${o.label}', value: '${o.value}' }`).join(', ')
		parts.push(`options: [${opts}]`)
	}

	if (field.type === 'repeater') {
		const subFields = field.fields.map((f) => serializeField(f, indent + 1)).join(',\n')
		parts.push(`fields: [\n${subFields},\n${pad}]`)
		return `${pad}{ ${parts.join(', ')} }`
	}

	parts.push(`default: ${JSON.stringify(field.default)}`)
	return `${pad}{ ${parts.join(', ')} }`
}

function buildSchema(name, label, group, fields) {
	const fieldLines = fields.map((f) => serializeField(f, 2)).join(',\n')
	return `import type { BlockSchema } from '#shared/types/cms'

export default {
	type: '${name}',
	label: '${label}',
	group: '${group}',
	fields: [
${fieldLines}${fields.length ? ',' : ''}
	],
} satisfies BlockSchema
`
}

function tsType(field) {
	switch (field.type) {
		case 'number':
			return 'number'
		case 'boolean':
			return 'boolean'
		case 'select':
			return field.options?.length ? field.options.map((o) => `'${o.value}'`).join(' | ') : 'string'
		case 'repeater': {
			const subProps = field.fields.map((f) => `${f.name}?: ${tsType(f)}`).join('; ')
			return `{ id: string${subProps ? `; ${subProps}` : ''} }[]`
		}
		default:
			return 'string'
	}
}

function defaultLiteral(field) {
	switch (field.type) {
		case 'boolean':
			return String(field.default)
		case 'number':
			return String(field.default)
		case 'repeater':
			return '() => []'
		case 'select':
			return `'${field.default}'`
		default:
			return `'${String(field.default).replace(/'/g, "\\'")}'`
	}
}

// Fields named `<imageField>Alt` pair with an image field as its alt text —
// rendered as the image's :alt rather than as their own element, matching
// the pattern already used by Hero/SplitHero/ImageGallery.
function altCompanionNames(fields) {
	const imageNames = new Set(fields.filter((f) => f.type === 'image').map((f) => f.name))
	return new Set(fields.filter((f) => imageNames.has(f.name.replace(/Alt$/, '')) && f.name.endsWith('Alt')).map((f) => f.name))
}

function renderField(field, fields, accessor) {
	const value = `${accessor}${field.name}`
	switch (field.type) {
		case 'text':
			return `<p v-if="${value}">{{ ${value} }}</p>`
		case 'richtext':
			return `<!-- eslint-disable-next-line vue/no-v-html -->\n<div v-if="${value}" class="${field.name}" v-html="${value}" />`
		case 'number':
			return `<span v-if="${value}">{{ ${value} }}</span>`
		case 'image': {
			const altName = `${field.name}Alt`
			const hasAlt = fields.some((f) => f.name === altName)
			const altExpr = hasAlt ? `${accessor}${altName}` : `'${field.label}'`
			return `<NuxtImg\n\tv-if="${value}"\n\tclass="${field.name}"\n\t:src="${value}"\n\t:alt="${altExpr}"\n\tloading="lazy"\n/>`
		}
		case 'repeater': {
			const renderable = field.fields.filter((f) => f.type !== 'select' && f.type !== 'boolean')
			const subRenders = renderable.map((f) => renderField(f, field.fields, 'item.')).join('\n')
			return `<div v-if="${value}.length" class="${field.name}">\n\t<div\n\t\tv-for="item in ${value}"\n\t\t:key="item.id"\n\t\tclass="${field.name}-item"\n\t>\n${indentLines(subRenders, 2)}\n\t</div>\n</div>`
		}
		default:
			return null
	}
}

function indentLines(text, levels) {
	const pad = '\t'.repeat(levels)
	return text
		.split('\n')
		.map((line) => (line ? pad + line : line))
		.join('\n')
}

function buildVue(name, kebab, fields) {
	const altCompanions = altCompanionNames(fields)
	const rendered = fields
		.filter((f) => !altCompanions.has(f.name))
		.map((f) => renderField(f, fields, ''))
		.filter(Boolean)
	const skipped = fields.filter((f) => (f.type === 'select' || f.type === 'boolean') && !altCompanions.has(f.name))

	const templateBody = rendered.length
		? indentLines(rendered.join('\n\n'), 2)
		: '\t\t<!-- add markup here -->'

	const skipComment = skipped.length
		? `\n\t\t<!-- not auto-rendered — wire up manually: ${skipped.map((f) => f.name).join(', ')} -->`
		: ''

	const propLines = fields.map((f) => `\t\t\t${f.name}?: ${tsType(f)}`).join('\n')
	const defaultLines = fields.map((f) => `\t\t\t${f.name}: ${defaultLiteral(f)},`).join('\n')

	return `<template>
	<section class="cb-${kebab}">
		<div class="sw">
${templateBody}${skipComment}
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
${propLines}
		}>(),
		{
${defaultLines}
		},
	)
</script>

<style lang="scss" scoped>
	.cb-${kebab} {
		padding-block: $space-xl;
	}
</style>
`
}

async function main() {
	console.log('New content block\n')

	let name
	while (true) {
		const raw = await ask('Block name (PascalCase, e.g. Testimonials): ')
		const candidate = toPascalCase(raw)
		if (!candidate) {
			console.log('Name required.')
			continue
		}
		if (existsSync(join(BLOCKS_DIR, candidate))) {
			console.log(`content-blocks/${candidate} already exists.`)
			continue
		}
		name = candidate
		break
	}

	const defaultLabel = humanize(name)
	const label = (await ask(`Label [${defaultLabel}]: `)) || defaultLabel

	const groups = existingGroups()
	console.log(`Existing groups: ${groups.join(', ') || '(none yet)'}`)
	const group = (await ask('Group [Other]: ')) || 'Other'

	console.log('\nNow add fields (blank name to finish):')
	const fields = []
	let field
	while ((field = await promptField(false))) fields.push(field)

	rl.close()

	const dir = join(BLOCKS_DIR, name)
	mkdirSync(dir, { recursive: true })

	const kebab = toKebabCase(name)
	writeFileSync(join(dir, `${name}.schema.ts`), buildSchema(name, label, group, fields))
	writeFileSync(join(dir, `${name}.vue`), buildVue(name, kebab, fields))

	console.log(`\nWrote content-blocks/${name}/${name}.schema.ts and ${name}.vue`)

	try {
		execFileSync('npx', ['prettier', '--write', `content-blocks/${name}`], { stdio: 'inherit' })
		execFileSync('npx', ['stylelint', `content-blocks/${name}/**/*.vue`, '--fix'], { stdio: 'inherit', shell: true })
	} catch {
		console.log('\nFormatting/lint step hit an issue — run `yarn format` and `yarn lint:css:fix` manually.')
	}

	console.log(`\nDone. Edit content-blocks/${name}/${name}.vue to finish the markup/styles, then it'll show up in the block picker automatically.`)
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
