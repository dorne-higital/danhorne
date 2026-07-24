<template>
	<section class="cb-video-embed">
		<div class="sw">
			<div
				v-if="eyebrow || heading || subheading"
				class="head"
			>
				<span
					v-if="eyebrow"
					class="eyebrow"
				>
					{{ eyebrow }}
				</span>
				<h2
					v-if="heading"
					class="heading"
				>
					{{ heading }}
				</h2>
				<p
					v-if="subheading"
					class="subheading text-secondary"
				>
					{{ subheading }}
				</p>
			</div>

			<div
				v-if="videoUrl"
				class="video-wrap"
			>
				<iframe
					v-if="embedUrl"
					:src="embedUrl"
					:title="heading || 'Video'"
					allow="
						accelerometer;
						autoplay;
						clipboard-write;
						encrypted-media;
						gyroscope;
						picture-in-picture;
						web-share;
					"
					allowfullscreen
				/>
				<video
					v-else
					:src="videoUrl"
					controls
				/>
			</div>

			<p
				v-if="caption"
				class="caption"
			>
				{{ caption }}
			</p>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			subheading?: string
			videoUrl?: string
			caption?: string
		}>(),
		{
			eyebrow: '',
			heading: '',
			subheading: '',
			videoUrl: '',
			caption: '',
		},
	)

	// YouTube/Vimeo links get rewritten to their embeddable iframe form —
	// anything else (a direct .mp4 link, e.g. from /admin/uploads) falls
	// through to a plain <video> element instead.
	function getEmbedUrl(url: string): string | null {
		const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
		if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`

		const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
		if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

		return null
	}

	const embedUrl = computed(() => (props.videoUrl ? getEmbedUrl(props.videoUrl) : null))
</script>

<style lang="scss" scoped>
	.cb-video-embed {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.head {
			margin-inline: auto;
			margin-bottom: var(--padding-lg);
			max-width: 640px;
			text-align: center;

			.eyebrow {
				justify-content: center;
				margin-bottom: var(--padding-sm);
			}

			.heading {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-size: var(--h2-size);
				font-weight: var(--heading-font-weight);
			}

			.subheading {
				font-size: 1.25rem;
				margin-top: var(--padding-sm);
			}
		}

		.video-wrap {
			aspect-ratio: 16 / 9;
			background: var(--bg-secondary);
			border-radius: var(--border-radius-md);
			margin-inline: auto;
			max-width: 960px;
			overflow: hidden;

			iframe,
			video {
				border: none;
				display: block;
				height: 100%;
				width: 100%;
			}
		}

		.caption {
			color: var(--text-secondary);
			font-size: var(--eyebrow-size);
			margin-inline: auto;
			margin-top: var(--padding-sm);
			max-width: 960px;
			text-align: center;
		}
	}
</style>
