<template>
	<div class="admin-blog">
		<header class="page-header">
			<h1>Blog</h1>
			<button
				type="button"
				class="btn primary"
				@click="showCreate = true"
			>
				New post
			</button>
		</header>

		<p class="intro">Blog posts — powers the Blog Grid content-block wherever it's placed on a page.</p>

		<div
			v-if="posts?.length"
			class="filters"
		>
			<input
				v-model="search"
				type="search"
				placeholder="Search posts…"
				class="search-input"
				aria-label="Search posts"
			/>
			<select
				v-model="statusFilter"
				aria-label="Filter by status"
			>
				<option value="">All statuses</option>
				<option value="published">Published</option>
				<option value="draft">Draft</option>
			</select>
			<select
				v-model="categoryFilter"
				aria-label="Filter by category"
			>
				<option value="">All categories</option>
				<option
					v-for="category in allCategories"
					:key="category"
					:value="category"
				>
					{{ category }}
				</option>
			</select>
		</div>

		<div
			v-if="paginatedPosts.length"
			class="grid"
		>
			<article
				v-for="post in paginatedPosts"
				:key="post.id"
				class="post-card"
			>
				<NuxtLink
					:to="`/admin/blog/${post.id}`"
					class="media"
				>
					<NuxtImg
						v-if="post.cover_image"
						:src="post.cover_image"
						:alt="post.title"
						loading="lazy"
					/>
					<span
						v-else
						class="placeholder"
					>
						{{ post.title.slice(0, 1).toUpperCase() }}
					</span>
					<span
						v-if="post.status === 'draft'"
						class="badge draft"
					>
						Draft
					</span>
				</NuxtLink>
				<div class="body">
					<div class="title-row">
						<NuxtLink
							:to="`/admin/blog/${post.id}`"
							class="name"
						>
							{{ post.title }}
						</NuxtLink>
					</div>
					<p
						v-if="post.category"
						class="tags"
					>
						{{ post.category }}
					</p>
					<div class="actions">
						<NuxtLink
							:to="`/admin/blog/${post.id}`"
							class="link-btn"
						>
							Edit
						</NuxtLink>
						<button
							type="button"
							class="link-btn danger"
							@click="deletePost(post)"
						>
							Delete
						</button>
					</div>
				</div>
			</article>
		</div>
		<p
			v-else-if="posts?.length"
			class="empty"
		>
			No posts match your filters.
		</p>
		<p
			v-else
			class="empty"
		>
			No posts yet — add the first one above.
		</p>

		<PaginationControls
			v-model:page="page"
			v-model:page-size="pageSize"
			:total="total"
			:total-pages="totalPages"
		/>

		<Modal
			:open="showCreate"
			title="New post"
			@update:open="(value) => (showCreate = value)"
		>
			<form
				class="create-form"
				@submit.prevent="createPost"
			>
				<label for="new-title">Title</label>
				<input
					id="new-title"
					v-model="newTitle"
					type="text"
					placeholder="How we built our new site"
					required
				/>

				<p
					v-if="createError"
					class="error"
					role="alert"
				>
					{{ createError }}
				</p>

				<button
					type="submit"
					class="btn primary"
					:disabled="creating"
				>
					{{ creating ? 'Adding…' : 'Add post' }}
				</button>
			</form>
		</Modal>
	</div>
</template>

