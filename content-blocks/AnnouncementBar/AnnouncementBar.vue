<template>
	<section
		v-if="visible"
		class="cb-announcement"
		role="region"
		aria-label="Announcement"
		:class="[variant, { 'has-dismiss': dismissible, 'small-padding': minimalPadding }]"
	>
		<div class="sw">
			<div class="bar">
				<span
					v-if="variant === 'gradient'"
					class="icon-badge"
					aria-hidden="true"
				>
					<Icon
						:name="icon || 'lucide:sparkles'"
						class="icon"
					/>
				</span>

				<div class="content">
					<span class="message">{{ message }}</span>

					<a
						v-if="linkLabel && linkHref"
						class="link"
						:href="normalizeHref(linkHref)"
						:target="isExternalHref(linkHref) ? '_blank' : undefined"
						:rel="isExternalHref(linkHref) ? 'noopener noreferrer' : undefined"
					>
						{{ linkLabel }}
						<Icon
							name="lucide:arrow-right"
							class="link-arrow"
							aria-hidden="true"
						/>
					</a>
				</div>

				<button
					v-if="dismissible"
					type="button"
					class="dismiss"
					aria-label="Dismiss announcement"
					@click="dismiss"
				>
					<Icon
						name="lucide:x"
						aria-hidden="true"
					/>
				</button>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			variant?: 'slim' | 'gradient'
			message?: string
			icon?: string
			linkLabel?: string
			linkHref?: string
			dismissible?: boolean
			dismissKey?: string
			minimalPadding?: boolean
		}>(),
		{
			variant: 'slim',
			message: 'Free shipping on orders over $75 — this week only.',
			icon: 'lucide:sparkles',
			linkLabel: 'Learn more',
			linkHref: '',
			dismissible: true,
			dismissKey: '',
			minimalPadding: false,
		},
	)

	// Small local slug helper so a dismiss key can be derived from the
	// message when the editor doesn't set one explicitly.
	function slugify(input: string): string {
		return input
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 40)
	}

	const storageKey = computed(() => {
		const key = props.dismissKey.trim() || slugify(props.message)
		return `announcement-dismissed:${key}`
	})

	// Starts false so SSR and first client paint always render the bar —
	// we only know whether it was dismissed once we can read localStorage.
	const dismissed = ref(false)

	onMounted(() => {
		try {
			if (localStorage.getItem(storageKey.value) === '1') {
				dismissed.value = true
			}
		} catch {
			// localStorage unavailable (privacy mode, disabled storage, etc.) — just show the bar.
		}
	})

	const visible = computed(() => !dismissed.value)

	function dismiss() {
		dismissed.value = true
		try {
			localStorage.setItem(storageKey.value, '1')
		} catch {
			// Nothing to persist to — the bar still stays dismissed for this page view.
		}
	}
</script>

<style lang="scss" scoped>
	.cb-announcement {
		padding-block: var(--padding-sm);

		&.small-padding {
			padding-block: var(--padding-xs);
		}

		.sw {
			padding-inline: var(--padding-md);
		}

		.bar {
			align-items: center;
			border-radius: var(--border-radius-md);
			display: flex;
			gap: var(--padding-sm);
			justify-content: center;
			min-height: 2.75rem;
			padding-block: 0.55rem;
			padding-inline: var(--padding-md);
			position: relative;
		}

		&.has-dismiss .bar {
			padding-inline-end: calc(var(--padding-md) + 2.25rem);
		}

		.content {
			align-items: center;
			display: flex;
			flex-wrap: wrap;
			gap: 0.25rem var(--padding-sm);
			justify-content: center;
			min-width: 0;
		}

		.message {
			font-family: var(--body-font-family);
			font-size: var(--eyebrow-size);
			font-weight: 600;
			letter-spacing: 0.01em;
			line-height: var(--leading-tight);
		}

		.link {
			align-items: center;
			display: inline-flex;
			flex-shrink: 0;
			font-family: var(--body-font-family);
			font-size: var(--eyebrow-size);
			font-weight: 700;
			gap: 0.2rem;
			text-decoration: underline;
			text-decoration-thickness: 1.5px;
			text-underline-offset: 3px;
			transition: opacity var(--transition-base);
			white-space: nowrap;

			&:hover {
				opacity: 0.8;

				.link-arrow {
					transform: translate(2px, -2px);
				}
			}

			.link-arrow {
				height: 0.9em;
				transition: transform var(--transition-spring);
				width: 0.9em;
			}
		}

		.dismiss {
			align-items: center;
			background: rgb(255 255 255 / 16%);
			border: none;
			border-radius: var(--border-radius-pill);
			cursor: pointer;
			display: flex;
			flex-shrink: 0;
			height: 1.75rem;
			justify-content: center;
			position: absolute;
			right: var(--padding-sm);
			top: 50%;
			transform: translateY(-50%);
			transition:
				background var(--transition-base),
				transform var(--transition-spring);
			width: 1.75rem;

			:deep(svg) {
				height: 0.9rem;
				width: 0.9rem;
			}

			&:hover {
				background: rgb(255 255 255 / 28%);
				transform: translateY(-50%) scale(1.08);
			}

			&:active {
				transform: translateY(-50%) scale(0.94);
			}
		}

		&.slim {
			background: var(--brand-primary);

			.message,
			.link,
			.dismiss {
				color: var(--text-inverse);
			}

			.bar {
				box-shadow: var(--shadow-sm);
			}
		}

		&.gradient {
			background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));

			.message,
			.link,
			.dismiss {
				color: var(--text-inverse);
			}

			.bar {
				box-shadow: var(--shadow-md);
			}

			.icon-badge {
				align-items: center;
				background: rgb(255 255 255 / 18%);
				border-radius: var(--border-radius-pill);
				box-shadow: var(--shadow-sm);
				display: flex;
				flex-shrink: 0;
				height: 1.75rem;
				justify-content: center;
				width: 1.75rem;

				:deep(svg) {
					height: 1rem;
					width: 1rem;
				}

				.icon {
					color: var(--text-inverse);
				}
			}
		}

		@media (width >= 768px) {
			.bar {
				padding-inline: var(--padding-lg);
			}

			&.has-dismiss .bar {
				padding-inline-end: calc(var(--padding-lg) + 2.25rem);
			}

			.message {
				font-size: var(--body-size);
			}

			.link {
				font-size: var(--body-size);
			}
		}
	}
</style>
