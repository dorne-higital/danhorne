<template>
	<section
		class="cb-contact-split"
		:class="[`variant-${variant}`, minimalPadding ? 'small-padding' : '']"
	>
		<div class="sw">
			<BlockHead
				v-if="eyebrow || heading || caption"
				:eyebrow="eyebrow"
				:heading="heading"
				:caption="caption"
				class="head"
			/>

			<div
				v-if="variant !== 'stacked'"
				class="grid"
			>
				<div class="form-col">
					<FormOrPlaceholder :form-id="formId" />
				</div>

				<div
					v-if="variant === 'map'"
					class="map-col"
				>
					<iframe
						v-if="embedUrl"
						:src="embedUrl"
						title="Map"
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
					/>
				</div>

				<div
					v-else
					class="details-col"
				>
					<ul
						v-if="hasDetails"
						class="list"
					>
						<li v-if="address">
							<Icon
								name="lucide:map-pin"
								class="icon"
								aria-hidden="true"
							/>
							<span>{{ address }}</span>
						</li>
						<li v-if="phone">
							<Icon
								name="lucide:phone"
								class="icon"
								aria-hidden="true"
							/>
							<a :href="`tel:${phone}`">{{ phone }}</a>
						</li>
						<li v-if="email">
							<Icon
								name="lucide:mail"
								class="icon"
								aria-hidden="true"
							/>
							<a :href="`mailto:${email}`">{{ email }}</a>
						</li>
						<li
							v-if="hours"
							class="hours"
						>
							<Icon
								name="lucide:clock"
								class="icon"
								aria-hidden="true"
							/>
							<!-- eslint-disable-next-line vue/no-v-html -->
							<div
								class="prose"
								v-html="hours"
							/>
						</li>
					</ul>
				</div>
			</div>

			<div
				v-else
				class="stacked"
			>
				<ul
					v-if="hasDetails"
					class="details-row"
				>
					<li v-if="address">
						<Icon
							name="lucide:map-pin"
							aria-hidden="true"
						/>
						<span>{{ address }}</span>
					</li>
					<li v-if="phone">
						<Icon
							name="lucide:phone"
							aria-hidden="true"
						/>
						<a :href="`tel:${phone}`">{{ phone }}</a>
					</li>
					<li v-if="email">
						<Icon
							name="lucide:mail"
							aria-hidden="true"
						/>
						<a :href="`mailto:${email}`">{{ email }}</a>
					</li>
					<li
						v-if="hours"
						class="hours"
					>
						<Icon
							name="lucide:clock"
							aria-hidden="true"
						/>
						<!-- eslint-disable-next-line vue/no-v-html -->
						<div
							class="prose"
							v-html="hours"
						/>
					</li>
				</ul>

				<div class="form-col">
					<FormOrPlaceholder :form-id="formId" />
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			caption?: string
			formId?: string
			variant?: 'map' | 'card' | 'stacked'
			embedUrl?: string
			address?: string
			phone?: string
			email?: string
			hours?: string
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: 'Get in touch',
			caption: '',
			formId: '',
			variant: 'map',
			embedUrl: '',
			address: '',
			phone: '',
			email: '',
			hours: '',
			minimalPadding: false,
		},
	)

	const hasDetails = computed(() => !!(props.address || props.phone || props.email || props.hours))
</script>

<style lang="scss" scoped>
	.cb-contact-split {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 2);
		}

		.head {
			margin-inline: auto;
			margin-bottom: var(--padding-xl);
			max-width: 640px;
			text-align: center;
		}

		.grid {
			align-items: start;
			display: grid;
			gap: var(--padding-xl);
			grid-template-columns: 1fr;

			@media (width >= 1024px) {
				grid-template-columns: 1fr 1fr;
			}
		}

		.map-col {
			border-radius: var(--border-radius-lg);
			min-height: 320px;
			overflow: hidden;
			width: 100%;

			iframe {
				border: none;
				display: block;
				height: 100%;
				min-height: 320px;
				width: 100%;
			}
		}

		.details-col .list {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-lg);
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
			padding: var(--padding-lg);
		}

		.list li,
		.details-row li {
			align-items: flex-start;
			color: var(--text-secondary);
			display: flex;
			gap: var(--padding-sm);

			a {
				color: var(--text-secondary);
				transition: color var(--transition-base);

				&:hover {
					color: var(--brand-primary);
				}
			}
		}

		.list .icon {
			color: var(--brand-primary);
			flex-shrink: 0;
			height: 1.125rem;
			margin-top: 2px;
			width: 1.125rem;
		}

		.hours .prose {
			color: var(--text-secondary);
		}

		.stacked {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xl);
		}

		.details-row {
			align-items: center;
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
			justify-content: center;
			margin-inline: auto;

			@media (width >= 768px) {
				flex-flow: row wrap;
				gap: var(--padding-xl);
			}
		}

		.form-col {
			margin-inline: auto;
			max-width: 640px;
			width: 100%;
		}
	}
</style>
