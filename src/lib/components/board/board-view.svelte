<script lang="ts">
	import PlusIcon from "@lucide/svelte/icons/plus";
	import { getBoardStore } from "$lib/stores/board.svelte";
	import BoardList from "./board-list.svelte";

	const store = getBoardStore();

	let addingList = $state(false);
	let newListTitle = $state('');
	let newListInput: HTMLInputElement | undefined = $state();
	let dragState = $state({ draggingCardId: null as string | null, sourceListId: null as string | null });
	let draggingListIndex = $state<number | null>(null);
	let listDropIndex = $state<number | null>(null);

	function startAddList() {
		addingList = true;
		newListTitle = '';
		requestAnimationFrame(() => newListInput?.focus());
	}

	function submitList() {
		const trimmed = newListTitle.trim();
		if (trimmed) {
			store.addList(trimmed);
			newListTitle = '';
			requestAnimationFrame(() => newListInput?.focus());
		} else {
			addingList = false;
		}
	}

	function handleListDragStart(e: DragEvent, index: number) {
		if (dragState.draggingCardId) return;
		if (!e.dataTransfer) return;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/list-index', String(index));
		draggingListIndex = index;
		const target = e.currentTarget as HTMLElement;
		requestAnimationFrame(() => {
			target.style.opacity = '0.4';
		});
	}

	function handleListDragEnd(e: DragEvent) {
		const target = e.currentTarget as HTMLElement;
		target.style.opacity = '';
		draggingListIndex = null;
		listDropIndex = null;
	}

	function getListDropIndex(e: DragEvent, el: HTMLElement, index: number): number {
		const rect = el.getBoundingClientRect();
		const midX = rect.left + rect.width / 2;
		return e.clientX < midX ? index : index + 1;
	}

	function handleListDragOver(e: DragEvent, index: number) {
		if (draggingListIndex === null) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		const el = e.currentTarget as HTMLElement;
		listDropIndex = getListDropIndex(e, el, index);
	}

	function handleListDrop(e: DragEvent, index: number) {
		e.preventDefault();
		if (draggingListIndex === null) return;
		const el = e.currentTarget as HTMLElement;
		const targetIndex = getListDropIndex(e, el, index);
		store.moveList(draggingListIndex, targetIndex > draggingListIndex ? targetIndex - 1 : targetIndex);
		draggingListIndex = null;
		listDropIndex = null;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex h-full items-start gap-4 overflow-x-auto p-5">
	{#each store.lists as list, i (list.id)}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="relative shrink-0"
			ondragover={(e) => handleListDragOver(e, i)}
			ondrop={(e) => handleListDrop(e, i)}
		>
			{#if listDropIndex === i && draggingListIndex !== null && draggingListIndex !== i}
				<div class="absolute -left-2.5 top-0 bottom-0 w-1 rounded-full bg-primary/60"></div>
			{/if}
			{#if listDropIndex === i + 1 && draggingListIndex !== null && draggingListIndex !== i}
				<div class="absolute -right-2.5 top-0 bottom-0 w-1 rounded-full bg-primary/60"></div>
			{/if}
			<BoardList
				{list}
				{dragState}
				onremovelist={() => store.removeList(list.id)}
				onrenamelist={(title) => store.renameList(list.id, title)}
				onaddcard={(title, desc) => store.addCard(list.id, title, desc)}
				onremovecard={(cardId) => store.removeCard(list.id, cardId)}
				onupdatecard={(cardId, updates) => store.updateCard(list.id, cardId, updates)}
				onmovecard={(cardId, toIndex) => {
					const sourceListId = dragState.sourceListId;
					if (sourceListId) store.moveCard(sourceListId, list.id, cardId, toIndex);
				}}
				onreordercard={(from, to) => store.reorderCard(list.id, from, to)}
				ondragliststart={(e) => handleListDragStart(e, i)}
				ondraglistend={handleListDragEnd}
			/>
		</div>
	{/each}

	<!-- Add list button -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="shrink-0"
		ondragover={(e) => handleListDragOver(e, store.lists.length)}
		ondrop={(e) => handleListDrop(e, store.lists.length)}
	>
		{#if addingList}
			<div class="w-80 rounded-xl border bg-muted/50 p-3">
				<input
					bind:this={newListInput}
					bind:value={newListTitle}
					placeholder="输入列表标题..."
					class="w-full rounded-lg border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
					onkeydown={(e) => {
						if (e.key === 'Enter') submitList();
						if (e.key === 'Escape') { addingList = false; }
					}}
				/>
				<div class="mt-2 flex gap-1.5">
					<button
						onclick={submitList}
						class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>添加列表</button>
					<button
						onclick={() => addingList = false}
						class="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
					>取消</button>
				</div>
			</div>
		{:else}
			<button
				onclick={startAddList}
				class="flex w-80 items-center gap-2 rounded-xl border border-dashed bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-solid hover:bg-muted/50"
			>
				<PlusIcon class="h-4 w-4" />
				添加列表
			</button>
		{/if}
	</div>
</div>
