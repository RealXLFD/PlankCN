<script lang="ts">
	import PlusIcon from "@lucide/svelte/icons/plus";
	import TrashIcon from "@lucide/svelte/icons/trash-2";
	import GripVerticalIcon from "@lucide/svelte/icons/grip-vertical";
	import MoreHorizontalIcon from "@lucide/svelte/icons/more-horizontal";
	import type { List, Card } from "$lib/stores/board.svelte";
	import BoardCard from "./board-card.svelte";

	let {
		list,
		onremovelist,
		onrenamelist,
		onaddcard,
		onremovecard,
		onupdatecard,
		onmovecard,
		onreordercard,
		ondragliststart,
		ondraglistend,
		dragState,
	}: {
		list: List;
		onremovelist: () => void;
		onrenamelist: (title: string) => void;
		onaddcard: (title: string, description?: string) => void;
		onremovecard: (cardId: string) => void;
		onupdatecard: (cardId: string, updates: Partial<Pick<Card, 'title' | 'description'>>) => void;
		onmovecard: (cardId: string, toIndex: number) => void;
		onreordercard: (fromIndex: number, toIndex: number) => void;
		ondragliststart: (e: DragEvent) => void;
		ondraglistend: (e: DragEvent) => void;
		dragState: { draggingCardId: string | null; sourceListId: string | null };
	} = $props();

	let addingCard = $state(false);
	let newCardTitle = $state('');
	let newCardInput: HTMLTextAreaElement | undefined = $state();
	let editingTitle = $state(false);
	let editTitleValue = $state('');
	let titleInput: HTMLInputElement | undefined = $state();
	let showMenu = $state(false);
	let dropIndicatorIndex = $state<number | null>(null);

	function startAddCard() {
		addingCard = true;
		newCardTitle = '';
		requestAnimationFrame(() => {
			newCardInput?.focus();
		});
	}

	function submitCard() {
		const trimmed = newCardTitle.trim();
		if (trimmed) {
			onaddcard(trimmed);
			newCardTitle = '';
			requestAnimationFrame(() => {
				newCardInput?.focus();
			});
		} else {
			addingCard = false;
		}
	}

	function cancelAdd() {
		addingCard = false;
		newCardTitle = '';
	}

	function startEditTitle() {
		editTitleValue = list.title;
		editingTitle = true;
		requestAnimationFrame(() => {
			titleInput?.focus();
			titleInput?.select();
		});
	}

	function saveTitle() {
		const trimmed = editTitleValue.trim();
		if (trimmed && trimmed !== list.title) {
			onrenamelist(trimmed);
		}
		editingTitle = false;
	}

	function handleCardDragStart(e: DragEvent, cardId: string, cardIndex: number) {
		if (!e.dataTransfer) return;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/card-id', cardId);
		e.dataTransfer.setData('text/source-list-id', list.id);
		e.dataTransfer.setData('text/source-index', String(cardIndex));
		dragState.draggingCardId = cardId;
		dragState.sourceListId = list.id;
	}

	function handleCardDragEnd(_e: DragEvent) {
		dragState.draggingCardId = null;
		dragState.sourceListId = null;
		dropIndicatorIndex = null;
	}

	function getDropIndex(e: DragEvent, cardEl: HTMLElement, index: number): number {
		const rect = cardEl.getBoundingClientRect();
		const midY = rect.top + rect.height / 2;
		return e.clientY < midY ? index : index + 1;
	}

	function handleDragOver(e: DragEvent, index: number) {
		if (!dragState.draggingCardId) return;
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		const cardEl = (e.currentTarget as HTMLElement);
		dropIndicatorIndex = getDropIndex(e, cardEl, index);
	}

	function handleDragOverEmpty(e: DragEvent) {
		if (!dragState.draggingCardId) return;
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		if (list.cards.length === 0) {
			dropIndicatorIndex = 0;
		} else {
			dropIndicatorIndex = list.cards.length;
		}
	}

	function handleDrop(e: DragEvent, targetIndex: number) {
		e.preventDefault();
		e.stopPropagation();
		if (!e.dataTransfer) return;
		const cardId = e.dataTransfer.getData('text/card-id');
		const sourceListId = e.dataTransfer.getData('text/source-list-id');
		const sourceIndex = parseInt(e.dataTransfer.getData('text/source-index'), 10);

		if (!cardId) return;

		if (sourceListId === list.id) {
			onreordercard(sourceIndex, targetIndex > sourceIndex ? targetIndex - 1 : targetIndex);
		} else {
			onmovecard(cardId, targetIndex);
		}
		dropIndicatorIndex = null;
	}

	function handleDragLeave(e: DragEvent) {
		const el = e.currentTarget as HTMLElement;
		const related = e.relatedTarget as Node | null;
		if (!related || !el.contains(related)) {
			dropIndicatorIndex = null;
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="flex h-fit max-h-full w-80 shrink-0 flex-col rounded-xl border bg-muted/50"
	draggable="true"
	ondragstart={ondragliststart}
	ondragend={ondraglistend}
>
	<!-- Header -->
	<div class="flex items-center gap-1.5 px-3 pt-3 pb-1.5">
		<div class="cursor-grab opacity-40 hover:opacity-70 active:cursor-grabbing">
			<GripVerticalIcon class="h-4 w-4" />
		</div>
		{#if editingTitle}
			<input
				bind:this={titleInput}
				bind:value={editTitleValue}
				onblur={saveTitle}
				onkeydown={(e) => {
					if (e.key === 'Enter') saveTitle();
					if (e.key === 'Escape') { editingTitle = false; }
				}}
				class="flex-1 rounded border bg-card px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
			/>
		{:else}
			<button
				class="flex-1 cursor-text rounded px-2 py-1 text-left text-sm font-semibold hover:bg-accent"
				ondblclick={startEditTitle}
			>
				{list.title}
			</button>
		{/if}
		<div class="relative">
			<button
				onclick={() => showMenu = !showMenu}
				class="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
				aria-label="列表菜单"
			>
				<MoreHorizontalIcon class="h-4 w-4" />
			</button>
			{#if showMenu}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="absolute right-0 z-50 mt-1 w-40 rounded-lg border bg-popover p-1.5 shadow-md"
					onclick={(e) => e.stopPropagation()}
				>
					<button
						onclick={() => { startEditTitle(); showMenu = false; }}
						class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-accent"
					>
						重命名
					</button>
					<button
						onclick={() => { onremovelist(); showMenu = false; }}
						class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-destructive hover:bg-destructive/10"
					>
						<TrashIcon class="h-3.5 w-3.5" />
						删除列表
					</button>
				</div>
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="fixed inset-0 z-40" onclick={() => showMenu = false}></div>
			{/if}
		</div>
	</div>

	<!-- Cards -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-1.5"
		ondragover={handleDragOverEmpty}
		ondragleave={handleDragLeave}
		ondrop={(e) => handleDrop(e, list.cards.length)}
		role="list"
	>
		{#each list.cards as card, i (card.id)}
			<div>
				{#if dropIndicatorIndex === i}
					<div class="h-1 rounded-full bg-primary/60 transition-all"></div>
				{/if}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					ondragover={(e) => handleDragOver(e, i)}
					ondrop={(e) => handleDrop(e, i)}
					class={dragState.draggingCardId === card.id ? 'opacity-30' : ''}
				>
					<BoardCard
						{card}
						onremove={() => onremovecard(card.id)}
						onupdate={(updates) => onupdatecard(card.id, updates)}
						ondragstart={(e) => handleCardDragStart(e, card.id, i)}
						ondragend={handleCardDragEnd}
					/>
				</div>
			</div>
		{/each}
		{#if dropIndicatorIndex !== null && dropIndicatorIndex >= list.cards.length}
			<div class="h-1 rounded-full bg-primary/60 transition-all"></div>
		{/if}
	</div>

	<!-- Add card -->
	<div class="px-3 pb-3 pt-1.5">
		{#if addingCard}
			<div class="space-y-2">
				<textarea
					bind:this={newCardInput}
					bind:value={newCardTitle}
					placeholder="输入卡片标题..."
					rows="2"
					class="w-full resize-none rounded-lg border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
					onkeydown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitCard(); }
						if (e.key === 'Escape') cancelAdd();
					}}
				></textarea>
				<div class="flex gap-1.5">
					<button
						onclick={submitCard}
						class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>添加</button>
					<button
						onclick={cancelAdd}
						class="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
					>取消</button>
				</div>
			</div>
		{:else}
			<button
				onclick={startAddCard}
				class="flex w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
			>
				<PlusIcon class="h-4 w-4" />
				添加卡片
			</button>
		{/if}
	</div>
</div>
