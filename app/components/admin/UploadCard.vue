<template>
	<div
		class="upload-card"
		:class="{ selected }"
	>
		<label class="select-toggle">
			<input
				type="checkbox"
				:checked="selected"
				@change="emit('update:selected', ($event.target as HTMLInputElement).checked)"
			/>
		</label>

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
		selected: boolean
	}>()

	const emit = defineEmits<{
		copy: []
		delete: []
		'update:selected': [value: boolean]
	}>()
</script>

<style lang="scss" scoped>
	.upload-card {
		background: var(--bg-secondary);
		border: 1px solid var(--text-primary);
		border-radius: var(--border-radius-md);
		overflow: hidden;
		position: relative;

		&.selected {
			border-color: var(--brand-primary);
			box-shadow: 0 0 0 2px var(--brand-primary);
		}

		.select-toggle {
			background: var(--bg-secondary);
			border-radius: var(--border-radius-sm);
			left: 0.5rem;
			line-height: 0;
			padding: 0.125rem;
			position: absolute;
			top: 0.5rem;
			z-index: 1;

			input {
				cursor: pointer;
				height: 1.125rem;
				width: 1.125rem;
			}
		}

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
