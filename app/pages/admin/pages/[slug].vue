<template>
	<div class="admin-editor">
		<header class="editor-header">
			<NuxtLink
				to="/admin/pages"
				class="back"
			>
				← Pages
			</NuxtLink>
			<div class="title-group">
				<div class="input-field">
					<label for="page-name">Name</label>
					<input
						v-model="title"
						type="text"
						class="title-input"
						aria-label="Page title"
						id="page-name"
					/>
				</div>
				<div class="input-field">
					<label for="page-slug">Slug</label>
					<input
						v-model="slug"
						type="text"
						class="slug-input"
						aria-label="Page slug"
						placeholder="/about"
						id="page-slug"
					/>
				</div>
				<div class="input-field">
					<label for="page-parent">Parent page</label>
					<select
						id="page-parent"
						v-model="parentId"
						class="parent-input"
						aria-label="Parent page"
					>
						<option value="">— Top level —</option>
						<option
							v-for="opt in parentOptions"
							:key="opt.page.id"
							:value="opt.page.id"
						>
							{{ '— '.repeat(opt.depth) }}{{ opt.page.title }}
						</option>
					</select>
				</div>
			</div>
			<button
				type="button"
				class="btn primary"
				:disabled="saving"
				@click="save"
			>
				{{ saving ? 'Saving…' : 'Save' }}
			</button>
		</header>

		<p
			v-if="slugChanged"
			class="slug-warning"
		>
			Changing the slug won't update any menu links that already point to
			{{ originalSlug }}
			— you'll need to fix those manually.
		</p>

		<div class="editor-body">
			<BlockPicker class="col picker" />
			<BlockCanvas
				class="col canvas"
				:blocks="blocks"
				:selected-block-id="selectedBlockId"
				@update:blocks="(value) => (blocks = value)"
				@select="selectBlock"
				@remove="removeBlock"
			/>
			<BlockInspector
				class="col inspector"
				:block="selectedBlock"
				@update-prop="(name, value) => selectedBlock && updateBlockProp(selectedBlock.id, name, value)"
				@update-dark-theme="(value) => selectedBlock && updateBlockDarkTheme(selectedBlock.id, value)"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { PageRecord, PageSummary } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const route = useRoute()
	// Vue Router already decodes the route param (e.g. "%2Ftest" -> "/test"),
	// so it has to be re-encoded before it's used as the API's :slug segment.
	const encodedSlug = encodeURIComponent(route.params.slug as string)

	const { data: page } = await useFetch<PageRecord>(`/api/pages/${encodedSlug}`)

	if (!page.value) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	// Only needed to populate the "Parent page" dropdown — excludes this page
	// (and, as a side effect of flattenPageTree never recursing into it, its
	// whole subtree too) so it can't be set as its own ancestor. Explicit key
	// — see the comment in admin/index.vue's dashboard fetch for why: this
	// same URL is also fetched (with its own distinct key) from the
	// dashboard and the pages list.
	const { data: allPages } = await useFetch<PageSummary[]>('/api/pages', { key: 'admin-pages-editor-parent-options' })
	const parentOptions = computed(() => {
		const pages = allPages.value ?? []
		const childrenByParent = groupPagesByParent(pages)
		const topLevel = sortPageSiblings(childrenByParent.get(null) ?? [])
		return flattenPageTree(topLevel, childrenByParent, { excludeId: page.value!.id })
	})

	const { blocks, selectedBlockId, selectedBlock, removeBlock, updateBlockProp, updateBlockDarkTheme, selectBlock } =
		usePageBlocks(page.value.blocks)
	const title = ref(page.value.title)
	const originalSlug = page.value.slug
	const slug = ref(page.value.slug)
	const slugChanged = computed(() => slug.value !== originalSlug)
	const parentId = ref(page.value.parent_id ?? '')

	const saving = ref(false)
	const toast = useToast()

	const dirty = ref(false)
	watch(blocks, () => (dirty.value = true), { deep: true })
	watch(title, () => (dirty.value = true))
	watch(slug, () => (dirty.value = true))
	watch(parentId, () => (dirty.value = true))
	useUnsavedChanges(dirty)

	async function save() {
		saving.value = true
		try {
			const updated = await $fetch<PageRecord>(`/api/pages/${encodedSlug}`, {
				method: 'PUT',
				body: { title: title.value, slug: slug.value, blocks: blocks.value, parent_id: parentId.value || null },
			})
			toast.show('Saved.')
			dirty.value = false
			if (updated.slug !== route.params.slug) {
				await navigateTo(`/admin/pages/${encodeURIComponent(updated.slug)}`, { replace: true })
			}
		} catch (err: any) {
			toast.show(err?.data?.statusMessage ?? 'Could not save page', 'error')
		} finally {
			saving.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.admin-editor {
		display: flex;
		flex-direction: column;
		height: 100dvh;

		.editor-header {
			align-items: center;
			border-bottom: 2px solid var(--border);
			display: flex;
			gap: $space-md;
			padding: $space-sm $space-lg;

			.back {
				color: var(--text-muted);
				font-size: $text-sm;
				font-weight: $weight-semibold;
			}

			.title-group {
				display: flex;
				flex: 1;
				flex-direction: row;
				gap: $space-md;
				margin-left: 3rem;
				width: 100%;

				.input-field {
					display: flex;
					flex-direction: column;
					gap: 0;

					label {
						color: var(--text);
						font-size: $text-sm;
						font-weight: $weight-semibold;
					}
				}
			}

			.title-input,
			.slug-input,
			.parent-input {
				background: var(--surface);
				border: 2px solid transparent;
				border-radius: $radius-sm;
				font-family: $font-display;
				height: 100%;
				padding: $space-xs $space-sm;

				&:hover,
				&:focus {
					border-color: var(--border);
				}

				&:focus {
					border-color: var(--secondary);
					outline: none;
				}
			}

			.title-input {
				font-size: $text-lg;
				font-weight: $weight-bold;
			}

			.slug-input,
			.parent-input {
				color: var(--text-muted);
				font-size: $text-sm;
			}

			.parent-input {
				max-width: 12rem;
			}
		}

		.slug-warning {
			background: var(--warning-bg);
			color: var(--warning);
			font-size: $text-sm;
			padding: $space-xs $space-lg;
		}

		.editor-body {
			display: grid;
			flex: 1;
			grid-template-columns: 240px 1fr 320px;
			min-height: 0;
		}

		.col {
			// Grid items default to min-height: auto (won't shrink below content),
			// which silently defeats overflow-y: auto — this is what actually lets
			// a tall block scroll instead of just growing past the viewport.
			min-height: 0;
			overflow-y: auto;
			padding: $space-lg;

			&.picker {
				border-right: 2px solid var(--border);
			}

			&.canvas {
				background: var(--bg-alt);
			}

			&.inspector {
				border-left: 2px solid var(--border);
			}
		}
	}
</style>
