<template>
	<section
		class="cb-newsletter"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<div class="panel">
				<div class="content">
					<BlockHead
						:eyebrow="eyebrow"
						:heading="heading"
						:caption="caption"
						rich-caption
						size="h3"
					/>
				</div>

				<FormOrPlaceholder :form-id="formId" />
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			caption?: string
			formId?: string
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: '',
			caption: '',
			formId: '',
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.cb-newsletter {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.panel {
			align-items: center;
			background: var(--bg-secondary);
			border-radius: var(--border-radius-lg);
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: 1fr;
			padding: var(--padding-lg);

			@media (width >= 768px) {
				grid-template-columns: 1fr auto;
				padding: var(--padding-xl);
			}
		}

		.form-wrap {
			width: 100%;

			@media (width >= 768px) {
				min-width: 22rem;
			}
		}

		.no-form {
			color: var(--text-secondary);
		}
	}
</style>
