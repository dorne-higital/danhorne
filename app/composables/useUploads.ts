import type { UploadRecord } from '#shared/types/cms'

export function useUploads() {
	// Explicit key — called from /admin/uploads and every MediaPicker.vue
	// instance across the admin (many pages). Same reasoning as the key on
	// useAdminProfile()'s fetch.
	const { data: uploads, refresh } = useFetch<UploadRecord[]>('/api/uploads', { key: 'admin-uploads' })

	const uploading = ref(false)
	const error = ref('')

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
			error.value = err?.data?.statusMessage ?? 'Could not upload image'
			throw err
		} finally {
			uploading.value = false
		}
	}

	async function remove(id: string) {
		await $fetch(`/api/uploads/${id}`, { method: 'DELETE' })
		await refresh()
	}

	return { uploads, refresh, uploading, error, upload, remove }
}
