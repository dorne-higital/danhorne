interface PossibleApiError {
	data?: { statusMessage?: string }
	message?: string
}

// $fetch calls against our own server/api routes throw an error whose
// useful text lives at err.data.statusMessage (the message passed to
// createError() server-side) — Supabase Auth client calls (e.g. updating a
// password/email) throw a plain Error instead, with the useful text at
// err.message. Checking both means callers don't need to know which kind
// of error a given action can throw.
export function getApiErrorMessage(err: unknown, fallback: string): string {
	const apiErr = err as PossibleApiError
	return apiErr?.data?.statusMessage ?? apiErr?.message ?? fallback
}
