<template>
	<section
		v-if="hasDetails"
		class="cb-contact-details"
	>
		<div class="sw">
			<div class="card">
				<h2
					v-if="heading"
					class="heading"
				>
					{{ heading }}
				</h2>

				<ul class="list">
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
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			heading?: string
			address?: string
			phone?: string
			email?: string
			hours?: string
		}>(),
		{
			heading: '',
			address: '',
			phone: '',
			email: '',
			hours: '',
		},
	)

	const hasDetails = computed(() => !!(props.address || props.phone || props.email || props.hours))
</script>

<style lang="scss" scoped>
	.cb-contact-details {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.card {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-lg);
			margin-inline: auto;
			max-width: 32rem;
			padding: var(--padding-lg);
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h4-size);
			font-weight: var(--heading-font-weight);
			margin-bottom: var(--padding-md);
		}

		.list {
			display: flex;
			flex-direction: column;
			gap: var(--padding-sm);
		}

		li {
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

		.icon {
			color: var(--brand-primary);
			flex-shrink: 0;
			height: 1.125rem;
			margin-top: 2px;
			width: 1.125rem;
		}

		.hours .prose {
			color: var(--text-secondary);
		}
	}
</style>
