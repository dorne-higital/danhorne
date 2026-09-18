<template>
	<section
		v-if="validItems.length"
		class="cb-table-of-contents"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<div
				class="toc-wrap"
				:style="{ '--width': width }"
			>
				<nav
					class="toc-nav"
					aria-label="Table of contents"
				>
					<a
						v-for="(item, index) in validItems"
						:key="item.id"
						class="toc-chip"
						:class="{ active: activeId === item.anchorId }"
						:href="chipHref(item.anchorId)"
						:target="chipTarget(item.anchorId)"
						:rel="chipRel(item.anchorId)"
						:aria-current="activeId === item.anchorId ? 'true' : undefined"
						@click="handleClick($event, item.anchorId)"
					>
						<span
							class="index"
							aria-hidden="true"
							>{{ index + 1 }}</span
						>
						<span class="label">{{ item.label }}</span>
					</a>
				</nav>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	interface TocItem {
		id: string
		label?: string
		anchorId?: string
	}

	const props = withDefaults(
		defineProps<{
			items?: TocItem[]
			width?: string
			minimalPadding?: boolean
		}>(),
		{
			items: () => [],
			width: '12',
			minimalPadding: false,
		},
	)

	// Only items with both a label and an anchor ID are renderable/linkable —
	// this also narrows the type so downstream code can rely on both being
	// non-empty strings without further checks.
	const validItems = computed(() =>
		props.items.filter((item): item is TocItem & { label: string; anchorId: string } =>
			Boolean(item.label?.trim() && item.anchorId?.trim()),
		),
	)

	function chipHref(anchorId: string): string {
		return normalizeHref(`#${anchorId}`)
	}

	function chipTarget(anchorId: string): '_blank' | undefined {
		return isExternalHref(chipHref(anchorId)) ? '_blank' : undefined
	}

	function chipRel(anchorId: string): 'noopener noreferrer' | undefined {
		return isExternalHref(chipHref(anchorId)) ? 'noopener noreferrer' : undefined
	}

	const activeId = ref<string | null>(null)

	let observer: IntersectionObserver | null = null

	onMounted(() => {
		const targets = validItems.value
			.map((item) => {
				const el = document.getElementById(item.anchorId)
				return el ? { id: item.anchorId, el } : null
			})
			.filter((target): target is { id: string; el: HTMLElement } => target !== null)

		if (!targets.length) return

		// Topmost-first document order, so when the "active band" (see
		// rootMargin below) straddles more than one section at once, the
		// first one wins rather than whichever the observer happened to
		// report last.
		targets.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))

		// IntersectionObserver only reports elements whose intersection
		// state changed since the last callback, not every observed
		// element every time — so the set of currently-intersecting ids
		// has to be accumulated across callbacks, not read fresh from
		// `entries` alone.
		const intersecting = new Set<string>()

		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const id = (entry.target as HTMLElement).id
					if (entry.isIntersecting) intersecting.add(id)
					else intersecting.delete(id)
				}

				const topmost = targets.find((target) => intersecting.has(target.id))
				// Keep the previous active chip lit rather than clearing it
				// when nothing is currently in the active band (e.g. past
				// the last section, at the very bottom of the page).
				if (topmost) activeId.value = topmost.id
			},
			{ rootMargin: '-10% 0px -70% 0px', threshold: 0 },
		)

		for (const target of targets) observer.observe(target.el)
	})

	onBeforeUnmount(() => {
		observer?.disconnect()
	})

	// This site's AppHeader is a fixed 72px bar, so a plain scrollIntoView
	// lands the target flush with the viewport top — directly underneath
	// it. Scrolling to a manually offset position (rather than relying on
	// the anchor's native focus/scroll handling, which real clicks don't
	// reliably let a smooth scrollIntoView override) keeps the target
	// clear of the header and works consistently for real user clicks.
	const HEADER_OFFSET = 72 + 16

	function handleClick(event: MouseEvent, anchorId: string) {
		event.preventDefault()
		const el = document.getElementById(anchorId)
		if (!el) return

		const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
		window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
		activeId.value = anchorId
		history.replaceState(null, '', `#${anchorId}`)
	}
</script>

<style lang="scss" scoped>
	.cb-table-of-contents {
		background: var(--bg-primary);
		padding-block: var(--section-padding-block);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.toc-wrap {
			margin-inline: auto;
			width: 100%;

			@media (width >= 1024px) {
				max-width: calc(100% * var(--width, 12) / 12);
			}
		}

		.toc-nav {
			background: var(--bg-secondary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-lg);
			box-shadow: var(--shadow-sm);
			display: flex;
			flex-wrap: wrap;
			gap: var(--padding-xs);
			padding: var(--padding-sm);

			@media (width >= 1024px) {
				position: sticky;
				top: 72px;
				z-index: 5;
			}
		}

		.toc-chip {
			align-items: center;
			background: var(--bg-primary);
			border: 1px solid var(--border);
			border-radius: var(--border-radius-pill);
			color: var(--text-secondary);
			display: inline-flex;
			font-family: var(--body-font-family);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			gap: var(--padding-xs);
			padding: var(--padding-xs) var(--padding-md);
			text-decoration: none;
			transition:
				background var(--transition-base),
				border-color var(--transition-base),
				box-shadow var(--transition-spring),
				color var(--transition-base),
				transform var(--transition-spring);
			white-space: nowrap;

			&:hover {
				border-color: var(--border-strong);
				box-shadow: var(--shadow-sm);
				color: var(--text-primary);
				transform: translateY(-2px);

				.index {
					background: var(--bg-secondary);
					color: var(--text-primary);
				}
			}

			&:active {
				transform: translateY(-1px);
			}

			&.active {
				background: var(--brand-primary);
				border-color: var(--brand-primary);
				box-shadow: var(--shadow-md);
				color: var(--text-inverse);

				.index {
					background: var(--text-inverse);
					color: var(--brand-primary);
				}
			}
		}

		.index {
			align-items: center;
			background: var(--bg-secondary);
			border-radius: 50%;
			color: var(--text-secondary);
			display: inline-flex;
			flex-shrink: 0;
			font-size: 11px;
			font-weight: 700;
			height: 1.3em;
			justify-content: center;
			line-height: 1;
			transition:
				background var(--transition-base),
				color var(--transition-base);
			width: 1.3em;
		}

		.label {
			line-height: var(--leading-tight);
		}
	}
</style>
