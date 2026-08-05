<template>
	<section class="cb-team-grid">
		<div class="sw">
			<SectionHeading
				v-if="heading || subheading"
				:heading="heading"
				:subheading="subheading"
				size="medium"
				align="center"
				:no-padding="true"
				class="section-heading"
			/>

			<div
				v-if="items.length"
				class="grid"
				:style="{ '--columns': columns }"
			>
				<div
					v-for="item in items"
					:key="item.id"
					class="person"
				>
					<div class="photo">
						<NuxtImg
							v-if="item.photo"
							:src="item.photo"
							:alt="item.name"
							loading="lazy"
						/>
						<span
							v-else
							class="initials"
							aria-hidden="true"
						>
							{{ initials(item.name) }}
						</span>
					</div>
					<h3
						v-if="item.name"
						class="name"
					>
						{{ item.name }}
					</h3>
					<p
						v-if="item.role"
						class="role text-secondary"
					>
						{{ item.role }}
					</p>
					<p
						v-if="item.bio"
						class="bio text-secondary"
					>
						{{ item.bio }}
					</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			heading?: string
			subheading?: string
			columns?: number
			items?: { id: string; photo?: string; name?: string; role?: string; bio?: string }[]
		}>(),
		{
			heading: '',
			subheading: '',
			columns: 3,
			items: () => [],
		},
	)

	function initials(name?: string): string {
		if (!name) return ''
		return name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('')
	}
</script>

<style lang="scss" scoped>
	.cb-team-grid {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.section-heading {
			margin-bottom: var(--padding-xl);
		}

		.grid {
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: 1fr;

			@media (width >= 640px) {
				grid-template-columns: repeat(2, 1fr);
			}

			@media (width >= 1024px) {
				grid-template-columns: repeat(var(--columns, 3), 1fr);
			}
		}

		.person {
			text-align: center;
		}

		.photo {
			aspect-ratio: 1;
			background: var(--bg-secondary);
			border-radius: var(--border-radius-pill);
			display: flex;
			margin-bottom: var(--padding-md);
			overflow: hidden;
			width: 100%;

			img {
				height: 100%;
				object-fit: cover;
				width: 100%;
			}

			.initials {
				align-items: center;
				color: var(--text-secondary);
				display: flex;
				font-family: var(--heading-font-family);
				font-size: var(--h2-size);
				font-weight: var(--heading-font-weight);
				justify-content: center;
				width: 100%;
			}
		}

		.name {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h4-size);
			font-weight: var(--heading-font-weight);
		}

		.role {
			font-size: var(--eyebrow-size);
			font-weight: 600;
			margin-top: 2px;
		}

		.bio {
			font-size: var(--body-size);
			line-height: var(--leading-normal);
			margin-top: var(--padding-sm);
		}
	}
</style>
