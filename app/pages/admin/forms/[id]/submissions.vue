<script setup lang="ts">
	// Submissions moved out from under individual forms to a standalone inbox
	// covering every form at once — see /admin/submissions. This file is kept
	// only so an old bookmark/link to the previous per-form URL still lands
	// somewhere useful instead of 404ing.
	definePageMeta({ layout: 'admin' })

	await navigateTo('/admin/submissions')
</script>
