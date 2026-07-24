<template>
	<div class="admin-uploads">
		<header class="page-header">
			<h1>Uploads</h1>
			<div class="actions">
				<input
					ref="fileInput"
					type="file"
					accept="image/*,video/*"
					class="file-input"
					@change="onFileChange"
				/>
				<button
					type="button"
					class="btn primary"
					:disabled="uploading"
					@click="fileInput?.click()"
				>
					{{ uploading ? 'Uploading…' : 'Upload file' }}
				</button>
			</div>
		</header>

		<p
			v-if="uploadError"
			class="error"
			role="alert"
		>
			{{ uploadError }}
		</p>

		<p
			v-if="!uploads?.length"
			class="empty"
		>
			No uploads yet — upload a file to get started.
		</p>

		<template v-else>
			<section
				v-if="imageUploads.length"
				class="section"
			>
				<h2>Images</h2>
				<div class="grid">
					<UploadCard
						v-for="item in imageUploads"
						:key="item.id"
						:upload="item"
						:copied="copiedId === item.id"
						@copy="copyUrl(item)"
						@delete="removeUpload(item)"
					/>
				</div>
			</section>

			<section
				v-if="videoUploads.length"
				class="section"
			>
				<h2>Videos</h2>
				<div class="grid">
					<UploadCard
						v-for="item in videoUploads"
						:key="item.id"
						:upload="item"
						:copied="copiedId === item.id"
						@copy="copyUrl(item)"
						@delete="removeUpload(item)"
					/>
				</div>
			</section>
		</template>
	</div>
</template>

<script setup lang="ts">
	import type { UploadRecord } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { uploads, uploading, error: uploadError, upload, remove } = useUploads()

	const imageUploads = computed(() => (uploads.value ?? []).filter((item) => !item.mime_type?.startsWith('video/')))
	const videoUploads = computed(() => (uploads.value ?? []).filter((item) => item.mime_type?.startsWith('video/')))

	const fileInput = ref<HTMLInputElement>()
	const copiedId = ref<string | null>(null)

	async function onFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0]
		if (!file) return

		try {
			await upload(file)
		} catch {
			// error is already surfaced via uploadError
		} finally {
			if (fileInput.value) fileInput.value.value = ''
		}
	}

	async function removeUpload(uploadItem: UploadRecord) {
		if (!confirm(`Delete "${uploadItem.filename}"? This can't be undone.`)) return
		await remove(uploadItem.id)
	}

	async function copyUrl(uploadItem: UploadRecord) {
		await navigator.clipboard.writeText(uploadItem.url)
		copiedId.value = uploadItem.id
		setTimeout(() => {
			if (copiedId.value === uploadItem.id) copiedId.value = null
		}, 2000)
	}
</script>

<style lang="scss" scoped>
	.admin-uploads {
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

		.file-input {
			display: none;
		}

		.error {
			color: var(--error);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			margin-bottom: var(--padding-md);
		}

		.section {
			margin-bottom: var(--padding-xl);

			h2 {
				font-family: var(--heading-font-family);
				font-size: 1.25rem;
				font-weight: var(--heading-font-weight);
				margin-bottom: var(--padding-md);
			}
		}

		.grid {
			display: grid;
			gap: var(--padding-md);
			grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		}

		.empty {
			color: var(--text-secondary);
		}
	}
</style>
