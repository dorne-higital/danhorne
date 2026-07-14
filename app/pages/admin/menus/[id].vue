<template>
	<div class="admin-menu-editor sw">
		<header class="editor-header">
			<NuxtLink
				to="/admin/menus"
				class="back"
			>
				← Menus
			</NuxtLink>
			<h1>{{ menu?.name }}</h1>
			<button
				type="button"
				class="btn primary"
				:disabled="saving"
				@click="save"
			>
				{{ saving ? 'Saving…' : 'Save' }}
			</button>
		</header>

		<div class="toolbar">
			<button
				type="button"
				class="btn outline sm"
				@click="addLink"
			>
				+ Add link
			</button>
			<button
				type="button"
				class="btn outline sm"
				@click="showPagePicker = true"
			>
				+ Add page
			</button>
		</div>

		<MenuItemNode
			:items="items"
			:depth="0"
		/>
		<p
			v-if="!items.length"
			class="empty"
		>
			No items yet — add a link or a page to get started.
		</p>

		<PagePicker
			:open="showPagePicker"
			@update:open="(value) => (showPagePicker = value)"
			@select="onPageSelected"
		/>
	</div>
</template>

<script setup lang="ts">
	import type { MenuItem, MenuRecord, PageSummary } from '#shared/types/cms'

	definePageMeta({ layout: 'admin' })

	const route = useRoute()
	const id = route.params.id as string

	const { data: menu } = await useFetch<MenuRecord>(`/api/menus/${id}`)

	if (!menu.value) {
		throw createError({ statusCode: 404, statusMessage: 'Menu not found' })
	}

	const items = ref<MenuItem[]>(structuredClone(menu.value.items))

	const showPagePicker = ref(false)
	const saving = ref(false)
	const toast = useToast()

	const dirty = ref(false)
	watch(items, () => (dirty.value = true), { deep: true })
	useUnsavedChanges(dirty)

	function addLink() {
		items.value.push({
			id: crypto.randomUUID(),
			label: 'New link',
			href: '/',
			newTab: false,
			children: [],
		})
	}

	function onPageSelected(page: PageSummary) {
		items.value.push({
			id: crypto.randomUUID(),
			label: page.title,
			href: page.slug,
			newTab: false,
			children: [],
		})
	}

	async function save() {
		saving.value = true
		try {
			await $fetch(`/api/menus/${id}`, {
				method: 'PUT',
				body: { items: items.value },
			})
			toast.show('Saved.')
			dirty.value = false
		} catch (err: any) {
			toast.show(err?.data?.statusMessage ?? 'Could not save menu', 'error')
		} finally {
			saving.value = false
		}
	}
</script>

<style lang="scss" scoped>
	.admin-menu-editor {
		padding-block: $space-xl;

		.editor-header {
			align-items: center;
			display: flex;
			gap: $space-md;
			margin-bottom: $space-md;

			.back {
				color: var(--text-muted);
				font-size: $text-sm;
				font-weight: $weight-semibold;
			}

			h1 {
				flex: 1;
				font-family: $font-display;
				font-size: $text-2xl;
				font-weight: $weight-bold;
			}
		}

		.toolbar {
			display: flex;
			gap: $space-sm;
			margin-bottom: $space-lg;
		}

		.empty {
			color: var(--text-muted);
		}
	}
</style>