<script setup lang="ts">
	import type { Post } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { data: posts, refresh } = await useFetch<Post[]>('/api/posts', {
		key: 'admin-blog-list',
	})
	const { confirm } = useConfirm()
	const toast = useToast()

	const allCategories = computed(() => {
		const set = new Set<string>()
		for (const post of posts.value ?? []) {
			if (post.category) set.add(post.category)
		}
		return [...set].sort()
	})

	const search = ref('')
	const statusFilter = ref('')
	const categoryFilter = ref('')
	const filteredPosts = computed(() => {
		const query = search.value.trim().toLowerCase()
		return (posts.value ?? []).filter((post) => {
			if (statusFilter.value && post.status !== statusFilter.value) return false
			if (categoryFilter.value && post.category !== categoryFilter.value) return false
			if (query && !post.title.toLowerCase().includes(query)) return false
			return true
		})
	})
	const { page, pageSize, total, totalPages, paginated: paginatedPosts } = usePagination(filteredPosts)

	const showCreate = ref(false)
	const newTitle = ref('')
	const creating = ref(false)
	const createError = ref('')

	async function createPost() {
		creating.value = true
		createError.value = ''
		try {
			const created = await $fetch<Post>('/api/posts', {
				method: 'POST',
				body: { title: newTitle.value },
			})
			showCreate.value = false
			newTitle.value = ''
			await navigateTo(`/admin/blog/${created.id}`)
		} catch (err) {
			createError.value = getApiErrorMessage(err, 'Could not add post')
		} finally {
			creating.value = false
		}
	}

	async function deletePost(post: Post) {
		if (!(await confirm(`Delete "${post.title}"? This can't be undone.`, { confirmLabel: 'Delete', danger: true })))
			return
		try {
			await $fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
			await refresh()
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not delete post'), 'error')
		}
	}
</script>

<style lang="scss" scoped>
	.admin-blog {
		padding-block: var(--padding-xl);

		.page-header {
			align-items: center;
			display: flex;
			justify-content: space-between;
			margin-bottom: var(--padding-lg);
		}

		h1 {
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
		}

		.intro {
			color: var(--text-secondary);
			margin-bottom: var(--padding-lg);
			max-width: 65ch;
		}

		.filters {
			display: flex;
			gap: var(--padding-sm);
			margin-bottom: var(--padding-md);
		}

		.search-input {
			background: var(--bg-primary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			font-size: var(--body-size);
			max-width: 20rem;
			padding: var(--padding-xs) var(--padding-sm);
			width: 100%;
		}

		select {
			background: var(--bg-primary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			font-size: var(--body-size);
			padding: var(--padding-xs) var(--padding-sm);
		}

		.grid {
			display: grid;
			gap: var(--padding-md);
			grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		}

		.post-card {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-md);
			overflow: hidden;

			.media {
				aspect-ratio: 16 / 10;
				background: var(--bg-primary);
				display: block;
				position: relative;

				img {
					height: 100%;
					object-fit: cover;
					width: 100%;
				}

				.placeholder {
					align-items: center;
					color: var(--text-secondary);
					display: flex;
					font-family: var(--heading-font-family);
					font-size: 2rem;
					font-weight: var(--heading-font-weight);
					height: 100%;
					justify-content: center;
				}

				.badge {
					background: var(--bg-secondary);
					border-radius: var(--border-radius-pill);
					font-size: var(--eyebrow-size);
					font-weight: 600;
					padding: 2px var(--padding-sm);
					position: absolute;
					right: var(--padding-xs);
					top: var(--padding-xs);
				}
			}

			.body {
				padding: var(--padding-sm) var(--padding-md);
			}

			.title-row {
				align-items: center;
				display: flex;
				gap: var(--padding-xs);

				.name {
					color: var(--text-primary);
					flex: 1;
					font-weight: 600;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}

			.tags {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
				margin-top: 2px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.actions {
				display: flex;
				gap: var(--padding-md);
				margin-top: var(--padding-sm);
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

		.empty {
			color: var(--text-secondary);
		}
	}

	.create-form {
		display: flex;
		flex-direction: column;
		gap: var(--padding-sm);

		label {
			font-size: var(--eyebrow-size);
			font-weight: 600;
		}

		input {
			background: var(--bg-primary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			font-size: var(--body-size);
			padding: var(--padding-sm);
		}

		.error {
			color: var(--error);
			font-size: var(--eyebrow-size);
			font-weight: 600;
		}
	}
</style>
