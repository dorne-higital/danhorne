<template>
	<Modal
		:open="open"
		title="Choose an image"
		size="lg"
		@update:open="(value) => emit('update:open', value)"
	>
		<div class="media-picker">
			<div class="toolbar">
				<input
					ref="fileInput"
					type="file"
					accept="image/*"
					class="file-input"
					@change="onFileChange"
				/>
				<button
					type="button"
					class="btn primary sm"
					:disabled="uploading"
					@click="fileInput?.click()"
				>
					{{ uploading ? 'Uploading…' : 'Upload new image' }}
				</button>
			</div>

			<p
				v-if="error"
				class="error"
				role="alert"
			>
				{{ error }}
			</p>

			<div
				v-if="uploads?.length"
				class="grid"
			>
				<button
					v-for="item in uploads"
					:key="item.id"
					type="button"
					class="thumb"
					@click="choose(item.url)"
				>
					<NuxtImg
						:src="item.url"
						:alt="item.filename"
						loading="lazy"
					/>
				</button>
			</div>
			<p
				v-else
				class="empty"
			>
				No uploads yet — upload an image above to get started.
			</p>
		</div>
	</Modal>
</template>

<script setup lang="ts">
	defineProps<{
		open: boolean
	}>()

	const emit = defineEmits<{
		'update:open': [value: boolean]
		select: [url: string]
	}>()

	const { uploads, uploading, error, upload } = useUploads()

	const fileInput = ref<HTMLInputElement>()

	async function onFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0]
		if (!file) return

		try {
			const uploaded = await upload(file)
			choose(uploaded.url)
		} catch {
			// error is already surfaced via `error`
		} finally {
			if (fileInput.value) fileInput.value.value = ''
		}
	}

	function choose(url: string) {
		emit('select', url)
		emit('update:open', false)
	}
</script>

<style lang="scss" scoped>
	.media-picker {
		display: flex;
		flex-direction: column;
		gap: $space-md;

		.toolbar {
			display: flex;
		}

		.file-input {
			display: none;
		}

		.error {
			color: var(--error);
			font-size: $text-sm;
			font-weight: $weight-semibold;
		}

		.grid {
			display: grid;
			gap: $space-sm;
			grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
		}

		.thumb {
			aspect-ratio: 1;
			background: var(--bg-alt);
			border: 1px solid var(--border);
			border-radius: $radius-sm;
			cursor: pointer;
			overflow: hidden;
			padding: 0;

			&:hover {
				border-color: var(--secondary);
			}

			img {
				height: 100%;
				object-fit: cover;
				width: 100%;
			}
		}

		.empty {
			color: var(--text-muted);
			font-size: $text-sm;
		}
	}
</style>
