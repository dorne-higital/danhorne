<template>
	<section class="cb-newsletter">
		<div class="sw">
			<div class="panel">
				<div class="content">
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
						v-if="caption"
						class="caption text-secondary"
					>
						{{ caption }}
					</p>
				</div>

				<div
					v-if="formId"
					class="form-wrap"
				>
					<DynamicForm :form-id="formId" />
				</div>
				<p
					v-else
					class="no-form"
				>
					No form selected — choose one in the block editor.
				</p>
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
		}>(),
		{
			eyebrow: '',
			heading: '',
			caption: '',
			formId: '',
		},
	)
</script>

<style lang="scss" scoped>
	.cb-newsletter {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

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

		.content {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h3-size);
			font-weight: var(--heading-font-weight);
		}

		.caption {
			font-size: var(--body-size);
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
