<template>
	<ClientOnly>
		<div class="rich-text-editor">
			<div
				v-if="editor"
				class="toolbar"
			>
				<button
					type="button"
					:class="{ active: editor.isActive('bold') }"
					@click="editor.chain().focus().toggleBold().run()"
				>
					<Icon name="lucide:bold" />
				</button>
				<button
					type="button"
					:class="{ active: editor.isActive('italic') }"
					@click="editor.chain().focus().toggleItalic().run()"
				>
					<Icon name="lucide:italic" />
				</button>
				<button
					type="button"
					:class="{ active: editor.isActive('heading', { level: 1 }) }"
					@click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
				>
					H1
				</button>
				<button
					type="button"
					:class="{ active: editor.isActive('heading', { level: 2 }) }"
					@click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
				>
					H2
				</button>
				<button
					type="button"
					:class="{ active: editor.isActive('heading', { level: 3 }) }"
					@click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
				>
					H3
				</button>
				<button
					type="button"
					:class="{ active: editor.isActive('bulletList') }"
					@click="editor.chain().focus().toggleBulletList().run()"
				>
					<Icon name="lucide:list" />
				</button>
				<button
					type="button"
					:class="{ active: editor.isActive('orderedList') }"
					@click="editor.chain().focus().toggleOrderedList().run()"
				>
					<Icon name="lucide:list-ordered" />
				</button>
				<button
					type="button"
					:class="{ active: editor.isActive('link') }"
					@click="setLink"
				>
					<Icon name="lucide:link" />
				</button>
			</div>
			<EditorContent
				:editor="editor"
				class="content"
			/>
		</div>

		<template #fallback>
			<textarea
				class="fallback"
				rows="6"
				disabled
				:value="modelValue"
			/>
		</template>
	</ClientOnly>
</template>

<script setup lang="ts">
	import { EditorContent, useEditor } from '@tiptap/vue-3'
	import StarterKit from '@tiptap/starter-kit'
	import Link from '@tiptap/extension-link'

	const props = defineProps<{
		modelValue: string
	}>()

	const emit = defineEmits<{
		'update:modelValue': [value: string]
	}>()

	const editor = useEditor({
		content: props.modelValue,
		extensions: [StarterKit, Link.configure({ openOnClick: false })],
		onUpdate: ({ editor }) => {
			emit('update:modelValue', editor.getHTML())
		},
	})

	watch(
		() => props.modelValue,
		(value) => {
			if (editor.value && value !== editor.value.getHTML()) {
				editor.value.commands.setContent(value, { emitUpdate: false })
			}
		},
	)

	function setLink() {
		if (!editor.value) return
		const previousUrl = editor.value.getAttributes('link').href as string | undefined
		const url = window.prompt('URL', previousUrl ?? '')
		if (url === null) return
		if (url === '') {
			editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
			return
		}
		editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
	}
</script>

<style lang="scss" scoped>
	.rich-text-editor {
		display: flex;
		flex-direction: column;

		.toolbar {
			background: var(--surface-muted);
			border: 1px solid var(--text);
			border-bottom: none;
			border-radius: $radius-sm $radius-sm 0 0;
			display: flex;
			gap: 2px;
			padding: $space-xs;

			button {
				align-items: center;
				background: none;
				border: none;
				border-radius: $radius-sm;
				color: var(--text);
				cursor: pointer;
				display: flex;
				font-size: $text-sm;
				font-weight: $weight-semibold;
				height: 28px;
				justify-content: center;
				min-width: 28px;
				padding: 0 $space-xs;

				&:hover {
					background: var(--surface-hover);
				}

				&.active {
					background: var(--secondary);
					color: var(--surface);
				}
			}
		}

		.content {
			// stylelint-disable-next-line selector-class-pattern -- fixed class name from Tiptap/ProseMirror, not ours to rename
			:deep(.ProseMirror) {
				background: var(--surface);
				border: 1px solid var(--text);
				border-radius: 0 0 $radius-sm $radius-sm;
				font-family: $font-sans;
				font-size: $text-base;
				min-height: 8rem;
				padding: $space-sm;

				&:focus {
					outline: none;
				}

				p {
					margin-bottom: $space-xs;
				}

				h2,
				h3 {
					font-family: $font-display;
					font-weight: $weight-bold;
					margin-bottom: $space-xs;
				}

				ul,
				ol {
					margin-bottom: $space-xs;
					padding-left: $space-lg;
				}

				a {
					color: var(--link);
					text-decoration: underline;
				}
			}
		}
	}

	.fallback {
		background: var(--surface);
		border: 1px solid var(--text);
		border-radius: $radius-sm;
		font-family: $font-sans;
		font-size: $text-base;
		padding: $space-sm;
		width: 100%;
	}
</style>
