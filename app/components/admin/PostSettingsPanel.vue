<template>
	<aside class="post-settings">
		<section class="group">
			<h2>Details</h2>
			<div class="field">
				<label for="post-excerpt">Excerpt</label>
				<textarea
					id="post-excerpt"
					v-model="excerpt"
					rows="3"
				/>
			</div>
			<div class="field">
				<label for="post-category">Category</label>
				<input
					id="post-category"
					v-model="category"
					type="text"
					placeholder="News"
				/>
			</div>
			<div class="field">
				<label for="post-tags">Tags</label>
				<input
					id="post-tags"
					v-model="tagsInput"
					type="text"
					placeholder="Nuxt, Case study, Tips"
				/>
			</div>
			<div class="field">
				<label for="post-read-time">Read time</label>
				<input
					id="post-read-time"
					v-model="readTime"
					type="text"
					placeholder="5 min read"
				/>
			</div>
			<div class="field">
				<label for="post-published-at">Published date</label>
				<input
					id="post-published-at"
					v-model="publishedAtInput"
					type="date"
				/>
			</div>
			<div class="field">
				<label for="post-sort-order">Sort order</label>
				<input
					id="post-sort-order"
					v-model.number="sortOrder"
					type="number"
				/>
				<p class="hint">Lower numbers show first in Blog Grid.</p>
			</div>
		</section>

		<section class="group">
			<h2>Author</h2>
			<div class="field">
				<label for="post-author-name">Author name</label>
				<input
					id="post-author-name"
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
							Choose
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
		</section>

		<section class="group">
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

		<section class="group">
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
				<label for="post-seo-title">Meta title</label>
				<input
					id="post-seo-title"
					v-model="seoTitle"
					type="text"
					:placeholder="title"
				/>
			</div>
			<div class="field">
				<label for="post-seo-description">Meta description</label>
				<textarea
					id="post-seo-description"
					v-model="seoDescription"
					rows="3"
				/>
			</div>
			<div class="field">
				<label for="post-seo-keywords">Keywords</label>
				<input
					id="post-seo-keywords"
					v-model="seoKeywords"
					type="text"
					placeholder="comma, separated, keywords"
				/>
			</div>
		</section>
	</aside>
</template>

<script setup lang="ts">
	defineProps<{
		title: string
	}>()

	const excerpt = defineModel<string>('excerpt', { required: true })
	const category = defineModel<string>('category', { required: true })
	const tagsInput = defineModel<string>('tagsInput', { required: true })
	const readTime = defineModel<string>('readTime', { required: true })
	const publishedAtInput = defineModel<string>('publishedAtInput', { required: true })
	const sortOrder = defineModel<number>('sortOrder', { required: true })
	const authorName = defineModel<string>('authorName', { required: true })
	const authorPhoto = defineModel<string>('authorPhoto', { required: true })
	const coverImage = defineModel<string>('coverImage', { required: true })
	const seoTitle = defineModel<string>('seoTitle', { required: true })
	const seoDescription = defineModel<string>('seoDescription', { required: true })
	const seoKeywords = defineModel<string>('seoKeywords', { required: true })

	const authorPickerOpen = ref(false)
	const coverPickerOpen = ref(false)

	const seoResult = computed(() =>
		scoreSeo({ title: seoTitle.value, description: seoDescription.value, keywords: seoKeywords.value }),
	)
	function checkIcon(status: 'good' | 'warning' | 'bad') {
		if (status === 'good') return 'lucide:check'
		if (status === 'warning') return 'lucide:alert-triangle'
		return 'lucide:x'
	}
</script>

<style lang="scss" scoped>
	.post-settings {
		display: flex;
		flex-direction: column;
		gap: var(--padding-lg);

		.group {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
		}

		h2 {
			font-family: var(--body-font-family);
			font-size: var(--body-size);
			font-weight: var(--heading-font-weight);
		}

		.hint {
			color: var(--text-secondary);
			font-size: 0.8125rem;
		}

		.field {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);

			label {
				font-size: 0.9375rem;
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
				overflow: hidden;

				&.sm {
					aspect-ratio: 1;
					max-width: 3.5rem;
				}

				img {
					height: 100%;
					object-fit: cover;
					width: 100%;
				}

				.placeholder {
					color: var(--text-secondary);
					font-size: 0.8125rem;
				}
			}

			&.inline {
				align-items: center;
				display: flex;
				gap: var(--padding-sm);

				.preview {
					margin-bottom: 0;
				}
			}

			.image-actions {
				align-items: center;
				display: flex;
				flex-wrap: wrap;
				gap: var(--padding-sm);
			}
		}

		.seo-score {
			align-items: center;
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-sm);
			display: flex;
			gap: var(--padding-sm);
			padding: var(--padding-sm);
		}

		.score-badge {
			align-items: center;
			border-radius: 50%;
			display: flex;
			flex-shrink: 0;
			font-family: var(--heading-font-family);
			font-size: 1rem;
			font-weight: var(--heading-font-weight);
			height: 2.5rem;
			justify-content: center;
			width: 2.5rem;

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
			font-size: 0.75rem;
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
			font-size: 0.8125rem;
			font-weight: 600;
		}
	}
</style>
