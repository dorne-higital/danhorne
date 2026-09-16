<template>
	<div
		ref="outerEl"
		class="scaled-block-preview"
		:style="{ height: `${outerHeight}px` }"
	>
		<div
			ref="innerEl"
			class="inner"
			:style="{ width: `${REFERENCE_WIDTH}px`, transform: `scale(${scale})` }"
		>
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
	// The canvas column sits next to the block library / inspector panels, so it's
	// far narrower than a real page — but CSS media queries key off the actual
	// browser viewport, not this column, so every block's desktop breakpoints
	// still fire while having nowhere near enough width to lay out in. Rendering
	// each block at its real desktop width ($container-xl, see _layout.scss) and
	// visually shrinking the result with a CSS transform keeps every media query
	// and layout calculation exactly as it would run on the live site — the
	// canvas becomes an accurate miniature instead of a squeezed, different
	// layout. A transform (not an iframe) also means drag-and-drop, click-to-
	// select and the insert-button overlays in BlockCanvas.vue keep working
	// untouched, since everything still lives in the same document.
	const REFERENCE_WIDTH = 1280

	const outerEl = ref<HTMLElement>()
	const innerEl = ref<HTMLElement>()
	const scale = ref(1)
	const naturalHeight = ref(0)

	const outerHeight = computed(() => naturalHeight.value * scale.value)

	function updateScale() {
		if (!outerEl.value) return
		const availableWidth = outerEl.value.clientWidth
		scale.value = availableWidth > 0 ? availableWidth / REFERENCE_WIDTH : 1
	}

	function updateNaturalHeight() {
		if (!innerEl.value) return
		// scrollHeight reads the element's unscaled layout box — transform
		// only affects painting, not layout — so this is the real height the
		// block would occupy at REFERENCE_WIDTH before shrinking.
		naturalHeight.value = innerEl.value.scrollHeight
	}

	let resizeObserver: ResizeObserver | null = null

	onMounted(() => {
		updateScale()
		updateNaturalHeight()

		resizeObserver = new ResizeObserver(() => {
			updateScale()
			updateNaturalHeight()
		})
		if (outerEl.value) resizeObserver.observe(outerEl.value)
		if (innerEl.value) resizeObserver.observe(innerEl.value)
	})

	onBeforeUnmount(() => {
		resizeObserver?.disconnect()
	})
</script>

<style lang="scss" scoped>
	.scaled-block-preview {
		overflow: hidden;
		position: relative;
		width: 100%;
	}

	.inner {
		transform-origin: top left;
	}
</style>
