// Site-wide favourite content-block types, shared by BlockPicker.vue,
// InsertBlockMenu.vue, and /admin/components — all three read from the same
// useSiteSettings() 'site-settings' useFetch key, so a toggle from any one
// of them updates the others' view too once refreshed.
export function useFavouriteBlocks() {
	const { data: settings, refresh } = useSiteSettings()

	const favouriteTypes = computed(() => new Set(settings.value?.favourite_blocks ?? []))

	function isFavourite(type: string): boolean {
		return favouriteTypes.value.has(type)
	}

	async function toggleFavourite(type: string) {
		const current = settings.value?.favourite_blocks ?? []
		const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type]

		try {
			await $fetch('/api/settings', { method: 'PATCH', body: { favourite_blocks: next } })
			await refresh()
		} catch (err) {
			useToast().show(getApiErrorMessage(err, 'Could not update favourites'), 'error')
		}
	}

	return { favouriteTypes, isFavourite, toggleFavourite }
}
