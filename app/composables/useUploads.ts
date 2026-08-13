import type { UploadRecord } from '#shared/types/cms'

export interface UploadProgressItem {
	name: string
	status: 'pending' | 'uploading' | 'done' | 'error'
	message?: string
}

// Files upload straight from the browser to Supabase Storage via a signed
// URL (see sign.post.ts) rather than through our own server, so this cap is
// purely about not overwhelming the browser/network with too many
// simultaneous transfers — it's no longer working around a server-side
// bottleneck. A bounded queue with per-file status also lets the UI show
// real progress instead of one generic "Uploading…" state.
const UPLOAD_CONCURRENCY = 3

// $fetch's error only has a clean `.data.statusMessage` when OUR server
// actually produced it (via createError) — sign/confirm requests are tiny
// JSON, so this should always be the case now, but kept defensive in case
// something upstream (Netlify itself, a network failure) still returns a
// bare HTTP status with no JSON body.
function describeUploadError(err: any): string {
	if (err?.statusCode === 413 || err?.response?.status === 413) {
		return 'File is too large for the server to accept in production (this limit is lower than local dev)'
	}
	return (
		err?.data?.statusMessage ??
		err?.statusMessage ??
		(err?.statusCode ? `Server responded with ${err.statusCode}` : undefined) ??
		err?.message ??
		'Upload failed for an unknown reason'
	)
}

export function useUploads() {
	const { data: uploads, refresh } = useFetch<UploadRecord[]>('/api/uploads', { key: 'admin-uploads' })

	const uploading = ref(false)
	const error = ref('')
	const progress = ref<UploadProgressItem[]>([])

	// Bypasses our server for the actual file bytes: 1) ask for a signed
	// upload slot, 2) upload directly to Supabase Storage from the browser,
	// 3) confirm with our server, which validates the real stored object and
	// inserts the DB record. Both server round trips are tiny JSON — only
	// step 2 carries the file, and that goes straight to Supabase, never
	// through our Netlify Function.
	async function uploadOne(file: File): Promise<UploadRecord> {
		const { path, token } = await $fetch<{ path: string; token: string }>('/api/uploads/sign', {
			method: 'POST',
			body: { filename: file.name, contentType: file.type, size: file.size },
		})

		const supabase = useSupabaseClient()
		const { error: storageError } = await supabase.storage
			.from('uploads')
			.uploadToSignedUrl(path, token, file, { contentType: file.type })
		if (storageError) throw storageError

		return await $fetch<UploadRecord>('/api/uploads/confirm', {
			method: 'POST',
			body: { path, filename: file.name },
		})
	}

	async function upload(file: File): Promise<UploadRecord> {
		uploading.value = true
		error.value = ''
		try {
			const uploaded = await uploadOne(file)
			await refresh()
			return uploaded
		} catch (err: any) {
			error.value = describeUploadError(err)
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
				// nextIndex < files.length just above guarantees both indices are
				// in bounds — noUncheckedIndexedAccess can't see that, hence the `!`.
				const file = files[i]!
				progress.value[i]!.status = 'uploading'
				try {
					await uploadOne(file)
					progress.value[i]!.status = 'done'
				} catch (err: any) {
					const message = describeUploadError(err)
					progress.value[i]!.status = 'error'
					progress.value[i]!.message = message
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
