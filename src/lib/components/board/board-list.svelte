<script lang="ts">
	import GripVerticalIcon from "@lucide/svelte/icons/grip-vertical";
	import MoreHorizontalIcon from "@lucide/svelte/icons/more-horizontal";
	import TrashIcon from "@lucide/svelte/icons/trash-2";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import { onMount } from "svelte";
	import type { List, Card } from "$lib/stores/board.svelte";
	import { getSettingsStore } from "$lib/stores/board.svelte";
	import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from "$lib/utils/dnd";
	import BoardCard from "./board-card.svelte";

	const settings = getSettingsStore();
	const FLIP_DURATION_MS = 200;
	const COLLAPSE_DELAY = 1000;

	let {
		list,
		onremovelist,
		onrenamelist,
		onaddcard,
		onremovecard,
		onupdatecard,
		onsetcards,
		ondragstart,
	}: {
		list: List;
		onremovelist: () => void;
		onrenamelist: (title: string) => void;
		onaddcard: (title: string, description?: string) => void;
		onremovecard: (cardId: string) => void;
		onupdatecard: (cardId: string, updates: Partial<Pick<Card, 'title' | 'description' | 'labels' | 'dueDate' | 'coverColor'>>) => void;
		onsetcards: (cards: Card[]) => void;
		ondragstart?: (e: MouseEvent) => void;
	} = $props();

	let newCardTitle = $state('');
	let newCardInput: HTMLInputElement | undefined = $state();
	let inputFocused = $state(false);
	let inputExpanded = $state(false);
	let hoverTimer: ReturnType<typeof setTimeout> | null = null;
	let collapseTimer: ReturnType<typeof setTimeout> | null = null;
	let editingTitle = $state(false);
	let editTitleValue = $state('');
	let titleInput: HTMLInputElement | undefined = $state();
	let showMenu = $state(false);
	let menuBtn: HTMLButtonElement | undefined = $state();
	let menuPanel: HTMLDivElement | undefined = $state();
	let dragInProgress = $state(false);
	let dndCards = $state<any[]>([]);

	// --- Add card input expand/collapse ---
	function expandInput() {
		clearCollapseTimer();
		inputExpanded = true;
		requestAnimationFrame(() => newCardInput?.focus());
	}

	function startHoverExpand() {
		if (inputExpanded) { clearCollapseTimer(); return; }
		hoverTimer = setTimeout(expandInput, 300);
	}

	function cancelHoverExpand() {
		if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
		if (!inputFocused && inputExpanded) scheduleCollapse();
	}

	function scheduleCollapse() {
		clearCollapseTimer();
		collapseTimer = setTimeout(() => {
			if (!inputFocused) inputExpanded = false;
		}, COLLAPSE_DELAY);
	}

	function clearCollapseTimer() {
		if (collapseTimer) { clearTimeout(collapseTimer); collapseTimer = null; }
	}

	function handleInputFocus() {
		inputFocused = true;
		inputExpanded = true;
		clearCollapseTimer();
	}

	function handleInputBlur() {
		inputFocused = false;
		// 提交卡片（如果存在内容）
		if (newCardTitle.trim()) {
			submitCard();
		}
		scheduleCollapse();
	}

	// --- DnD ---
	$effect(() => {
		if (!dragInProgress) {
			dndCards = list.cards.map((c) => ({ ...c }));
		}
	});

	function handleCardConsider(e: CustomEvent) {
		dragInProgress = true;
		dndCards = e.detail.items;
	}

	function handleCardFinalize(e: CustomEvent) {
		dndCards = e.detail.items;
		const realItems = dndCards.filter((c: any) => !c[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
		onsetcards(realItems);
		requestAnimationFrame(() => { dragInProgress = false; });
	}

	function transformCardDraggedElement(element: HTMLElement) {
		// element 是flip动画的包装器div，内部是卡片内容
		element.style.setProperty('border', 'none', 'important');
		element.style.setProperty('outline', 'none', 'important');
		element.style.setProperty('box-shadow', '0 15px 35px -5px rgba(0, 0, 0, 0.25)', 'important');
		
		// 找到内部的卡片容器并移除边框
		const cardContainer = element.querySelector('.rounded-xl');
		if (cardContainer) {
			const cardEl = cardContainer as HTMLElement;
			cardEl.style.setProperty('border', 'none', 'important');
			cardEl.style.setProperty('outline', 'none', 'important');
		}
		
		// 移除所有子元素的边框
		element.querySelectorAll('*').forEach((child) => {
			const el = child as HTMLElement;
			el.style.setProperty('border', 'none', 'important');
			el.style.setProperty('outline', 'none', 'important');
		});
	}

	// --- Menu ---
	onMount(() => {
		function handleGlobalClick(e: MouseEvent) {
			if (!showMenu) return;
			const target = e.target as Node;
			if (menuPanel?.contains(target) || menuBtn?.contains(target)) return;
			showMenu = false;
		}
		document.addEventListener('click', handleGlobalClick, true);
		return () => {
			document.removeEventListener('click', handleGlobalClick, true);
			if (hoverTimer) clearTimeout(hoverTimer);
			clearCollapseTimer();
		};
	});

	function submitCard() {
		const trimmed = newCardTitle.trim();
		if (trimmed) {
			onaddcard(trimmed);
			newCardTitle = '';
			requestAnimationFrame(() => newCardInput?.focus());
		}
	}

	function startEditTitle() {
		editTitleValue = list.title;
		editingTitle = true;
		requestAnimationFrame(() => { titleInput?.focus(); titleInput?.select(); });
	}

	function saveTitle() {
		const trimmed = editTitleValue.trim();
		if (trimmed && trimmed !== list.title) onrenamelist(trimmed);
		editingTitle = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="flex h-fit max-h-full w-80 shrink-0 flex-col rounded-xl border border-border/50 bg-background/40 shadow-lg dark:bg-card/60"
	style="backdrop-filter: blur({settings.blurLevel}px); -webkit-backdrop-filter: blur({settings.blurLevel}px);"
>
	<!-- Header -->
	<div 
		class="flex items-center gap-1.5 px-3 pt-3 pb-2 {ondragstart ? 'cursor-grab' : ''}"
		onmousedown={ondragstart}
	>
		{#if ondragstart}
			<div class="opacity-40 hover:opacity-70">
				<GripVerticalIcon class="h-4 w-4" />
			</div>
		{/if}
		{#if editingTitle}
			<input
				bind:this={titleInput}
				bind:value={editTitleValue}
				onblur={saveTitle}
				onkeydown={(e) => {
					if (e.key === 'Enter') saveTitle();
					if (e.key === 'Escape') { editingTitle = false; }
				}}
				class="flex-1 rounded bg-transparent px-2 py-1 text-sm font-semibold focus:outline-none"
			/>
		{:else}
			<button
				class="flex-1 cursor-text rounded px-2 py-1 text-left text-sm font-semibold"
				ondblclick={startEditTitle}
			>
				{list.title}
			</button>
		{/if}
		<span class="rounded-full bg-foreground/10 px-2 py-0.5 text-xs text-muted-foreground">{list.cards.length}</span>
		<div class="relative">
			<button
				bind:this={menuBtn}
				onclick={() => showMenu = !showMenu}
				class="rounded-md p-1 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
				aria-label="列表菜单"
			>
				<MoreHorizontalIcon class="h-4 w-4" />
			</button>
			{#if showMenu}
				<div
					bind:this={menuPanel}
					class="absolute right-0 z-50 mt-1 w-40 rounded-xl border bg-popover backdrop-blur-xl p-1.5 shadow-md"
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
			{/if}
		</div>
	</div>

	<!-- Cards DnD zone -->
	<div class="flex flex-col px-3 pb-3">
		<div
			class="flex flex-col gap-2"
			style="min-height: 44px;"
			use:dndzone={{
				items: dndCards,
				flipDurationMs: FLIP_DURATION_MS,
				type: 'cards',
				dropTargetStyle: { outline: 'none', border: 'none', 'box-shadow': 'none' },
				dropTargetClasses: ['dnd-card-drop-target'],
				dropAnimationDisabled: true,
				morphDisabled: true,
				centreDraggedOnCursor: true,
				transformDraggedElement: transformCardDraggedElement,
				onConsider: handleCardConsider,
				onFinalize: handleCardFinalize,
			}}
		>
			{#each dndCards as card (card.id)}
				<div>
					{#if card[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
						<div class="h-10 rounded-xl bg-primary/5"></div>
					{:else}
						<BoardCard
							{card}
							listTitle={list.title}
							onremove={() => onremovecard(card.id)}
							onupdate={(updates) => onupdatecard(card.id, updates)}
						/>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Add card button -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="mt-2"
			onmouseenter={startHoverExpand}
			onmouseleave={cancelHoverExpand}
		>
			<div
				class="relative transition-all duration-300 ease-in-out"
				style="
					width: {inputExpanded ? '100%' : '36px'};
					height: {inputExpanded ? '40px' : '36px'};
					border-radius: 12px;
				"
			>
				<!-- Collapsed: plus button -->
				<button
					class="absolute inset-0 flex items-center justify-center border border-border/50 bg-background shadow-sm transition-opacity duration-200 dark:bg-card/80 {inputExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}"
					style="border-radius: inherit;"
					onclick={expandInput}
					aria-label="添加卡片"
				>
					<PlusIcon class="h-4 w-4 text-muted-foreground" />
				</button>

				<!-- Expanded: input field -->
				<div
					class="absolute inset-0 transition-opacity duration-200 {inputExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}"
					style="border-radius: inherit;"
				>
					<input
						bind:this={newCardInput}
						bind:value={newCardTitle}
						placeholder="添加卡片"
						class="h-full w-full rounded-[inherit] border border-border/50 bg-background px-4 text-sm shadow-sm placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-ring dark:bg-card/80"
						onkeydown={(e) => {
							if (e.key === 'Enter') { e.preventDefault(); submitCard(); }
							if (e.key === 'Escape') { newCardTitle = ''; newCardInput?.blur(); }
						}}
						onfocus={handleInputFocus}
						onblur={handleInputBlur}
					/>
					{#if inputFocused}
						<kbd class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm">Enter</kbd>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
