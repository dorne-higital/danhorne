// Public (unauthenticated) endpoints must never forward a raw Postgres
// error message to the client — it can leak column/constraint/schema
// details to anyone. Admin-only routes are fine passing error.message
// straight through since only trusted, logged-in users see it; this is
// only for the small set of genuinely public GET routes. The real message
// still goes to the server logs so it's not lost, just not exposed.
export function publicErrorMessage(error: { message: string }): string {
	console.error(error.message)
	return 'Something went wrong. Please try again later.'
}
