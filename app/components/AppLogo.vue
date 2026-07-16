<template>
	<NuxtLink
		to="/"
		class="logo"
	>
		<NuxtImg
			v-if="logoUrl"
			:src="logoUrl"
			:alt="settings?.company?.name || settings?.site_name || 'Logo'"
			class="logo-image"
		/>
		<h3
			v-else-if="logoText"
			class="logo-text"
		>
			{{ logoText
			}}<span
				v-if="highlightedText"
				class="highlight"
			>
				{{ highlightedText }}
			</span>
		</h3>
		<h3
			v-else
			class="logo-text"
		>
			{{ settings?.site_name || 'Your Site' }}
		</h3>
	</NuxtLink>
</template>

<script setup lang="ts">
	defineProps<{
		logoText?: string
		highlightedText?: string
	}>()

	const { data: settings } = useSiteSettings()

	const logoUrl = computed(() => settings.value?.logo_url || '')
</script>

<style lang="scss" scoped>
	.logo {
		align-items: center;
		display: flex;
		gap: var(--padding-sm);
		text-decoration: none;

		.logo-image {
			max-height: 2.25rem;
			object-fit: contain;
			width: auto;
		}

		.logo-text {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-weight: var(--heading-font-weight);

			.highlight {
				color: var(--brand-primary);
			}
		}
	}

	body.is-admin .logo {
		--text-primary: #0b1626 !important;
		--brand-primary: #e63946 !important;
		--heading-font-family: 'Baloo 2', system-ui, sans-serif !important;
		--heading-font-weight: 800 !important;
	}
</style>
