import type { ComputedRef, Ref } from 'vue'

export interface UsePaginationOptions {
	pageSize?: number
}

// Client-side pagination over an already-filtered list (search/tab filters
// are applied by the caller before this ever sees the array). Shared across
// every admin list table so page-size options, defaults, and reset
// behaviour stay identical everywhere instead of being re-implemented per
// page — mirrors the pattern originally written for the pages list.
export function usePagination<T>(items: Ref<T[]> | ComputedRef<T[]>, options: UsePaginationOptions = {}) {
	const page = ref(1)
	const pageSize = ref(options.pageSize ?? 10)

	const total = computed(() => items.value.length)
	const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

	const paginated = computed(() => {
		const start = (page.value - 1) * pageSize.value
		return items.value.slice(start, start + pageSize.value)
	})

	// Changing the page size always jumps back to page 1 — "page 3 of 20"
	// becoming "page 3 of 50" after a resize would silently show different
	// rows than the person was just looking at.
	watch(pageSize, () => {
		page.value = 1
	})

	// A narrower search/filter can shrink totalPages below the page someone
	// was already on — clamp down rather than showing an empty page.
	watch(totalPages, (value) => {
		if (page.value > value) page.value = value
	})

	return { page, pageSize, total, totalPages, paginated }
}
