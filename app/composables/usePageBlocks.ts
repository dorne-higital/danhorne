import type { Block } from '#shared/types/cms'
import { createDefaultProps, getBlockSchema } from '~~/content-blocks/registry'

export function usePageBlocks(initialBlocks: Block[]) {
	const blocks = ref<Block[]>(structuredClone(initialBlocks))
	const selectedBlockId = ref<string | null>(null)

	const selectedBlock = computed(() => blocks.value.find((block) => block.id === selectedBlockId.value) ?? null)

	function addBlock(type: string) {
		const schema = getBlockSchema(type)
		if (!schema) return

		const block: Block = {
			id: crypto.randomUUID(),
			type,
			props: createDefaultProps(schema),
		}
		blocks.value.push(block)
		selectedBlockId.value = block.id
		return block
	}

	function removeBlock(id: string) {
		blocks.value = blocks.value.filter((block) => block.id !== id)
		if (selectedBlockId.value === id) selectedBlockId.value = null
	}

	function updateBlockProp(id: string, name: string, value: unknown) {
		const block = blocks.value.find((block) => block.id === id)
		if (!block) return
		block.props[name] = value
	}

	function updateBlockDarkTheme(id: string, value: boolean) {
		const block = blocks.value.find((block) => block.id === id)
		if (!block) return
		block.darkTheme = value
	}

	function selectBlock(id: string | null) {
		selectedBlockId.value = id
	}

	return {
		blocks,
		selectedBlockId,
		selectedBlock,
		addBlock,
		removeBlock,
		updateBlockProp,
		updateBlockDarkTheme,
		selectBlock,
	}
}
