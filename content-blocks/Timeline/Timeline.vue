<template>
	<section class="cb-timeline">
		<div class="sw">
			<div
				class="layout"
				:class="{ 'has-image': image }"
			>
				<div class="content">
					<div
						v-if="eyebrow || heading || sub"
						class="intro"
					>
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
							v-if="sub"
							class="sub"
						>
							{{ sub }}
						</p>
					</div>

					<ol
						v-if="items.length"
						class="rail"
					>
						<li
							v-for="item in items"
							:key="item.id"
							class="entry"
						>
							<span
								class="marker"
								aria-hidden="true"
							/>
							<div class="entry-content">
								<NuxtImg
									v-if="item.image"
									class="thumb"
									:src="item.image"
									:alt="item.imageAlt"
									loading="lazy"
								/>
								<div class="entry-text">
									<span
										v-if="item.label"
										class="label"
									>
										{{ item.label }}
									</span>
									<h3
										v-if="item.title"
										class="title"
									>
										{{ item.title }}
									</h3>
									<p
										v-if="item.text"
										class="text"
									>
										{{ item.text }}
									</p>
								</div>
							</div>
						</li>
					</ol>
				</div>

				<div
					v-if="image"
					class="visual"
				>
					<NuxtImg
						class="photo"
						:src="image"
						:alt="imageAlt"
						loading="lazy"
					/>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			sub?: string
			image?: string
			imageAlt?: string
			items?: { id: string; label?: string; title?: string; text?: string; image?: string; imageAlt?: string }[]
		}>(),
		{
			eyebrow: '',
			heading: '',
			sub: '',
			image: '',
			imageAlt: '',
			items: () => [],
		},
	)
</script>

<style lang="scss" scoped>
	.cb-timeline {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.layout {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xl);
		}

		.content {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xl);
			max-width: 42rem;
		}

		.intro {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
		}

		.eyebrow {
			color: var(--brand-primary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.04em;
			text-transform: uppercase;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h2-size);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.sub {
			color: var(--text-secondary);
			font-size: var(--body-size);
			line-height: var(--leading-normal);
		}

		.rail {
			display: flex;
			flex-direction: column;
			gap: var(--padding-lg);
			list-style: none;
			margin: 0;
			padding: 0;
		}

		.entry {
			display: flex;
			gap: var(--padding-md);
			position: relative;

			&:not(:last-child)::before {
				background: var(--border);
				bottom: calc(var(--padding-lg) * -1);
				content: '';
				left: 5px;
				position: absolute;
				top: 1.5rem;
				width: 2px;
			}
		}

		.marker {
			background: var(--brand-primary);
			border-radius: 50%;
			flex-shrink: 0;
			height: 12px;
			margin-top: 0.4rem;
			width: 12px;
		}

		.entry-content {
			align-items: flex-start;
			display: flex;
			flex: 1;
			gap: var(--padding-md);

			@media (width <= 640px) {
				flex-direction: column;
			}
		}

		.thumb {
			border-radius: var(--border-radius-sm);
			flex-shrink: 0;
			height: 64px;
			object-fit: cover;
			width: 64px;
		}

		.entry-text {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
		}

		.label {
			color: var(--brand-primary);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.03em;
			text-transform: uppercase;
		}

		.title {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: var(--h5-size);
			font-weight: var(--heading-font-weight);
		}

		.text {
			color: var(--text-secondary);
			font-size: var(--body-size);
			line-height: var(--leading-normal);
		}

		.photo {
			border-radius: var(--border-radius-lg);
			display: block;
			height: auto;
			width: 100%;
		}

		// Only switches to a side-by-side layout once there's enough width
		// for both the timeline and a meaningful image column — below that
		// the image just stacks above the timeline, no sticky behavior.
		@media (width >= 1024px) {
			.layout.has-image {
				align-items: start;
				display: grid;
				gap: var(--padding-xl);
				grid-template-columns: 1.1fr 1fr;
			}

			.layout.has-image .content {
				max-width: none;
			}

			// The classic sticky-sidebar trick: the image pins in place
			// once scrolled to `top`, staying put while the timeline scrolls
			// past beside it, then releases naturally once .layout (its
			// containing block) runs out of height — no JS, no fixed-height
			// scroll box to trap the page's scroll.
			.visual {
				position: sticky;
				top: var(--padding-xl);
			}
		}
	}
</style>
