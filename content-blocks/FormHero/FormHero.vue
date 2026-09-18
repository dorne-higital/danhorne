<template>
	<section
		class="cb-form-hero"
		:class="[`layout-${layout}`, minimalPadding ? 'small-padding' : '']"
	>
		<div
			v-if="layout === 'split'"
			class="inner sw"
		>
			<div class="content">
				<span
					v-if="eyebrow"
					class="eyebrow"
				>
					{{ eyebrow }}
				</span>

				<!-- eslint-disable-next-line vue/no-v-html -->
				<h1
					v-if="heading"
					class="heading"
					v-html="heading"
				/>

				<h4
					v-if="sub"
					class="sub text-secondary"
				>
					{{ sub }}
				</h4>

				<ul
					v-if="trustItems.length"
					class="trust"
				>
					<li
						v-for="item in trustItems"
						:key="item.id"
					>
						<span class="check-badge">
							<Icon
								name="lucide:check"
								aria-hidden="true"
							/>
						</span>
						<span>{{ item.label }}</span>
					</li>
				</ul>
			</div>

			<div class="form-card">
				<FormOrPlaceholder :form-id="formId" />
			</div>
		</div>

		<div
			v-else
			class="overlap-wrap sw"
		>
			<div class="visual">
				<NuxtImg
					v-if="image"
					class="bg"
					:src="image"
					:alt="imageAlt"
					loading="lazy"
				/>
			</div>

			<div class="form-card overlap-card">
				<span
					class="glow"
					aria-hidden="true"
				/>

				<span
					v-if="eyebrow"
					class="eyebrow"
				>
					{{ eyebrow }}
				</span>

				<!-- eslint-disable-next-line vue/no-v-html -->
				<h2
					v-if="heading"
					class="heading"
					v-html="heading"
				/>

				<h4
					v-if="sub"
					class="sub text-secondary"
				>
					{{ sub }}
				</h4>

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
			sub?: string
			layout?: 'split' | 'overlap'
			image?: string
			imageAlt?: string
			trustItems?: { id: string; label?: string }[]
			formId?: string
			minimalPadding?: boolean
		}>(),
		{
			eyebrow: '',
			heading: 'Get your free quote',
			sub: '',
			layout: 'split',
			image: '',
			imageAlt: '',
			trustItems: () => [],
			formId: '',
			minimalPadding: false,
		},
	)
</script>

<style lang="scss" scoped>
	.cb-form-hero {
		background: var(--bg-primary);
		overflow: hidden;

		// Mobile-first: the doubled padding below is tuned for the
		// two-column desktop layouts — left at that value on a
		// phone-height viewport it reads as a big empty gap before
		// anything shows.
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		@media (width >= 768px) {
			padding-block: calc(var(--padding-xl) * 2);
		}

		.eyebrow {
			color: var(--brand-primary);
			display: block;
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.06em;
			text-transform: uppercase;
		}

		.heading {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-weight: var(--heading-font-weight);
			line-height: var(--leading-tight);
		}

		.sub {
			font-size: 1.125rem;
			line-height: var(--leading-normal);
		}

		// ─── Split layout ──────────────────────────────────────────────
		&.layout-split {
			.inner {
				align-items: start;
				display: grid;
				gap: var(--padding-lg);
				grid-template-columns: 1fr;

				@media (width >= 1024px) {
					align-items: center;
					gap: calc(var(--padding-xl) * 1.5);
					grid-template-columns: 1.1fr 1fr;
				}
			}

			.content {
				display: flex;
				flex-direction: column;
				gap: var(--padding-md);
			}

			.heading {
				font-size: clamp(var(--h1-size), 5vw, var(--hero-size));
				margin-top: var(--padding-xs);
			}

			.sub {
				max-width: 48ch;
			}

			.trust {
				display: flex;
				flex-direction: column;
				gap: var(--padding-sm);
				margin-top: var(--padding-sm);

				li {
					align-items: center;
					color: var(--text-primary);
					display: flex;
					font-size: var(--body-size);
					font-weight: 500;
					gap: var(--padding-sm);
				}

				.check-badge {
					align-items: center;
					background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
					border-radius: 50%;
					color: var(--brand-primary);
					display: flex;
					flex-shrink: 0;
					height: 1.5rem;
					justify-content: center;
					width: 1.5rem;

					:deep(svg) {
						height: 0.875rem;
						width: 0.875rem;
					}
				}
			}

			> .inner > .form-card {
				background: var(--bg-secondary);
				border: 1px solid var(--border);
				border-radius: var(--border-radius-lg);
				box-shadow: var(--shadow-md);
				overflow: hidden;
				padding: var(--padding-lg);
				position: relative;
				transition:
					box-shadow var(--transition-base),
					transform var(--transition-spring);

				// A thin brand-gradient accent along the top edge — a small
				// detail that keeps a plain form container from feeling like
				// an afterthought bolted onto the hero.
				&::before {
					background: linear-gradient(90deg, var(--brand-primary), var(--brand-secondary));
					content: '';
					height: 4px;
					inset: 0 0 auto;
					position: absolute;
				}

				&:focus-within {
					box-shadow: var(--shadow-lg);
					transform: translateY(-2px);
				}

				@media (width >= 768px) {
					padding: calc(var(--padding-lg) * 1.25);
				}
			}
		}

		// ─── Overlap layout ────────────────────────────────────────────
		&.layout-overlap {
			.overlap-wrap {
				position: relative;
			}

			.visual {
				aspect-ratio: 4 / 3;
				background: var(--bg-secondary);
				border-radius: var(--border-radius-lg);
				overflow: hidden;
				position: relative;
				width: 100%;

				@media (width >= 1024px) {
					aspect-ratio: 16 / 9;
					width: 88%;
				}
			}

			.bg {
				display: block;
				height: 100%;
				object-fit: cover;
				width: 100%;
			}

			.form-card.overlap-card {
				background: var(--bg-secondary);
				border-radius: var(--border-radius-lg);
				box-shadow: var(--shadow-lg);
				display: flex;
				flex-direction: column;
				gap: var(--padding-md);
				margin-inline: auto;
				margin-top: calc(var(--padding-lg) * -1.5);
				max-width: 26rem;
				padding: var(--padding-lg);
				position: relative;
				transition:
					box-shadow var(--transition-base),
					transform var(--transition-spring);
				width: min(90%, 26rem);
				z-index: 2;

				&:focus-within {
					transform: translateY(-2px);
				}

				.glow {
					background: radial-gradient(circle, var(--brand-primary) 0%, transparent 70%);
					border-radius: 50%;
					filter: blur(56px);
					height: 220px;
					opacity: 0.3;
					position: absolute;
					right: -60px;
					top: -60px;
					width: 220px;
					z-index: -1;
				}

				@media (width >= 1024px) {
					margin-top: 0;
					padding: calc(var(--padding-lg) * 1.25);
					position: absolute;
					right: -4%;
					top: 50%;
					transform: translateY(-50%);
					width: 23rem;

					&:focus-within {
						transform: translateY(calc(-50% - 2px));
					}
				}
			}
		}
	}
</style>
