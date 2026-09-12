<template>
	<div class="admin-portfolio-editor">
		<header class="editor-header">
			<NuxtLink
				to="/admin/portfolio"
				class="back"
			>
				← Portfolio
			</NuxtLink>
			<h1>{{ name || 'Untitled site' }}</h1>
			<button
				type="button"
				class="link-btn danger"
				@click="deleteSite"
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
					<label for="name">Name</label>
					<input
						id="name"
						v-model="name"
						type="text"
						required
					/>
				</div>
				<div class="field">
					<label for="url">Site URL</label>
					<input
						id="url"
						v-model="url"
						type="text"
						placeholder="https://acme.co"
						required
					/>
				</div>
				<div class="field">
					<label for="repo-url">Repo URL</label>
					<input
						id="repo-url"
						v-model="repoUrl"
						type="text"
						placeholder="https://github.com/…"
					/>
				</div>
				<div class="field">
					<label for="client-name">Client name</label>
					<input
						id="client-name"
						v-model="clientName"
						type="text"
					/>
				</div>
				<div class="field">
					<label for="completed-at">Completion date</label>
					<input
						id="completed-at"
						v-model="completedAt"
						type="date"
					/>
				</div>
				<div class="field">
					<label for="status">Status</label>
					<select
						id="status"
						v-model="status"
					>
						<option value="published">Published</option>
						<option value="draft">Draft</option>
					</select>
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
				<div class="field">
					<label for="tags">Tags</label>
					<input
						id="tags"
						v-model="tagsInput"
						type="text"
						placeholder="Nuxt, E-commerce, Branding"
					/>
				</div>
				<div class="field">
					<label for="slug">Case-study URL</label>
					<input
						id="slug"
						v-model="slug"
						type="text"
						placeholder="/work/footballdle"
						@input="slugTouched = true"
					/>
					<p class="hint">
						{{
							slug
								? `This site's page will be reachable at ${slug}`
								: 'Leave blank for no case-study page — cards link straight to the site.'
						}}
					</p>
				</div>
				<div class="field span-2">
					<label for="description">Description</label>
					<textarea
						id="description"
						v-model="description"
						rows="3"
					/>
				</div>
			</div>
		</section>

		<section class="panel">
			<h2>Flags</h2>
			<div class="flags">
				<label class="checkbox">
					<input
						v-model="isFavourite"
						type="checkbox"
					/>
					Favourite — eligible for the Portfolio Carousel's "favourites" filter
				</label>
				<label class="checkbox">
					<input
						v-model="isFeatured"
						type="checkbox"
					/>
					Featured — eligible for the Portfolio Carousel's "featured" filter
				</label>
			</div>
		</section>

		<section class="panel">
			<h2>Cover image</h2>
			<p class="hint">Used as the card thumbnail in the carousel and grid.</p>
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
			<h2>Gallery</h2>
			<p class="hint">Extra images beyond the cover — shown on this site's case-study page, if it has one.</p>
			<ul
				v-if="images.length"
				class="gallery-list"
			>
				<li
					v-for="(image, index) in images"
					:key="index"
					class="gallery-item"
				>
					<NuxtImg
						:src="image.url"
						:alt="image.alt"
						loading="lazy"
					/>
					<input
						v-model="image.alt"
						type="text"
						placeholder="Alt text"
						:aria-label="`Alt text for image ${index + 1}`"
					/>
					<button
						type="button"
						class="link-btn danger"
						@click="images.splice(index, 1)"
					>
						Remove
					</button>
				</li>
			</ul>
			<button
				type="button"
				class="btn outline sm"
				@click="galleryPickerOpen = true"
			>
				Add image
			</button>
			<MediaPicker
				:open="galleryPickerOpen"
				@update:open="(value) => (galleryPickerOpen = value)"
				@select="(imgUrl) => images.push({ url: imgUrl, alt: '' })"
			/>
		</section>
	</div>
</template>

