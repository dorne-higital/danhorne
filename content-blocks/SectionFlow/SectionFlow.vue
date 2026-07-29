<template>
	<section class="cb-section-flow">
		<div class="sw">
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

			<div
				v-if="sections.length"
				class="flow"
			>
				<div
					v-for="section in sections"
					:key="section.id"
					class="section"
				>
					<NuxtImg
						v-if="section.image"
						class="photo"
						:src="section.image"
						:alt="section.imageAlt"
						loading="lazy"
					/>
					<span
						v-if="section.label"
						class="label"
					>
						{{ section.label }}
					</span>
					<h3
						v-if="section.title"
						class="title"
					>
						{{ section.title }}
					</h3>
					<p
						v-if="section.text"
						class="text"
					>
						{{ section.text }}
					</p>

					<template v-if="showVectors">
						<span
							v-for="(shape, index) in shapesFor(section.id)"
							:key="index"
							class="shape"
							:class="`shape-${shape.type}`"
							aria-hidden="true"
							:style="{
								top: shape.top,
								left: shape.left,
								width: `${shape.size}px`,
								height: `${shape.size}px`,
								transform: `rotate(${shape.rotate}deg)`,
							}"
						>
							<svg
								v-if="shape.type === 'triangle'"
								viewBox="0 0 24 24"
								fill="none"
							>
								<polygon
									points="12,3 21,20 3,20"
									stroke="currentColor"
									stroke-width="2"
								/>
							</svg>
						</span>
					</template>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	type Section = { id: string; label?: string; title?: string; text?: string; image?: string; imageAlt?: string }

	const props = withDefaults(
		defineProps<{
			eyebrow?: string
			heading?: string
			sub?: string
			showVectors?: boolean
			sections?: Section[]
		}>(),
		{
			eyebrow: '',
			heading: '',
			sub: '',
			showVectors: true,
			sections: () => [],
		},
	)

	type ShapeType = 'triangle' | 'circle' | 'square'
	interface Shape {
		type: ShapeType
		top: string
		left: string
		size: number
		rotate: number
	}

	// Corners a shape can be anchored near — deliberately outside the card's
	// own edges so they read as accents poking out, not clutter sitting on
	// top of the text.
	const CORNERS = [
		{ top: -14, left: -14 },
		{ top: -14, left: 100 },
		{ top: 100, left: -14 },
		{ top: 100, left: 100 },
	]
	const SHAPE_TYPES: ShapeType[] = ['triangle', 'circle', 'square']

	// Deterministic per-section "randomness" — derived from the section's
	// own id so every render (and SSR vs. client hydration) places the same
	// two shapes in the same spot, rather than reshuffling on every
	// re-render or mismatching between server and client.
	function seedFrom(id: string): number {
		let hash = 0
		for (let i = 0; i < id.length; i++) {
			hash = (hash << 5) - hash + id.charCodeAt(i)
			hash |= 0
		}
		return hash
	}

	function mulberry32(seed: number) {
		let state = seed
		return () => {
			state = (state + 0x6d2b79f5) | 0
			let t = Math.imul(state ^ (state >>> 15), 1 | state)
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296
		}
	}

	function shapesFor(id: string): Shape[] {
		const random = mulberry32(seedFrom(id))
		const corners = [...CORNERS].sort(() => random() - 0.5).slice(0, 2)
		return corners.map((corner) => ({
			type: SHAPE_TYPES[Math.floor(random() * SHAPE_TYPES.length)]!,
			top: `${corner.top + (random() * 16 - 8)}%`,
			left: `${corner.left + (random() * 16 - 8)}%`,
			size: Math.round(14 + random() * 16),
			rotate: Math.round(random() * 40 - 20),
		}))
	}
</script>

<style lang="scss" scoped>
	.cb-section-flow {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.intro {
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
			margin-bottom: var(--padding-xl);
			max-width: 42rem;
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

		// Mobile-first: a plain stacked column, full width, no overlap. The
		// zigzag below only switches on at tablet width and up.
		.flow {
			display: flex;
			flex-direction: column;
			gap: var(--padding-md);
		}

		.section {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-lg);
			box-shadow: var(--shadow-md);
			display: flex;
			flex-direction: column;
			gap: var(--padding-xs);
			padding: var(--padding-lg);
			position: relative;
		}

		.photo {
			border-radius: var(--border-radius-md);
			display: block;
			height: auto;
			margin-bottom: var(--padding-xs);
			width: 100%;
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
			font-size: var(--h4-size);
			font-weight: var(--heading-font-weight);
		}

		.text {
			color: var(--text-secondary);
			font-size: var(--body-size);
			line-height: var(--leading-normal);
		}

		.shape {
			color: var(--brand-primary);
			display: none;
			position: absolute;
			z-index: 1;

			svg {
				height: 100%;
				width: 100%;
			}
		}

		.shape-circle {
			border: 2px solid var(--brand-secondary);
			border-radius: 50%;
		}

		.shape-square {
			background: var(--brand-accent);
			border-radius: 4px;
		}

		@media (width >= 768px) {
			.section {
				max-width: 640px;
				width: 62%;
			}

			.section:not(:first-child) {
				margin-top: -2.5rem;
			}

			// Alternating left/right per card is what turns the stack into
			// a zigzag — combined with the negative top margin above, that's
			// what makes each card's corner clip into the one before it.
			.section:nth-child(odd) {
				align-self: flex-start;
			}

			.section:nth-child(even) {
				align-self: flex-end;
			}

			.shape {
				display: block;
			}
		}
	}
</style>
