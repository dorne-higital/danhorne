<template>
	<section
		v-if="items.length"
		class="cb-logo-strip"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<h3
				v-if="heading"
				class="heading text-secondary"
			>
				{{ heading }}
			</h3>

			<div class="strip">
				<component
					:is="item.href ? 'a' : 'span'"
					v-for="item in items"
					:key="item.id"
					:href="item.href ? normalizeHref(item.href) : undefined"
					:target="item.href && isExternalHref(item.href) ? '_blank' : undefined"
					:rel="item.href && isExternalHref(item.href) ? 'noopener noreferrer' : undefined"
					class="logo"
					:title="item.name"
				>
					<NuxtImg
						:src="item.logo"
						:alt="item.name"
						loading="lazy"
					/>
				</component>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			heading?: string
			items?: { id: string; logo?: string; name?: string; href?: string }[]
			minimalPadding?: boolean
		}>(),
		{
			heading: '',
			items: () => [],
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.cb-logo-strip {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.heading {
			margin-bottom: var(--padding-lg);
			text-align: center;
		}

		.strip {
			align-items: center;
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-xl);
			justify-content: center;
		}

		.logo {
			align-items: center;
			display: flex;
			filter: grayscale(100%);
			height: 4rem;
			transition:
				filter var(--transition-base),
				opacity var(--transition-base),
				transform var(--transition-base);

			&:hover {
				filter: grayscale(0);
				opacity: 1;
				transform: scale(1.08);
			}

			img {
				height: 100%;
				object-fit: contain;
				width: auto;
			}
		}
	}
</style>
