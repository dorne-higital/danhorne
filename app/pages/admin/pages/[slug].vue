<template>
	<div class="admin-editor">
		<header class="editor-header">
			<!-- Deliberately a plain <a>, not <NuxtLink> — this exact transition
			(editor -> pages list) has broken via SPA client-side navigation
			three separate times for three unrelated reasons this session. A
			real browser navigation always works, full stop; not worth
			chasing a fourth cause. -->
			<a
				href="/admin/pages"
				class="back"
			>
				← Pages
			</a>
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
			<div class="actions">
				<div class="status-group">
					<span :class="['status-badge', status]">
						{{ status === 'published' ? 'Published' : 'Draft' }}
					</span>
					<span
						v-if="status === 'published' && hasDraftChanges"
						class="pending-badge"
					>
						Unpublished changes
					</span>
					<button
						v-if="status === 'published'"
						type="button"
						class="icon-btn"
						title="Unpublish"
						aria-label="Unpublish this page"
						:disabled="unpublishing"
						@click="unpublish"
					>
						<Icon name="lucide:eye-off" />
					</button>
				</div>

				<a
					:href="previewUrl"
					target="_blank"
					rel="noopener"
					class="icon-btn"
					title="Preview"
					aria-label="Preview draft in a new tab"
				>
					<Icon name="lucide:external-link" />
				</a>
				<button
					type="button"
					class="icon-btn"
					:class="{ locked: !pageHistoryEnabled }"
					:title="pageHistoryEnabled ? 'Version history' : 'Version history — premium feature'"
					:aria-label="pageHistoryEnabled ? 'Version history' : 'Version history — premium feature'"
					@click="openHistory"
				>
					<Icon :name="pageHistoryEnabled ? 'lucide:history' : 'lucide:lock'" />
				</button>
				<button
					type="button"
					class="btn outline"
					:disabled="saving"
					@click="save"
				>
					{{ saving ? 'Saving…' : 'Save draft' }}
				</button>
				<button
					type="button"
					class="btn primary"
					:disabled="publishing || (status === 'published' && !hasDraftChanges)"
					@click="publish"
				>
					{{ publishing ? 'Publishing…' : status === 'draft' ? 'Publish' : 'Publish changes' }}
				</button>
			</div>
		</header>

		<PageHistoryModal
			:open="historyOpen"
			:slug="originalSlug"
			@update:open="(value) => (historyOpen = value)"
			@restored="onRestored"
		/>

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
	import type { PageRecord, PageStatus, PageSummary } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const route = useRoute()
	const encodedSlug = encodeURIComponent(route.params.slug as string)

	const { data: page } = await useFetch<PageRecord>(`/api/pages/${encodedSlug}`)

	if (!page.value) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}

	const { data: allPages } = await useFetch<PageSummary[]>('/api/pages', { key: 'admin-pages-editor-parent-options' })
	const parentOptions = computed(() => {
		const pages = allPages.value ?? []
		const childrenByParent = groupPagesByParent(pages)
		const topLevel = sortPageSiblings(childrenByParent.get(null) ?? [])
		return flattenPageTree(topLevel, childrenByParent, { excludeId: page.value!.id })
	})

	// title/blocks are the working draft, not what's live — Save persists
	// them here, Publish is what actually pushes them out.
	const { blocks, selectedBlockId, selectedBlock, removeBlock, updateBlockProp, updateBlockDarkTheme, selectBlock } =
		usePageBlocks(page.value.draft_blocks!)
	const title = ref(page.value.draft_title!)
	const originalSlug = page.value.slug
	const slug = ref(page.value.slug)
	const slugChanged = computed(() => slug.value !== originalSlug)
	const parentId = ref(page.value.parent_id ?? '')
	const status = ref<PageStatus>(page.value.status)
	const previewToken = page.value.preview_token

	// What's actually live right now — compared against title/blocks below
	// to know whether there's anything worth publishing. Updated after a
	// successful Publish so the comparison stays accurate going forward.
	const publishedTitle = ref(page.value.title)
	const publishedBlocks = ref(structuredClone(page.value.blocks))
	const hasDraftChanges = computed(
		() =>
			title.value !== publishedTitle.value ||
			JSON.stringify(blocks.value) !== JSON.stringify(publishedBlocks.value),
	)

	// Always includes the preview token — for a published page this is what
	// shows pending draft changes rather than what's already live.
	const previewUrl = computed(() => `${originalSlug}?preview=${previewToken}`)

	const saving = ref(false)
	const publishing = ref(false)
	const unpublishing = ref(false)
	const historyOpen = ref(false)
	const toast = useToast()
	const { confirm } = useConfirm()

	const { data: settings } = await useSiteSettings()
	const pageHistoryEnabled = computed(() => isFeatureEnabled('pageHistory', settings.value?.enabled_features))

	function openHistory() {
		if (!pageHistoryEnabled.value) {
			navigateTo('/admin/integrations')
			return
		}
		historyOpen.value = true
	}

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
				body: {
					title: title.value,
					slug: slug.value,
					blocks: blocks.value,
					parent_id: parentId.value || null,
				},
			})
			toast.show('Draft saved.')
			dirty.value = false
			if (updated.slug !== route.params.slug) {
				await navigateTo(`/admin/pages/${encodeURIComponent(updated.slug)}`, { replace: true })
			}
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not save page'), 'error')
		} finally {
			saving.value = false
		}
	}

	async function publish() {
		publishing.value = true
		try {
			const updated = await $fetch<PageRecord>(`/api/pages/${encodedSlug}/publish`, { method: 'POST' })
			status.value = updated.status
			publishedTitle.value = updated.title
			publishedBlocks.value = structuredClone(updated.blocks)
			toast.show('Published.')
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not publish'), 'error')
		} finally {
			publishing.value = false
		}
	}

	async function unpublish() {
		if (
			!(await confirm('Unpublish this page? It will stop being visible to visitors until you publish it again.', {
				title: 'Unpublish page',
				confirmLabel: 'Unpublish',
				danger: true,
			}))
		)
			return
		unpublishing.value = true
		try {
			const updated = await $fetch<PageRecord>(`/api/pages/${encodedSlug}`, {
				method: 'PUT',
				body: { status: 'draft' },
			})
			status.value = updated.status
			toast.show('Unpublished.')
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not unpublish'), 'error')
		} finally {
			unpublishing.value = false
		}
	}

	// The restore endpoint writes straight into the draft (unlike normal
	// edits, which only land on the next Save) — sync local state to match
	// and clear dirty, since there's nothing left to save.
	function onRestored(restored: PageRecord) {
		title.value = restored.draft_title!
		blocks.value = structuredClone(restored.draft_blocks!)
		dirty.value = false
	}
