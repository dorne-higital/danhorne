<template>
	<div class="admin-uploads">
		<header class="page-header">
			<h1>Uploads</h1>
			<div class="actions">
				<button
					v-if="selectedIds.size"
					type="button"
					class="btn outline"
					@click="deleteSelected"
				>
					Delete selected ({{ selectedIds.size }})
				</button>
				<input
					ref="fileInput"
					type="file"
					accept="image/*,video/*"
					multiple
					class="file-input"
					@change="onFileChange"
				/>
				<button
					type="button"
					class="btn primary"
					:disabled="uploading"
					@click="fileInput?.click()"
				>
					{{ uploading ? 'Uploading…' : 'Upload files' }}
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
						:selected="selectedIds.has(item.id)"
						@copy="copyUrl(item)"
						@delete="removeUpload(item)"
						@update:selected="(value) => setSelected(item.id, value)"
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
						:selected="selectedIds.has(item.id)"
						@copy="copyUrl(item)"
						@delete="removeUpload(item)"
						@update:selected="(value) => setSelected(item.id, value)"
					/>
				</div>
			</section>
		</template>
	</div>
</template>

<script setup lang="ts">
	import type { UploadRecord } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { uploads, uploading, error: uploadError, uploadMany, remove, removeMany } = useUploads()

	const imageUploads = computed(() => (uploads.value ?? []).filter((item) => !item.mime_type?.startsWith('video/')))
	const videoUploads = computed(() => (uploads.value ?? []).filter((item) => item.mime_type?.startsWith('video/')))

	const fileInput = ref<HTMLInputElement>()
	const copiedId = ref<string | null>(null)
	const selectedIds = ref<Set<string>>(new Set())

	function setSelected(id: string, value: boolean) {
		if (value) selectedIds.value.add(id)
		else selectedIds.value.delete(id)
		// Set mutations aren't reactive on their own — trigger with a fresh copy.
		selectedIds.value = new Set(selectedIds.value)
	}

	async function onFileChange(event: Event) {
		const files = Array.from((event.target as HTMLInputElement).files ?? [])
		if (!files.length) return

		try {
			await uploadMany(files)
		} catch {
			// error is already surfaced via uploadError
		} finally {
			if (fileInput.value) fileInput.value.value = ''
		}
	}

	async function removeUpload(uploadItem: UploadRecord) {
		if (!confirm(`Delete "${uploadItem.filename}"? This can't be undone.`)) return
		await remove(uploadItem.id)
		setSelected(uploadItem.id, false)
	}

	async function deleteSelected() {
		const count = selectedIds.value.size
		if (!count) return
		if (!confirm(`Delete ${count} file${count === 1 ? '' : 's'}? This can't be undone.`)) return

		await removeMany([...selectedIds.value])
		selectedIds.value = new Set()
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

		.actions {
			align-items: center;
			display: flex;
			gap: var(--padding-sm);
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
