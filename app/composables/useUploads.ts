import type { UploadRecord } from '#shared/types/cms'

export function useUploads() {
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
			error.value = err?.data?.statusMessage ?? 'Could not upload file'
			throw err
		} finally {
			uploading.value = false
		}
	}

	async function uploadMany(files: File[]): Promise<void> {
		uploading.value = true
		error.value = ''
		const failures: string[] = []

		await Promise.all(
			files.map(async (file) => {
				try {
					const formData = new FormData()
					formData.append('file', file)
					await $fetch<UploadRecord>('/api/uploads', { method: 'POST', body: formData })
				} catch (err: any) {
					failures.push(`${file.name}: ${err?.data?.statusMessage ?? 'upload failed'}`)
				}
			}),
		)

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

	return { uploads, refresh, uploading, error, upload, uploadMany, remove, removeMany }
}
