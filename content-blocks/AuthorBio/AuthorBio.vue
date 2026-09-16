<template>
	<div
		v-if="name"
		class="cb-author-bio"
		:class="minimalPadding ? 'small-padding' : ''"
	>
		<div class="sw">
			<div class="row">
				<div class="avatar">
					<NuxtImg
						v-if="photo"
						:src="photo"
						:alt="name"
						loading="lazy"
					/>
					<span
						v-else
						aria-hidden="true"
					>
						{{ initials }}
					</span>
				</div>

				<p class="line">
					<span class="label">Written by</span>
					<span class="name">{{ name }}</span>
					<span
						v-if="role"
						class="meta"
					>
						{{ role }}
					</span>
					<span
						v-if="date"
						class="meta"
					>
						{{ date }}
					</span>
					<span
						v-if="readTime"
						class="meta"
					>
						{{ readTime }}
					</span>
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			name?: string
			role?: string
			photo?: string
			date?: string
			readTime?: string
			minimalPadding?: boolean
		}>(),
		{
			name: '',
			role: '',
			photo: '',
			date: '',
			readTime: '',
			minimalPadding: false,
		},
	)

	const initials = computed(() => {
		if (!props.name) return ''
		return props.name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('')
	})
</script>

<style lang="scss" scoped>
	.cb-author-bio {
		background: var(--bg-primary);
		padding-block: var(--padding-md);

		&.small-padding {
			padding-block: var(--padding-sm);
		}

		.row {
			align-items: center;
			border-bottom: 1px solid var(--border);
			display: flex;
			gap: var(--padding-sm);
			padding-bottom: var(--padding-md);
		}

		.avatar {
			align-items: center;
			background: linear-gradient(
				135deg,
				color-mix(in srgb, var(--brand-primary) 14%, var(--bg-secondary)),
				var(--bg-secondary)
			);
			border: 1px solid var(--border-strong);
			border-radius: var(--border-radius-pill);
			box-shadow: var(--shadow-sm);
			display: flex;
			flex-shrink: 0;
			height: 44px;
			justify-content: center;
			overflow: hidden;
			transition:
				box-shadow var(--transition-spring),
				transform var(--transition-spring);
			width: 44px;

			img {
				height: 100%;
				object-fit: cover;
				width: 100%;
			}

			span {
				color: var(--text-primary);
				font-family: var(--heading-font-family);
				font-size: 0.85rem;
				font-weight: var(--heading-font-weight);
			}
		}

		.row:hover .avatar {
			box-shadow: var(--shadow-md);
			transform: translateY(-1px);
		}

		.line {
			align-items: baseline;
			color: var(--text-secondary);
			display: flex;
			flex-wrap: wrap;
			font-size: var(--body-size);
			gap: 0 var(--padding-xs);
			line-height: 1.4;
			margin: 0;
		}

		.label {
			letter-spacing: 0.01em;
			opacity: 0.7;
		}

		.name {
			color: var(--text-primary);
			font-family: var(--heading-font-family);
			font-weight: var(--heading-font-weight);
		}

		.meta {
			position: relative;

			&::before {
				background: var(--border-strong);
				content: '';
				display: inline-block;
				height: 0.8em;
				margin-right: var(--padding-xs);
				vertical-align: middle;
				width: 1px;
			}
		}
	}
</style>
