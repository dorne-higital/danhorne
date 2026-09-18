<template>
	<section
		class="cb-form-block"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<div class="content">
				<div class="head">
					<BlockHead
						:eyebrow="eyebrow"
						:heading="heading"
						:caption="caption"
						rich-caption
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
	.cb-form-block {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 2);
		}

		.content {
			background-color: var(--bg-secondary);
			border: 2px solid var(--border-strong);
			border-radius: 20px;
			margin: 0 auto;
			max-width: 640px;
			padding: var(--padding-md);
		}

		.head {
			margin-inline: auto;
			margin-bottom: var(--padding-lg);
			max-width: 640px;
			text-align: center;
		}

		.form-wrap {
			margin-inline: auto;
			max-width: 640px;
		}

		.no-form {
			color: var(--text-secondary);
			text-align: center;
		}
	}
</style>
