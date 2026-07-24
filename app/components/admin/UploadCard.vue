<template>
	<div class="upload-card">
		<video
			v-if="upload.mime_type?.startsWith('video/')"
			:src="upload.url"
			muted
			playsinline
		/>
		<NuxtImg
			v-else
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
				@click="emit('copy')"
			>
				{{ copied ? 'Copied!' : 'Copy URL' }}
			</button>
			<button
				type="button"
				class="link-btn danger"
				@click="emit('delete')"
			>
				Delete
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { UploadRecord } from '#shared/types/cms'

	defineProps<{
		upload: UploadRecord
		copied: boolean
	}>()

	const emit = defineEmits<{
		copy: []
		delete: []
	}>()
</script>

<style lang="scss" scoped>
	.upload-card {
		background: var(--bg-secondary);
		border: 1px solid var(--text-primary);
		border-radius: var(--border-radius-md);
		overflow: hidden;

		img,
		video {
			aspect-ratio: 1;
			background: var(--bg-secondary);
			object-fit: cover;
			width: 100%;
		}

		.meta {
			display: flex;
			flex-direction: column;
			gap: 2px;
			padding: var(--padding-sm);

			.filename {
				font-size: var(--eyebrow-size);
				font-weight: 600;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.size {
				color: var(--text-secondary);
				font-size: var(--eyebrow-size);
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
				font-size: var(--eyebrow-size);
				font-weight: 600;
				padding: var(--padding-xs);

				&:hover {
					background: var(--bg-secondary);
				}

				&.danger {
					border-left: 1px solid var(--border);
					color: var(--error);
				}
			}
		}
	}
</style>
