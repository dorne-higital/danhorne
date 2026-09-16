<template>
	<div class="admin-blog-editor">
		<header class="editor-header">
			<NuxtLink
				to="/admin/blog"
				class="back"
			>
				← Blog
			</NuxtLink>
			<h1>{{ title || 'Untitled post' }}</h1>
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
		</header>

		<section class="panel">
			<h2>Details</h2>
			<div class="settings-grid">
				<div class="field">
					<label for="title">Title</label>
					<input
						id="title"
						v-model="title"
						type="text"
						required
					/>
				</div>
				<div class="field">
					<label for="slug">Slug</label>
					<input
						id="slug"
						v-model="slug"
						type="text"
						placeholder="how-we-built-our-new-site"
						@input="slugTouched = true"
					/>
					<p class="hint">Will be reachable at /blog/{{ slug || '…' }}</p>
				</div>
				<div class="field">
					<label for="category">Category</label>
					<input
						id="category"
						v-model="category"
						type="text"
						placeholder="News"
					/>
				</div>
				<div class="field">
					<label for="tags">Tags</label>
					<input
						id="tags"
						v-model="tagsInput"
						type="text"
						placeholder="Nuxt, Case study, Tips"
					/>
				</div>
				<div class="field">
					<label for="status">Status</label>
					<select
						id="status"
						v-model="status"
					>
						<option value="draft">Draft</option>
						<option value="published">Published</option>
					</select>
				</div>
				<div class="field">
					<label for="published-at">Published date</label>
					<input
						id="published-at"
						v-model="publishedAtInput"
						type="date"
					/>
				</div>
				<div class="field">
					<label for="read-time">Read time</label>
					<input
						id="read-time"
						v-model="readTime"
						type="text"
						placeholder="5 min read"
					/>
				</div>
				<div class="field">
					<label for="sort-order">Sort order</label>
					<input
						id="sort-order"
						v-model.number="sortOrder"
						type="number"
					/>
					<p class="hint">Lower numbers show first.</p>
				</div>
				<div class="field span-2">
					<label for="excerpt">Excerpt</label>
					<textarea
						id="excerpt"
						v-model="excerpt"
						rows="3"
					/>
				</div>
			</div>
		</section>

		<section class="panel">
			<h2>Content</h2>
			<RichTextEditor v-model="content" />
		</section>

		<section class="panel">
			<h2>Author</h2>
			<div class="settings-grid">
				<div class="field">
					<label for="author-name">Author name</label>
					<input
						id="author-name"
						v-model="authorName"
						type="text"
					/>
				</div>
				<div class="field">
					<label>Author photo</label>
					<div class="image-field inline">
						<div class="preview sm">
							<NuxtImg
								v-if="authorPhoto"
								:src="authorPhoto"
								alt=""
								loading="lazy"
							/>
							<span
								v-else
								class="placeholder"
							>
								No photo
							</span>
						</div>
						<div class="image-actions">
							<button
								type="button"
								class="btn outline sm"
								@click="authorPickerOpen = true"
							>
								Choose photo
							</button>
							<button
								v-if="authorPhoto"
								type="button"
								class="link-btn"
								@click="authorPhoto = ''"
							>
								Clear
							</button>
						</div>
					</div>
					<MediaPicker
						:open="authorPickerOpen"
						@update:open="(value) => (authorPickerOpen = value)"
						@select="(url) => (authorPhoto = url)"
					/>
				</div>
			</div>
		</section>

		<section class="panel">
			<h2>Cover image</h2>
			<p class="hint">Used as the card thumbnail in the Blog Grid and at the top of the post.</p>
			<div class="image-field">
				<div class="preview">
					<NuxtImg
						v-if="coverImage"
						:src="coverImage"
						alt=""
						loading="lazy"
					/>
					<span
						v-else
						class="placeholder"
					>
						No image selected
					</span>
				</div>
				<div class="image-actions">
					<button
						type="button"
						class="btn outline sm"
						@click="coverPickerOpen = true"
					>
						Choose image
					</button>
					<button
						v-if="coverImage"
						type="button"
						class="link-btn"
						@click="coverImage = ''"
					>
						Clear
					</button>
				</div>
			</div>
			<MediaPicker
				:open="coverPickerOpen"
				@update:open="(value) => (coverPickerOpen = value)"
				@select="(url) => (coverImage = url)"
			/>
		</section>

		<section class="panel">
			<h2>SEO</h2>
			<div class="seo-score">
				<span
					class="score-badge"
					:class="seoResult.grade"
				>
					{{ seoResult.score }}
				</span>
				<div class="score-checks">
					<span
						v-for="check in seoResult.checks"
						:key="check.id"
						class="check"
						:class="check.status"
					>
						<Icon :name="checkIcon(check.status)" />
						{{ check.label }}
					</span>
				</div>
			</div>
			<div class="field">
				<label for="seo-title">Meta title</label>
				<input
					id="seo-title"
					v-model="seoTitle"
					type="text"
					:placeholder="title"
				/>
			</div>
			<div class="field">
				<label for="seo-description">Meta description</label>
				<textarea
					id="seo-description"
					v-model="seoDescription"
					rows="3"
				/>
			</div>
			<div class="field">
				<label for="seo-keywords">Keywords</label>
				<input
					id="seo-keywords"
					v-model="seoKeywords"
					type="text"
					placeholder="comma, separated, keywords"
				/>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
	import type { Post } from '#shared/types/cms'

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

	const title = ref(post.value.title)
	const excerpt = ref(post.value.excerpt ?? '')
	const content = ref(post.value.content ?? '')
	const category = ref(post.value.category ?? '')
	const authorName = ref(post.value.author_name ?? '')
	const authorPhoto = ref(post.value.author_photo ?? '')
	const readTime = ref(post.value.read_time ?? '')
	const status = ref(post.value.status)
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

	const coverPickerOpen = ref(false)
	const authorPickerOpen = ref(false)

	const seoTitle = ref(post.value.seo?.title ?? '')
	const seoDescription = ref(post.value.seo?.description ?? '')
	const seoKeywords = ref(post.value.seo?.keywords ?? '')
	const seoResult = computed(() =>
		scoreSeo({ title: seoTitle.value, description: seoDescription.value, keywords: seoKeywords.value }),
	)
	function checkIcon(status: 'good' | 'warning' | 'bad') {
		if (status === 'good') return 'lucide:check'
		if (status === 'warning') return 'lucide:alert-triangle'
		return 'lucide:x'
	}

	const toast = useToast()
	const { confirm } = useConfirm()
	const saving = ref(false)

	const dirty = ref(false)
	watch(
		[
			title,
			excerpt,
			content,
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
					content: content.value,
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
	.admin-blog-editor {
		padding-block: var(--padding-xl);

		.editor-header {
			align-items: center;
			display: flex;
			gap: var(--padding-md);
			margin-bottom: var(--padding-lg);

			.back {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				font-weight: 600;
			}

			h1 {
				flex: 1;
				font-family: var(--heading-font-family);
				font-size: var(--h2-size);
				font-weight: var(--heading-font-weight);
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		.panel {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			margin-bottom: var(--padding-lg);
			padding: var(--padding-lg);

			h2 {
				font-family: var(--heading-font-family);
				font-size: 1.25rem;
				font-weight: var(--heading-font-weight);
				margin-bottom: var(--padding-sm);
			}

			.hint {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				margin-bottom: var(--padding-sm);
			}
		}

		.field {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
			margin-bottom: var(--padding-sm);

			&:last-child {
				margin-bottom: 0;
			}

			label {
				font-size: var(--eyebrow-size);
				font-weight: 600;
			}

			input,
			select,
			textarea {
				background: var(--bg-primary);
				border: 1px solid var(--text-primary);
				border-radius: var(--border-radius-sm);
				font-family: inherit;
				font-size: var(--body-size);
				padding: var(--padding-sm);
			}
		}

		.settings-grid {
			display: grid;
			gap: var(--padding-sm) var(--padding-md);
			grid-template-columns: 1fr;

			@media (width >= 640px) {
				grid-template-columns: repeat(2, 1fr);
			}

			.field {
				margin-bottom: 0;
			}

			.span-2 {
				@media (width >= 640px) {
					grid-column: span 2;
				}
			}
		}

		.image-field {
			.preview {
				align-items: center;
				aspect-ratio: 16 / 9;
				background: var(--bg-primary);
				border: 1px solid var(--border);
				border-radius: var(--border-radius-sm);
				display: flex;
				justify-content: center;
				margin-bottom: var(--padding-sm);
				max-width: 24rem;
				overflow: hidden;

				&.sm {
					aspect-ratio: 1;
					max-width: 5rem;
				}

				img {
					height: 100%;
					object-fit: cover;
					width: 100%;
				}

				.placeholder {
					color: var(--text-secondary);
					font-size: var(--eyebrow-size);
				}
			}

			&.inline {
				align-items: center;
				display: flex;
				gap: var(--padding-md);

				.preview {
					margin-bottom: 0;
				}
			}

			.image-actions {
				align-items: center;
				display: flex;
				gap: var(--padding-md);
			}
		}

		.seo-score {
			align-items: center;
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-sm);
			display: flex;
			gap: var(--padding-sm);
			margin-bottom: var(--padding-md);
			padding: var(--padding-sm);
		}

		.score-badge {
			align-items: center;
			border-radius: 50%;
			display: flex;
			flex-shrink: 0;
			font-family: var(--heading-font-family);
			font-size: 1.125rem;
			font-weight: var(--heading-font-weight);
			height: 3rem;
			justify-content: center;
			width: 3rem;

			&.good {
				background: var(--success-bg);
				color: var(--success);
			}

			&.ok {
				background: var(--warning-bg);
				color: var(--warning);
			}

			&.poor {
				background: var(--error-bg);
				color: var(--error);
			}
		}

		.score-checks {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
		}

		.check {
			align-items: center;
			display: flex;
			font-size: 0.8125rem;
			font-weight: 500;
			gap: 0.375rem;

			svg {
				flex-shrink: 0;
			}

			&.good {
				color: var(--success);
			}

			&.warning {
				color: var(--warning);
			}

			&.bad {
				color: var(--error);
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
	}
</style>
