<template>
	<div class="admin-uploads">
		<header class="page-header">
			<h1>Uploads</h1>
			<div class="actions">
				<input
					ref="fileInput"
					type="file"
					accept="image/*"
					class="file-input"
					@change="onFileChange"
				/>
				<button
					type="button"
					class="btn primary"
					:disabled="uploading"
					@click="fileInput?.click()"
				>
					{{ uploading ? 'Uploading…' : 'Upload image' }}
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

		<div
			v-if="uploads?.length"
			class="grid"
		>
			<div
				v-for="upload in uploads"
				:key="upload.id"
				class="upload-card"
			>
				<NuxtImg
					:src="upload.url"
					:alt="upload.filename"
					loading="lazy"
				/>
				<div class="meta">
					<span class="filename">{{ upload.filename }}</span>
					<span class="size">{{ formatBytes(upload.size) }}</span>
				</div>
				<div class="card-actions">
					<button
						type="button"
						class="link-btn"
						@click="copyUrl(upload.url)"
					>
						{{ copiedId === upload.id ? 'Copied!' : 'Copy URL' }}
					</button>
					<button
						type="button"
						class="link-btn danger"
						@click="removeUpload(upload)"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
		<p
			v-else
			class="empty"
		>
			No uploads yet — upload an image to get started.
		</p>
	</div>
</template>

<script setup lang="ts">
	import type { UploadRecord } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const { uploads, uploading, error: uploadError, upload, remove } = useUploads()

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

	async function copyUrl(url: string) {
		await navigator.clipboard.writeText(url)
	}
</script>

<style lang="scss" scoped>
	.admin-uploads {
		padding-block: $space-xl;

		.page-header {
			align-items: center;
			display: flex;
			justify-content: space-between;
			margin-bottom: $space-lg;
		}

		h1 {
			font-family: $font-display;
			font-size: $text-2xl;
			font-weight: $weight-bold;
		}

		.file-input {
			display: none;
		}

		.error {
			color: var(--error);
			font-size: $text-sm;
			font-weight: $weight-semibold;
			margin-bottom: $space-md;
		}

		.grid {
			display: grid;
			gap: $space-md;
			grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		}

		.upload-card {
			background: var(--surface);
			border: 1px solid var(--text);
			border-radius: $radius-md;
			overflow: hidden;

			img {
				aspect-ratio: 1;
				background: var(--bg-alt);
				object-fit: cover;
				width: 100%;
			}

			.meta {
				display: flex;
				flex-direction: column;
				gap: 2px;
				padding: $space-sm;

				.filename {
					font-size: $text-sm;
					font-weight: $weight-semibold;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.size {
					color: var(--text-muted);
					font-size: $text-sm;
				}
			}

			.card-actions {
				border-top: 1px solid var(--border);
				display: flex;

				.link-btn {
					background: none;
					border: none;
					color: var(--link);
					cursor: pointer;
					flex: 1;
					font-size: $text-sm;
					font-weight: $weight-semibold;
					padding: $space-xs;

					&:hover {
						background: var(--surface-hover);
					}

					&.danger {
						border-left: 1px solid var(--border);
						color: var(--error);
					}
				}
			}
		}

		.empty {
			color: var(--text-muted);
		}
	}
</style>
