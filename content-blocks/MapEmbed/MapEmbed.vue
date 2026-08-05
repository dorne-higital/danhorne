<template>
	<section class="cb-map-embed">
		<div class="sw">
			<h2
				v-if="heading"
				class="heading"
			>
				{{ heading }}
			</h2>

			<div
				v-if="embedUrl"
				class="frame"
				:class="`height-${height}`"
			>
				<iframe
					:src="embedUrl"
					:title="heading || 'Map'"
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
				/>
			</div>
			<p
				v-else
				class="no-map"
			>
				No map URL set — add one in the block editor.
			</p>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			heading?: string
			embedUrl?: string
			height?: 'sm' | 'md' | 'lg'
		}>(),
		{
			heading: '',
			embedUrl: '',
			height: 'md',
		},
	)
</script>

<style lang="scss" scoped>
	.cb-map-embed {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h3-size);
			font-weight: var(--heading-font-weight);
			margin-bottom: var(--padding-md);
		}

		.frame {
			border-radius: var(--border-radius-lg);
			overflow: hidden;
			width: 100%;

			iframe {
				border: none;
				display: block;
				height: 100%;
				width: 100%;
			}

			&.height-sm {
				height: 16rem;
			}

			&.height-md {
				height: 24rem;
			}

			&.height-lg {
				height: 32rem;
			}
		}

		.no-map {
			color: var(--text-secondary);
		}
	}
</style>
