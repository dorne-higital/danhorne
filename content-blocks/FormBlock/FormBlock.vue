<template>
	<section class="cb-form-block">
		<div class="sw">
			<div class="head">
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
	.cb-form-block {
		background: var(--bg-primary);
		padding-block: calc(var(--padding-xl) * 2);

		.head {
			margin-inline: auto;
			margin-bottom: var(--padding-lg);
			max-width: 640px;
			text-align: center;

			.heading {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-size: var(--h2-size);
				font-weight: var(--heading-font-weight);
			}

			.eyebrow {
				justify-content: center;
				margin-bottom: var(--padding-sm);
			}

			.caption {
				font-size: 1.25rem;
				margin-top: var(--padding-sm);
			}
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