</script>

<style lang="scss" scoped>
	.admin-editor {
		display: flex;
		flex-direction: column;
		height: 100dvh;

		.editor-header {
			align-items: center;
			border-bottom: 1px solid var(--border);
			display: flex;
			gap: var(--padding-md);
			padding: var(--padding-sm) var(--padding-lg);

			.back {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				font-weight: 600;
			}

			.title-group {
				display: flex;
				flex: 1;
				flex-direction: row;
				gap: var(--padding-md);
				margin-left: 3rem;
				min-width: 0;

				.input-field {
					display: flex;
					flex-direction: column;
					gap: 0;
					min-width: 0;

					label {
						color: var(--text-primary);
						font-size: var(--eyebrow-size);
						font-weight: 600;
					}
				}
			}

			.actions {
				align-items: center;
				display: flex;
				flex-shrink: 0;
				gap: var(--padding-sm);

				.btn {
					white-space: nowrap;
				}
			}

			.title-input,
			.slug-input,
			.parent-input {
				background: var(--bg-secondary);
				border: 1px solid transparent;
				border-radius: var(--border-radius-sm);
				font-family: var(--heading-font-family);
				height: 100%;
				padding: var(--padding-xs) var(--padding-sm);

				&:hover,
				&:focus {
					border-color: var(--border);
				}

				&:focus {
					border-color: var(--brand-secondary);
				}

				&:focus-visible {
					outline: 2px solid var(--brand-secondary);
					outline-offset: 2px;
				}
			}

			.title-input {
				font-size: 1.25rem;
				font-weight: var(--heading-font-weight);
			}

			.slug-input,
			.parent-input {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
			}

			.parent-input {
				max-width: 12rem;
			}
		}

		.slug-warning {
			background: var(--warning-bg);
			color: var(--warning);
			font-size: var(--eyebrow-size);
			padding: var(--padding-xs) var(--padding-lg);
		}

		.editor-body {
			display: grid;
			flex: 1;
			grid-template-columns: 240px 1fr 320px;
			min-height: 0;
		}

		.col {
			min-height: 0;
			overflow-y: auto;
			padding: var(--padding-lg);

			&.picker {
				border-right: 1px solid var(--border);
			}

			&.canvas {
				background: var(--bg-secondary);
			}

			&.inspector {
				border-left: 1px solid var(--border);
			}
		}
	}

	.status-group {
		align-items: center;
		display: flex;
		gap: var(--padding-xs);
	}

	.status-badge {
		border-radius: var(--border-radius-sm);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		padding: 0.0625rem 0.5rem;
		text-transform: uppercase;

		&.published {
			background: var(--success-bg);
			color: var(--success);
		}

		&.draft {
			background: var(--warning-bg);
			color: var(--warning);
		}
	}

	.pending-badge {
		background: var(--warning-bg);
		border-radius: var(--border-radius-sm);
		color: var(--warning);
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 0.0625rem 0.5rem;
	}

	.icon-btn {
		align-items: center;
		background: none;
		border: 1px solid var(--border);
		border-radius: var(--border-radius-sm);
		color: var(--text-secondary);
		cursor: pointer;
		display: inline-flex;
		flex-shrink: 0;
		height: 2.25rem;
		justify-content: center;
		width: 2.25rem;

		svg {
			height: 1.125rem;
			width: 1.125rem;
		}

		&:hover {
			background: var(--bg-secondary);
			color: var(--text-primary);
		}

		&:disabled {
			cursor: default;
			opacity: 0.5;
		}

		&.locked {
			opacity: 0.7;
		}
	}
</style>
