import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

// Server-only — uses the service role key, never expose this to the client.
export function useSupabase(): SupabaseClient {
	if (client) return client

	const config = useRuntimeConfig()

	if (!config.supabaseUrl || !config.supabaseServiceKey) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Supabase is not configured — set NUXT_SUPABASE_URL and NUXT_SUPABASE_SERVICE_KEY.',
		})
	}

	client = createClient(config.supabaseUrl, config.supabaseServiceKey, {
		auth: { persistSession: false },
	})

	return client
}
