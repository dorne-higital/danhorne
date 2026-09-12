<template>
	<div class="admin-portfolio">
		<header class="page-header">
			<h1>Portfolio</h1>
			<button
				type="button"
				class="btn primary"
				@click="showCreate = true"
			>
				New site
			</button>
		</header>

		<p class="intro">
			Sites you've built — powers the Portfolio Carousel, Portfolio Grid, and Portfolio Stats content-blocks
			wherever they're placed on a page.
		</p>

		<div
			v-if="sites?.length"
			class="filters"
		>
			<input
				v-model="search"
				type="search"
				placeholder="Search sites…"
				class="search-input"
				aria-label="Search sites"
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
				v-model="tagFilter"
				aria-label="Filter by tag"
			>
				<option value="">All tags</option>
				<option
					v-for="tag in allTags"
					:key="tag"
					:value="tag"
				>
					{{ tag }}
				</option>
			</select>
		</div>

		<div
			v-if="paginatedSites.length"
			class="grid"
		>
			<article
				v-for="site in paginatedSites"
				:key="site.id"
				class="site-card"
			>
				<NuxtLink
					:to="`/admin/portfolio/${site.id}`"
					class="media"
				>
					<NuxtImg
						v-if="site.cover_image"
						:src="site.cover_image"
						:alt="site.name"
						loading="lazy"
					/>
					<span
						v-else
						class="placeholder"
					>
						{{ site.name.slice(0, 1).toUpperCase() }}
					</span>
					<span
						v-if="site.status === 'draft'"
						class="badge draft"
					>
						Draft
					</span>
				</NuxtLink>
				<div class="body">
					<div class="title-row">
						<NuxtLink
							:to="`/admin/portfolio/${site.id}`"
							class="name"
						>
							{{ site.name }}
						</NuxtLink>
						<Icon
							v-if="site.is_favourite"
							name="lucide:heart"
							class="flag favourite"
							aria-label="Favourite"
						/>
						<Icon
							v-if="site.is_featured"
							name="lucide:star"
							class="flag featured"
							aria-label="Featured"
						/>
					</div>
					<p
						v-if="site.tags.length"
						class="tags"
					>
						{{ site.tags.join(' · ') }}
					</p>
					<div class="actions">
						<NuxtLink
							:to="`/admin/portfolio/${site.id}`"
							class="link-btn"
						>
							Edit
						</NuxtLink>
						<button
							type="button"
							class="link-btn danger"
							@click="deleteSite(site)"
						>
							Delete
						</button>
					</div>
				</div>
			</article>
		</div>
		<p
			v-else-if="sites?.length"
			class="empty"
		>
			No sites match your filters.
		</p>
		<p
			v-else
			class="empty"
		>
			No sites yet — add the first one above.
		</p>

		<PaginationControls
			v-model:page="page"
			v-model:page-size="pageSize"
			:total="total"
			:total-pages="totalPages"
		/>

		<Modal
			:open="showCreate"
			title="New site"
			@update:open="(value) => (showCreate = value)"
		>
			<form
				class="create-form"
				@submit.prevent="createSite"
			>
				<label for="new-name">Name</label>
				<input
					id="new-name"
					v-model="newName"
					type="text"
					placeholder="Acme Co."
					required
				/>

				<label for="new-url">Site URL</label>
				<input
					id="new-url"
					v-model="newUrl"
					type="text"
					placeholder="https://acme.co"
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
					{{ creating ? 'Adding…' : 'Add site' }}
				</button>
			</form>
		</Modal>
	</div>
</template>

<script setup lang="ts">
	import type { PortfolioSite } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { data: sites, refresh } = await useFetch<PortfolioSite[]>('/api/portfolio-sites', {
		key: 'admin-portfolio-list',
	})
	const { confirm } = useConfirm()
	const toast = useToast()

	const allTags = computed(() => {
		const set = new Set<string>()
		for (const site of sites.value ?? []) {
			for (const tag of site.tags) set.add(tag)
		}
		return [...set].sort()
	})

	const search = ref('')
	const statusFilter = ref('')
	const tagFilter = ref('')
	const filteredSites = computed(() => {
		const query = search.value.trim().toLowerCase()
		return (sites.value ?? []).filter((site) => {
			if (statusFilter.value && site.status !== statusFilter.value) return false
			if (tagFilter.value && !site.tags.includes(tagFilter.value)) return false
			if (query && !site.name.toLowerCase().includes(query) && !site.url.toLowerCase().includes(query)) {
				return false
			}
			return true
		})
	})
	const { page, pageSize, total, totalPages, paginated: paginatedSites } = usePagination(filteredSites)

	const showCreate = ref(false)
	const newName = ref('')
	const newUrl = ref('')
	const creating = ref(false)
	const createError = ref('')

	async function createSite() {
		creating.value = true
		createError.value = ''
		try {
			const created = await $fetch<PortfolioSite>('/api/portfolio-sites', {
				method: 'POST',
				body: { name: newName.value, url: newUrl.value },
			})
			showCreate.value = false
			newName.value = ''
			newUrl.value = ''
			await navigateTo(`/admin/portfolio/${created.id}`)
		} catch (err) {
			createError.value = getApiErrorMessage(err, 'Could not add site')
		} finally {
			creating.value = false
		}
	}

	async function deleteSite(site: PortfolioSite) {
		if (!(await confirm(`Delete "${site.name}"? This can't be undone.`, { confirmLabel: 'Delete', danger: true })))
			return
		try {
			await $fetch(`/api/portfolio-sites/${site.id}`, { method: 'DELETE' })
			await refresh()
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not delete site'), 'error')
		}
	}
</script>

<style lang="scss" scoped>
	.admin-portfolio {
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

		.site-card {
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

				.flag {
					flex-shrink: 0;
					height: 0.9375rem;
					width: 0.9375rem;

					&.favourite {
						color: var(--error);
					}

					&.featured {
						color: var(--warning);
					}
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
