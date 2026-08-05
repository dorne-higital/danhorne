<template>
	<Modal
		:open="open"
		title="Version history"
		size="md"
		@update:open="(value) => emit('update:open', value)"
	>
		<p
			v-if="!loading && revisions.length === 0"
			class="empty"
		>
			No saved versions yet.
		</p>

		<p
			v-else-if="loading"
			class="empty"
		>
			Loading…
		</p>

		<ul
			v-else
			class="revision-list"
		>
			<li
				v-for="(revision, index) in revisions"
				:key="revision.id"
				class="revision"
			>
				<div class="info">
					<span class="title">
						{{ revision.title }}
						<span
							v-if="index === 0"
							class="current-badge"
						>
							Latest
						</span>
					</span>
					<span class="meta">
						{{ new Date(revision.created_at).toLocaleString() }}
						<template v-if="revision.actor?.nickname"> · {{ revision.actor.nickname }} </template>
					</span>
				</div>
				<button
					type="button"
					class="btn outline sm"
					:disabled="index === 0 || restoringId === revision.id"
					@click="restore(revision)"
				>
					{{ restoringId === revision.id ? 'Restoring…' : 'Restore' }}
				</button>
			</li>
		</ul>

		<p
			v-if="error"
			class="error"
			role="alert"
		>
			{{ error }}
		</p>
	</Modal>
</template>

<script setup lang="ts">
	import type { PageRecord, PageRevision } from '#shared/types/cms'

	const props = defineProps<{
		open: boolean
		slug: string
	}>()

	const emit = defineEmits<{
		'update:open': [value: boolean]
		restored: [page: PageRecord]
	}>()

	const revisions = ref<PageRevision[]>([])
	const loading = ref(false)
	const restoringId = ref<string | null>(null)
	const error = ref('')
	const { confirm } = useConfirm()
	const toast = useToast()

	watch(
		() => props.open,
		async (isOpen) => {
			if (!isOpen) return
			loading.value = true
			error.value = ''
			try {
				revisions.value = await $fetch<PageRevision[]>(`/api/pages/${encodeURIComponent(props.slug)}/revisions`)
			} catch (err) {
				error.value = getApiErrorMessage(err, 'Could not load version history')
			} finally {
				loading.value = false
			}
		},
	)

	async function restore(revision: PageRevision) {
		const ok = await confirm(
			`Restore the version from ${new Date(revision.created_at).toLocaleString()}? This replaces your current draft — you'll still need to Publish to make it live. Your last save stays in this history if you need to undo the restore.`,
			{ title: 'Restore version', confirmLabel: 'Restore' },
		)
		if (!ok) return

		restoringId.value = revision.id
		error.value = ''
		try {
			const page = await $fetch<PageRecord>(
				`/api/pages/${encodeURIComponent(props.slug)}/revisions/${revision.id}/restore`,
				{ method: 'POST' },
			)
			toast.show('Restored into your draft — Publish to make it live.')
			emit('restored', page)
			emit('update:open', false)
		} catch (err) {
			error.value = getApiErrorMessage(err, 'Could not restore that version')
		} finally {
			restoringId.value = null
		}
	}
</script>

<style lang="scss" scoped>
	.empty {
		color: var(--text-secondary);
		font-size: 0.9375rem;
	}

	.revision-list {
		display: flex;
		flex-direction: column;
		gap: var(--padding-xs);
		list-style: none;
	}

	.revision {
		align-items: center;
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: var(--border-radius-sm);
		display: flex;
		gap: var(--padding-sm);
		justify-content: space-between;
		padding: var(--padding-sm);
	}

	.info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.title {
		align-items: center;
		display: flex;
		font-weight: 600;
		gap: 0.5rem;
	}

	.current-badge {
		background: var(--success-bg);
		border-radius: var(--border-radius-sm);
		color: var(--success);
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		padding: 0.0625rem 0.375rem;
		text-transform: uppercase;
	}

	.meta {
		color: var(--text-secondary);
		font-size: 0.8125rem;
	}

	.error {
		color: var(--error);
		font-size: 0.9375rem;
		font-weight: 600;
		margin-top: var(--padding-sm);
	}
</style>
