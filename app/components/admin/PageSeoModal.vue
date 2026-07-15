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
		gap: $space-sm;

		label {
			font-size: $text-sm;
			font-weight: $weight-semibold;
		}

		input,
		textarea {
			background: var(--bg);
			border: 1px solid var(--text);
			border-radius: $radius-sm;
			font-family: $font-sans;
			font-size: $text-base;
			padding: $space-sm;
			width: 100%;
		}

		textarea {
			resize: vertical;
		}

		.og-image {
			align-items: center;
			aspect-ratio: 1200 / 630;
			background: var(--bg-alt);
			border: 1px solid var(--border);
			border-radius: $radius-sm;
			display: flex;
			justify-content: center;
			overflow: hidden;

			img {
				height: 100%;
				object-fit: cover;
				width: 100%;
			}

			.placeholder {
				color: var(--text-muted);
				font-size: $text-sm;
			}
		}

		.og-image-actions {
			display: flex;
			gap: $space-sm;
		}

		.link-btn {
			background: none;
			border: none;
			color: var(--error);
			cursor: pointer;
			font-size: $text-sm;
			font-weight: $weight-semibold;
		}

		.error {
			color: var(--error);
			font-size: $text-sm;
			font-weight: $weight-semibold;
		}
	}
</style>
