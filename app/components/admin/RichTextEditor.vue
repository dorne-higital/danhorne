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
			background: var(--bg-secondary);
			border: 1px solid var(--text-primary);
			border-bottom: none;
			border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
			display: flex;
			gap: 2px;
			padding: var(--padding-xs);

			button {
				align-items: center;
				background: none;
				border: none;
				border-radius: var(--border-radius-sm);
				color: var(--text-primary);
				cursor: pointer;
				display: flex;
				font-size: var(--button-size);
				font-weight: var(--button-font-weight);
				height: 28px;
				justify-content: center;
				min-width: 28px;
				padding: 0 var(--padding-xs);

				&:hover {
					background: var(--bg-secondary);
				}

				&.active {
					background: var(--brand-secondary);
					color: var(--bg-secondary);
				}
			}
		}

		.content {
			// stylelint-disable-next-line selector-class-pattern -- fixed class name from Tiptap/ProseMirror, not ours to rename
			:deep(.ProseMirror) {
				background: var(--bg-secondary);
				border: 1px solid var(--text-primary);
				border-radius: 0 0 var(--border-radius-sm) var(--border-radius-sm);
				font-family: var(--body-font-family);
				font-size: var(--body-size);
				min-height: 8rem;
				padding: var(--padding-sm);

				&:focus {
					outline: none;
				}

				p {
					margin-bottom: var(--padding-xs);
				}

				h2,
				h3 {
					font-family: var(--heading-font-family);
					font-weight: var(--heading-font-weight);
					margin-bottom: var(--padding-xs);
				}

				ul,
				ol {
					margin-bottom: var(--padding-xs);
					padding-left: var(--padding-lg);
				}

				a {
					color: var(--link);
					text-decoration: underline;
				}
			}
		}
	}

	.fallback {
		background: var(--bg-secondary);
		border: 1px solid var(--text-primary);
		border-radius: var(--border-radius-sm);
		font-family: var(--body-font-family);
		font-size: var(--body-size);
		padding: var(--padding-sm);
		width: 100%;
	}
</style>
