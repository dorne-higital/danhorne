<template>
	<section
		class="cb-quote"
		:class="`align-${align}`"
	>
		<div class="sw">
			<figure class="inner">
				<Icon
					name="lucide:quote"
					class="mark"
					aria-hidden="true"
				/>

				<!-- eslint-disable-next-line vue/no-v-html -->
				<blockquote
					class="quote"
					v-html="quote"
				/>

				<figcaption
					v-if="name || role"
					class="attribution"
				>
					<span
						v-if="name"
						class="name"
					>
						{{ name }}
					</span>
					<span
						v-if="role"
						class="role text-secondary"
					>
						{{ role }}
					</span>
				</figcaption>
			</figure>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			quote?: string
			name?: string
			role?: string
			align?: 'center' | 'left'
		}>(),
		{
			quote: '',
			name: '',
			role: '',
			align: 'center',
		},
	)
</script>

<style lang="scss" scoped>
	.cb-quote {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.inner {
			margin-inline: auto;
			max-width: 48rem;
		}

		.mark {
			color: var(--brand-primary);
			font-size: 2.5rem;
			opacity: 0.5;
		}

		.quote {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: clamp(1.375rem, 3vw, var(--h2-size));
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
			margin-top: var(--padding-sm);
		}

		.attribution {
			display: flex;
			flex-direction: column;
			margin-top: var(--padding-lg);

			.name {
				color: var(--text-primary);
				font-weight: 700;
			}

			.role {
				font-size: var(--eyebrow-size);
			}
		}

		&.align-center {
			text-align: center;

			.inner {
				align-items: center;
				display: flex;
				flex-direction: column;
			}
		}
	}
</style>
