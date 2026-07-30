import sanitizeHtml from 'sanitize-html'
import type { Block } from '#shared/types/cms'

// Cheap pre-check so plain strings (titles, urls, alt text, etc.) never get
// round-tripped through the HTML parser/serializer — that round trip
// re-encodes entities (e.g. "Tom & Jerry" -> "Tom &amp; Jerry"), which would
// corrupt any plain-text field containing &, <, or ". Only strings that
// actually look like they contain a tag pay that cost.
const LOOKS_LIKE_HTML = /<[a-z][\s\S]*>/i

// Matches the marks/nodes RichTextEditor.vue's Tiptap config (StarterKit +
// Link) can actually produce. Anything else — script, style, iframe, event
// handler attributes, svg, etc. — gets stripped.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
	allowedTags: [
		'p',
		'br',
		'strong',
		'b',
		'em',
		'i',
		's',
		'strike',
		'ul',
		'ol',
		'li',
		'blockquote',
		'code',
		'pre',
		'hr',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'a',
	],
	allowedAttributes: { a: ['href', 'target', 'rel'] },
	allowedSchemes: ['http', 'https', 'mailto', 'tel'],
}

function sanitizeValue(value: unknown): unknown {
	if (typeof value === 'string') {
		return LOOKS_LIKE_HTML.test(value) ? sanitizeHtml(value, SANITIZE_OPTIONS) : value
	}
	if (Array.isArray(value)) {
		return value.map(sanitizeValue)
	}
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, sanitizeValue(v)]))
	}
	return value
}

// Applied to every string in a block's props — not just today's known
// richtext field names — so a future block with a new richtext field is
// covered automatically instead of silently bypassing an allowlist that
// nobody remembered to update.
export function sanitizeBlocks(blocks: Block[]): Block[] {
	return blocks.map((block) => ({
		...block,
		props: sanitizeValue(block.props) as Record<string, unknown>,
	}))
}
