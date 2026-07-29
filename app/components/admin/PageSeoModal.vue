<template>
	<Modal
		:open="open"
		title="SEO"
		size="md"
		@update:open="(value) => emit('update:open', value)"
	>
		<form
			class="seo-form"
			@submit.prevent="save"
		>
			<div class="seo-score">
				<span
					class="score-badge"
					:class="grade"
				>
					{{ score }}
				</span>
				<div class="score-checks">
					<span
						v-for="check in checks"
						:key="check.id"
						class="check"
						:class="check.status"
					>
						<Icon :name="checkIcon(check.status)" />
						{{ check.label }}
					</span>
				</div>
			</div>

			<label for="seo-title">Meta title</label>
			<input
				id="seo-title"
				v-model="seoTitle"
				type="text"
				:placeholder="page?.title"
			/>

			<label for="seo-description">Meta description</label>
			<textarea
				id="seo-description"
				v-model="seoDescription"
				rows="3"
			/>

			<label for="seo-keywords">Keywords</label>
			<input
				id="seo-keywords"
				v-model="seoKeywords"
				type="text"
				placeholder="comma, separated, keywords"
			/>

			<label>Social image (og:image)</label>
			<div class="og-image">
				<NuxtImg
					v-if="ogImage"
					:src="ogImage"
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
			<div class="og-image-actions">
				<button
					type="button"
					class="btn outline sm"
					@click="pickerOpen = true"
				>
					Choose image
				</button>
				<button
					v-if="ogImage"
					type="button"
					class="link-btn"
					@click="ogImage = ''"
				>
					Clear
				</button>
			</div>
			<MediaPicker
				:open="pickerOpen"
				@update:open="(value) => (pickerOpen = value)"
				@select="(url) => (ogImage = url)"
			/>

			<p
				v-if="error"
				class="error"
				role="alert"
			>
				{{ error }}
			</p>

			<button
				type="submit"
				class="btn primary"
				:disabled="saving"
			>
				{{ saving ? 'Saving…' : 'Save SEO' }}
			</button>
		</form>
	</Modal>
</template>

<script setup lang="ts">
	import type { PageSeo, PageSummary } from '#shared/types/cms'

	const props = defineProps<{
		open: boolean
		page: PageSummary | null
	}>()

	const emit = defineEmits<{
		'update:open': [value: boolean]
		saved: [seo: PageSeo]
	}>()

	const seoTitle = ref('')
	const seoDescription = ref('')
	const seoKeywords = ref('')
	const ogImage = ref('')
	const pickerOpen = ref(false)
	const saving = ref(false)
	const error = ref('')

	const seoResult = computed(() =>
		scoreSeo({
			title: seoTitle.value,
			description: seoDescription.value,
			keywords: seoKeywords.value,
			ogImage: ogImage.value,
		}),
	)
	const score = computed(() => seoResult.value.score)
	const grade = computed(() => seoResult.value.grade)
	const checks = computed(() => seoResult.value.checks)

	function checkIcon(status: 'good' | 'warning' | 'bad') {
		if (status === 'good') return 'lucide:check'
		if (status === 'warning') return 'lucide:alert-triangle'
		return 'lucide:x'
	}

	watch(
		() => props.page,
		(page) => {
			seoTitle.value = page?.seo?.title ?? ''
			seoDescription.value = page?.seo?.description ?? ''
			seoKeywords.value = page?.seo?.keywords ?? ''
			ogImage.value = page?.seo?.ogImage ?? ''
		},
		{ immediate: true },
	)

	async function save() {
		if (!props.page) return
		saving.value = true
		error.value = ''
		try {
			const seo: PageSeo = {
				title: seoTitle.value || undefined,
				description: seoDescription.value || undefined,
				keywords: seoKeywords.value || undefined,
				ogImage: ogImage.value || undefined,
			}
			await $fetch(`/api/pages/${encodeURIComponent(props.page.slug)}`, {
				method: 'PUT',
				body: { seo },
			})
			emit('saved', seo)
			emit('update:open', false)
		} catch (err: any) {
			error.value = err?.data?.statusMessage ?? 'Could not save SEO'
		} finally {
			saving.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.seo-form {
		display: flex;
		flex-direction: column;
		gap: var(--padding-sm);

		label {
			font-size: 0.9375rem;
			font-weight: 600;
		}

		input,
		textarea {
			background: var(--bg-primary);
			border: 1px solid var(--text-primary);
			border-radius: var(--border-radius-sm);
			font-family: var(--body-font-family);
			font-size: var(--body-size);
			padding: var(--padding-sm);
			width: 100%;
		}

		textarea {
			resize: vertical;
		}

		.og-image {
			align-items: center;
			aspect-ratio: 1200 / 630;
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-sm);
			display: flex;
			justify-content: center;
			overflow: hidden;

			img {
				height: 100%;
				object-fit: cover;
				width: 100%;
			}

			.placeholder {
				color: var(--text-secondary);
				font-size: 0.9375rem;
			}
		}

		.og-image-actions {
			display: flex;
			gap: var(--padding-sm);
		}

		.seo-score {
			align-items: center;
			background: var(--bg-secondary);
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
			color: var(--error);
			cursor: pointer;
			font-size: var(--button-size);
			font-weight: var(--button-font-weight);
		}

		.error {
			color: var(--error);
			font-size: 0.9375rem;
			font-weight: 600;
		}
	}
</style>