<script setup lang="ts">
	import type { PortfolioSite } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const route = useRoute()
	const id = route.params.id as string

	// Its own key (not shared with the list page's 'admin-portfolio-list') —
	// see server/api/portfolio-sites/[id].get.ts for why.
	const { data: site } = await useFetch<PortfolioSite>(`/api/portfolio-sites/${id}`, {
		key: `admin-portfolio-${id}`,
	})

	if (!site.value) {
		throw createError({ statusCode: 404, statusMessage: 'Portfolio site not found' })
	}

	const name = ref(site.value.name)
	const url = ref(site.value.url)
	const repoUrl = ref(site.value.repo_url ?? '')
	const description = ref(site.value.description ?? '')
	const clientName = ref(site.value.client_name ?? '')
	const completedAt = ref(site.value.completed_at ?? '')
	const status = ref(site.value.status)
	const sortOrder = ref(site.value.sort_order)
	const isFavourite = ref(site.value.is_favourite)
	const isFeatured = ref(site.value.is_featured)
	const coverImage = ref(site.value.cover_image ?? '')
	const images = ref(structuredClone(site.value.images))
	const tagsInput = ref(site.value.tags.join(', '))
	const tags = computed(() =>
		tagsInput.value
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean),
	)

	// Full path, not just a segment — the admin can point this anywhere
	// (/work/acme, /projects/acme, whatever), not just under a fixed prefix.
	// "/work/" is only the suggested default; a brand-new site (just created
	// via the quick-create modal, no slug set yet) gets one suggested
	// immediately from its already-set name, not only once the name is
	// edited again — the watch below only fires on changes.
	const slug = ref(site.value.slug ?? `/work/${slugify(site.value.name)}`)
	// Only auto-fills from the name for a site that's never had its slug
	// hand-edited — an existing slug (from site.value) counts as already
	// touched, same as a slug typed just now, so saving never silently
	// changes a case-study URL that's already live somewhere.
	const slugTouched = ref(!!site.value.slug)
	watch(name, (value) => {
		if (!slugTouched.value) slug.value = `/work/${slugify(value)}`
	})

	const coverPickerOpen = ref(false)
	const galleryPickerOpen = ref(false)

	const toast = useToast()
	const { confirm } = useConfirm()
	const saving = ref(false)

	const dirty = ref(false)
	watch(
		[
			name,
			url,
			repoUrl,
			description,
			clientName,
			completedAt,
			status,
			sortOrder,
			isFavourite,
			isFeatured,
			coverImage,
			images,
			tagsInput,
			slug,
		],
		() => (dirty.value = true),
		{ deep: true },
	)
	useUnsavedChanges(dirty)

	async function save() {
		saving.value = true
		try {
			await $fetch(`/api/portfolio-sites/${id}`, {
				method: 'PATCH',
				body: {
					name: name.value,
					url: url.value,
					repo_url: repoUrl.value,
					description: description.value,
					client_name: clientName.value,
					completed_at: completedAt.value || null,
					status: status.value,
					sort_order: sortOrder.value,
					is_favourite: isFavourite.value,
					is_featured: isFeatured.value,
					cover_image: coverImage.value,
					images: images.value,
					tags: tags.value,
					slug: slug.value,
				},
			})
			toast.show('Saved.')
			dirty.value = false
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not save site'), 'error')
		} finally {
			saving.value = false
		}
	}

	async function deleteSite() {
		if (!(await confirm(`Delete "${name.value}"? This can't be undone.`, { confirmLabel: 'Delete', danger: true })))
			return
		try {
			await $fetch(`/api/portfolio-sites/${id}`, { method: 'DELETE' })
			dirty.value = false
			await navigateTo('/admin/portfolio')
		} catch (err) {
			toast.show(getApiErrorMessage(err, 'Could not delete site'), 'error')
		}
	}
</script>

<style lang="scss" scoped>
	.admin-portfolio-editor {
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

			.span-2 {
				@media (width >= 640px) {
					grid-column: span 2;
				}
			}
		}

		.flags {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
		}

		.checkbox {
			align-items: center;
			display: flex;
			gap: var(--padding-xs);
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

			.image-actions {
				align-items: center;
				display: flex;
				gap: var(--padding-md);
			}
		}

		.gallery-list {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
			margin-bottom: var(--padding-sm);

			.gallery-item {
				align-items: center;
				display: flex;
				gap: var(--padding-sm);

				img {
					aspect-ratio: 1;
					border-radius: var(--border-radius-sm);
					height: 3rem;
					object-fit: cover;
					width: 3rem;
				}

				input {
					background: var(--bg-primary);
					border: 1px solid var(--text-primary);
					border-radius: var(--border-radius-sm);
					flex: 1;
					font-size: var(--body-size);
					padding: var(--padding-xs) var(--padding-sm);
				}
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
