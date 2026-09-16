<template>
	<section
		v-if="embedUrl"
		class="cb-map-embed"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<h2
				v-if="heading"
				class="heading"
			>
				{{ heading }}
			</h2>

			<div
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
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			heading?: string
			embedUrl?: string
			height?: 'sm' | 'md' | 'lg'
			minimalPadding?: boolean
		}>(),
		{
			heading: '',
			embedUrl: '',
			height: 'md',
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.cb-map-embed {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

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
	}
</style>
