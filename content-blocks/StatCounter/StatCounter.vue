<template>
	<section class="cb-stat-counter">
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
			>
				<div
					v-for="item in items"
					:key="item.id"
					:ref="(el) => setItemRef(item.id, el)"
					class="stat"
					:data-stat-id="item.id"
				>
					<p class="value">
						{{ item.prefix }}{{ (displayValues[item.id] ?? item.value ?? 0).toLocaleString()
						}}{{ item.suffix }}
					</p>
					<p
						v-if="item.label"
						class="label caption text-secondary"
					>
						{{ item.label }}
					</p>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	interface Item {
		id: string
		prefix?: string
		value?: number
		suffix?: string
		label?: string
	}

	const props = withDefaults(
		defineProps<{
			heading?: string
			subheading?: string
			items?: Item[]
		}>(),
		{
			heading: '',
			subheading: '',
			items: () => [],
		},
	)

	// Starts at each stat's real final value — correct with no JS/before
	// hydration, and for `prefers-reduced-motion`, this is simply never
	// touched again. Animation is a pure progressive enhancement on top.
	const displayValues = ref<Record<string, number>>(
		Object.fromEntries(props.items.map((item) => [item.id, item.value ?? 0])),
	)

	const itemRefs: Record<string, Element | null> = {}
	function setItemRef(id: string, el: unknown) {
		itemRefs[id] = el as Element | null
	}

	let observer: IntersectionObserver | undefined

	onMounted(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue
					const id = (entry.target as HTMLElement).dataset.statId
					const item = props.items.find((candidate) => candidate.id === id)
					if (id && item) animateValue(id, item.value ?? 0)
					observer?.unobserve(entry.target)
				}
			},
			{ threshold: 0.4 },
		)

		for (const el of Object.values(itemRefs)) {
			if (el) observer.observe(el)
		}
	})

	onUnmounted(() => observer?.disconnect())

	function animateValue(id: string, target: number) {
		const duration = 1200
		const start = performance.now()
		displayValues.value[id] = 0

		function frame(now: number) {
			const progress = Math.min((now - start) / duration, 1)
			displayValues.value[id] = Math.round(target * progress)
			if (progress < 1) requestAnimationFrame(frame)
		}
		requestAnimationFrame(frame)
	}
</script>

<style lang="scss" scoped>
	.cb-stat-counter {
		background: var(--bg-primary);
		padding-block: var(--padding-xl);

		.section-heading {
			margin-bottom: var(--padding-xl);
		}

		.grid {
			display: grid;
			gap: var(--padding-lg);
			grid-template-columns: repeat(2, 1fr);
			text-align: center;

			@media (width >= 768px) {
				grid-template-columns: repeat(4, 1fr);
			}
		}

		.value {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-size: clamp(var(--h3-size), 5vw, var(--h1-size));
			font-variant-numeric: tabular-nums;
			font-weight: var(--heading-font-weight);
		}

		.label {
			margin-top: var(--padding-xs);
		}
	}
</style>
