<template>
	<section class="cb-logo-strip">
		<div class="sw">
			<p
				v-if="heading"
				class="heading caption text-secondary"
			>
				{{ heading }}
			</p>

			<div
				v-if="items.length"
				class="strip"
			>
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
		}>(),
		{
			heading: '',
			items: () => [],
		},
	)
</script>

<style lang="scss" scoped>
	.cb-logo-strip {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

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
			height: 2.25rem;
			opacity: 0.6;
			transition:
				filter var(--transition-base),
				opacity var(--transition-base);

			&:hover {
				filter: none;
				opacity: 1;
			}

			img {
				height: 100%;
				object-fit: contain;
				width: auto;
			}
		}
	}
</style>
