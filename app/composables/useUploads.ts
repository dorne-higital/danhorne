import type { UploadRecord } from '#shared/types/cms'

export interface UploadProgressItem {
	name: string
	status: 'pending' | 'uploading' | 'done' | 'error'
	message?: string
}

// Uploads go browser -> our server -> Supabase Storage, so more in-flight
// requests than this doesn't move file bytes any faster — it just adds
// contention (browser per-host connection limits, server concurrency) and,
// worse, gives zero feedback while it happens. A small bounded queue with
// per-file status is both a bit quicker in practice for many files and lets
// the UI show real progress instead of one generic "Uploading…" state.
const UPLOAD_CONCURRENCY = 3

export function useUploads() {
	const { data: uploads, refresh } = useFetch<UploadRecord[]>('/api/uploads', { key: 'admin-uploads' })

	const uploading = ref(false)
	const error = ref('')
	const progress = ref<UploadProgressItem[]>([])

	async function upload(file: File): Promise<UploadRecord> {
		uploading.value = true
		error.value = ''
		try {
			const formData = new FormData()
			formData.append('file', file)
			const uploaded = await $fetch<UploadRecord>('/api/uploads', { method: 'POST', body: formData })
			await refresh()
			return uploaded
		} catch (err: any) {
			error.value = err?.data?.statusMessage ?? 'Could not upload file'
			throw err
		} finally {
			uploading.value = false
		}
	}

	async function uploadMany(files: File[]): Promise<void> {
		uploading.value = true
		error.value = ''
		progress.value = files.map((file) => ({ name: file.name, status: 'pending' }))
		const failures: string[] = []

		let nextIndex = 0
		async function worker() {
			while (nextIndex < files.length) {
				const i = nextIndex++
				const file = files[i]
				progress.value[i].status = 'uploading'
				try {
					const formData = new FormData()
					formData.append('file', file)
					await $fetch<UploadRecord>('/api/uploads', { method: 'POST', body: formData })
					progress.value[i].status = 'done'
				} catch (err: any) {
					const message = err?.data?.statusMessage ?? 'upload failed'
					progress.value[i].status = 'error'
					progress.value[i].message = message
					failures.push(`${file.name}: ${message}`)
				}
			}
		}

		const workerCount = Math.min(UPLOAD_CONCURRENCY, files.length)
		await Promise.all(Array.from({ length: workerCount }, () => worker()))

		if (failures.length) error.value = failures.join('; ')
		await refresh()
		uploading.value = false
	}

	async function remove(id: string) {
		await $fetch(`/api/uploads/${id}`, { method: 'DELETE' })
		await refresh()
	}

	async function removeMany(ids: string[]): Promise<void> {
		await Promise.all(ids.map((id) => $fetch(`/api/uploads/${id}`, { method: 'DELETE' })))
		await refresh()
	}

	return { uploads, refresh, uploading, error, progress, upload, uploadMany, remove, removeMany }
}
