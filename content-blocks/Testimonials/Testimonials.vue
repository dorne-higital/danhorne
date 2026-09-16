<template>
	<section
		class="testimonials"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="container sw">
			<TestimonialCard
				class="panel"
				:style="{ '--width': width }"
				:quote="quote"
				:name="name"
				:role="role"
				:initials="initials"
				:size="size"
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			quote?: string
			size?: 'h1' | 'h2' | 'h3' | 'h4'
			initials?: string
			name?: string
			role?: string
			width?: string
			minimalPadding?: boolean
		}>(),
		{
			quote: '',
			size: 'h2',
			initials: '',
			name: '',
			role: '',
			width: '9',
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.testimonials {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.panel {
			margin-inline: auto;
			width: 100%;

			@media (width >= 1024px) {
				max-width: calc(100% * var(--width, 9) / 12);
			}
		}
	}
</style>
