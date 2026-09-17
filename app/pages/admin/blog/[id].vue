<template>
	<div class="admin-post-editor">
		<header class="editor-header">
			<a
				href="/admin/blog"
				class="back"
			>
				← Blog
			</a>
			<div class="title-group">
				<div class="input-field">
					<label for="post-title">Title</label>
					<input
						id="post-title"
						v-model="title"
						type="text"
						class="title-input"
						aria-label="Post title"
					/>
				</div>
				<div class="input-field">
					<label for="post-slug">Slug</label>
					<input
						id="post-slug"
						v-model="slug"
						type="text"
						class="slug-input"
						placeholder="how-we-built-our-new-site"
						aria-label="Post slug"
						@input="slugTouched = true"
					/>
				</div>
				<div class="input-field">
					<label for="post-status">Status</label>
					<select
						id="post-status"
						v-model="status"
						class="status-input"
					>
						<option value="draft">Draft</option>
						<option value="published">Published</option>
					</select>
				</div>
			</div>
			<div class="actions">
				<a
					:href="`/blog/${slug}`"
					target="_blank"
					rel="noopener"
					class="icon-btn"
					title="View"
					aria-label="View post in a new tab"
				>
					<Icon name="lucide:external-link" />
				</a>
				<button
					type="button"
					class="link-btn danger"
					@click="deletePost"
				>
					Delete
				</button>
				<button
					type="button"
					class="btn primary"
					:disabled="saving"
					@click="save"
				>
					{{ saving ? 'Saving…' : 'Save' }}
				</button>
			</div>
		</header>

		<div class="editor-body">
			<BlockPicker class="col picker" />
			<div class="col canvas">
				<div class="hero-preview">
					<p class="hero-preview-label">
						Hero — shown automatically above your blocks from the fields on the right. No need to add
						another hero block below.
					</p>
					<ScaledBlockPreview>
						<PostHero
							:post="previewPost"
							:formatted-date="previewFormattedDate"
						/>
					</ScaledBlockPreview>
				</div>
				<BlockCanvas
					:blocks="blocks"
					:selected-block-id="selectedBlockId"
					@update:blocks="(value) => (blocks = value)"
					@select="selectBlock"
					@remove="removeBlock"
				/>
			</div>
			<BlockInspector
				v-if="selectedBlock"
				class="col inspector"
				:block="selectedBlock"
				@update-prop="(name, value) => selectedBlock && updateBlockProp(selectedBlock.id, name, value)"
				@update-dark-theme="(value) => selectedBlock && updateBlockDarkTheme(selectedBlock.id, value)"
				@update-surface="(value) => selectedBlock && updateBlockSurface(selectedBlock.id, value)"
			/>
			<PostSettingsPanel
				v-else
				class="col inspector"
				:title="title"
				v-model:excerpt="excerpt"
				v-model:category="category"
				v-model:tags-input="tagsInput"
				v-model:read-time="readTime"
				v-model:published-at-input="publishedAtInput"
				v-model:sort-order="sortOrder"
				v-model:author-name="authorName"
				v-model:author-photo="authorPhoto"
				v-model:cover-image="coverImage"
				v-model:seo-title="seoTitle"
				v-model:seo-description="seoDescription"
				v-model:seo-keywords="seoKeywords"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { Post, PostStatus } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const route = useRoute()
	const id = route.params.id as string

	// Its own key (not shared with the list page's 'admin-blog-list') — see
	// server/api/posts/[id].get.ts for why.
	const { data: post } = await useFetch<Post>(`/api/posts/${id}`, {
		key: `admin-blog-${id}`,
	})

	if (!post.value) {
		throw createError({ statusCode: 404, statusMessage: 'Post not found' })
	}

	const { blocks, selectedBlockId, selectedBlock, removeBlock, updateBlockProp, updateBlockDarkTheme, updateBlockSurface, selectBlock } =
		usePageBlocks(post.value.blocks)

	const title = ref(post.value.title)
	const excerpt = ref(post.value.excerpt ?? '')
	const category = ref(post.value.category ?? '')
	const authorName = ref(post.value.author_name ?? '')
	const authorPhoto = ref(post.value.author_photo ?? '')
	const readTime = ref(post.value.read_time ?? '')
	const status = ref<PostStatus>(post.value.status)
	const sortOrder = ref(post.value.sort_order)
	const coverImage = ref(post.value.cover_image ?? '')
	const tagsInput = ref(post.value.tags.join(', '))
	const tags = computed(() =>
		tagsInput.value
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean),
	)
	const publishedAtInput = ref(post.value.published_at ? post.value.published_at.slice(0, 10) : '')

	// Single path segment — always auto-fills from the title for a post
	// that's never had its slug hand-edited, same reasoning as
	// admin/portfolio/[id].vue's slugTouched (an existing slug counts as
	// already touched, so saving never silently changes a live post URL).
	const slug = ref(post.value.slug)
	const slugTouched = ref(true)
	watch(title, (value) => {
		if (!slugTouched.value) slug.value = slugify(value)
	})

	const seoTitle = ref(post.value.seo?.title ?? '')
	const seoDescription = ref(post.value.seo?.description ?? '')
	const seoKeywords = ref(post.value.seo?.keywords ?? '')

	// Live preview of the fixed hero every post gets automatically (see
	// PostHero.vue, used as-is on app/pages/blog/[slug].vue) — sits above
	// the block canvas so it's obvious a hero block doesn't need adding to
	// the body too. Built from the same refs the Save button reads, not a
	// re-fetch, so it updates as you type.
	const previewPost = computed<Post>(() => ({
		...post.value!,
		title: title.value,
		excerpt: excerpt.value || null,
		category: category.value || null,
		cover_image: coverImage.value || null,
		author_name: authorName.value || null,
		author_photo: authorPhoto.value || null,
		read_time: readTime.value || null,
	}))
	// Same fixed-locale reasoning as app/pages/blog/[slug].vue's own
	// formattedDate — irrelevant for SSR/hydration here (this is
	// client-only admin UI), kept only so the preview matches the real
	// output exactly.
	const previewFormattedDate = computed(() =>
		publishedAtInput.value
			? new Date(publishedAtInput.value).toLocaleDateString('en-GB', {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				})
			: '',
	)

	const toast = useToast()
	const { confirm } = useConfirm()
	const saving = ref(false)

	const dirty = ref(false)
	watch(
		[
			title,
			excerpt,
			category,
			authorName,
			authorPhoto,
			readTime,
			status,
			sortOrder,
			coverImage,
			tagsInput,
			publishedAtInput,
			slug,
			seoTitle,
			seoDescription,
			seoKeywords,
			blocks,
		],
		() => (dirty.value = true),
		{ deep: true },
	)
	useUnsavedChanges(dirty)

	async function save() {
		saving.value = true
		try {
			await $fetch(`/api/posts/${id}`, {
				method: 'PATCH',
				body: {
					title: title.value,
					slug: slug.value,
					excerpt: excerpt.value,
					blocks: blocks.value,
					category: category.value,
					author_name: authorName.value,
					author_photo: authorPhoto.value,
					read_time: readTime.value,
					status: status.value,
					sort_order: sortOrder.value,
					cover_image: coverImage.value,
					tags: tags.value,
					published_at: publishedAtInput.value ? new Date(publishedAtInput.value).toISOString() : null,
					seo: {
						title: seoTitle.value || undefined,
						description: seoDescription.value || undefined,
						keywords: seoKeywords.value || undefined,
					},
				},
			})
			toast.show('Saved.')
			dirty.value = false
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not save post'), 'error')
		} finally {
			saving.value = false
		}
	}

	async function deletePost() {
		if (!(await confirm(`Delete "${title.value}"? This can't be undone.`, { confirmLabel: 'Delete', danger: true })))
			return
		try {
			await $fetch(`/api/posts/${id}`, { method: 'DELETE' })
			dirty.value = false
			await navigateTo('/admin/blog')
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not delete post'), 'error')
		}
	}
</script>

<style lang="scss" scoped>
	.admin-post-editor {
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
			.status-input {
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
			.status-input {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
			}
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

		.hero-preview {
			margin-bottom: var(--padding-md);

			&-label {
				color: var(--text-secondary);
				font-size: 0.8125rem;
				margin-bottom: var(--padding-xs);
			}

			:deep(.scaled-block-preview) {
				border: 1px solid var(--border);
				border-radius: var(--border-radius-md);
				overflow: hidden;
				pointer-events: none;
			}
		}
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
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--link);
		cursor: pointer;
		font-size: var(--eyebrow-size);
		font-weight: 600;

		&.danger {
			color: var(--error);
		}
	}
</style>
