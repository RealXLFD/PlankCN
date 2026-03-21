<script lang="ts">
	import { onMount } from "svelte";
	import { getBoardStore, getSearchStore, getSettingsStore } from "$lib/stores/board.svelte";
	import BoardList from "./board-list.svelte";

	const store = getBoardStore();
	const search = getSearchStore();
	const settings = getSettingsStore();

	let newListTitle = $state('');
	let newListInput: HTMLInputElement | undefined = $state();
	let newlyCreatedListId = $state<string | null>(null);
	let inputFocused = $state(false);

	let draggingListId = $state<string | null>(null);
	let dragOffset = $state({ x: 0, y: 0 });
	let containerRef: HTMLDivElement | undefined = $state();
	let containerRect = $state({ left: 0, top: 0 });

	let contextMenu = $state<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
	let lastResetVersion = $state(0);

	let filteredLists = $derived.by(() => {
		const q = search.query.trim().toLowerCase();
		if (!q) return store.lists;
		return store.lists.map((list) => ({
			...list,
			cards: list.cards.filter((c) =>
				c.title.toLowerCase().includes(q) ||
				(c.description ?? '').toLowerCase().includes(q)
			),
		})).filter((list) => list.cards.length > 0);
	});

	onMount(() => {
		function handleGlobalClick(e: MouseEvent) {
			if (contextMenu.visible) {
				const target = e.target as Node;
				const menuEl = document.getElementById('context-menu');
				if (menuEl && !menuEl.contains(target)) {
					contextMenu = { ...contextMenu, visible: false };
				}
			}
		}

		function handleGlobalContextMenu(e: MouseEvent) {
			const target = e.target as Node;
			if (containerRef && !containerRef.contains(target)) {
				contextMenu = { ...contextMenu, visible: false };
			}
		}

		function handleEscape(e: KeyboardEvent) {
			if (e.key === 'Escape' && contextMenu.visible) {
				contextMenu = { ...contextMenu, visible: false };
			}
		}

		document.addEventListener('click', handleGlobalClick);
		document.addEventListener('contextmenu', handleGlobalContextMenu);
		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('click', handleGlobalClick);
			document.removeEventListener('contextmenu', handleGlobalContextMenu);
			document.removeEventListener('keydown', handleEscape);
		};
	});

	$effect(() => {
		if (store.resetLayoutVersion !== lastResetVersion && containerRef) {
			lastResetVersion = store.resetLayoutVersion;
			containerRef.scrollTo({ left: 0, behavior: 'smooth' });
		}
	});

	function handleContextMenu(e: MouseEvent) {
		if (search.query.trim()) return;
		e.preventDefault();
		
		if (containerRef) {
			containerRect = containerRef.getBoundingClientRect();
		}
		
		const x = e.clientX - containerRect.left - 20;
		const y = e.clientY - containerRect.top - 20;
		
		contextMenu = {
			x: Math.max(0, x),
			y: Math.max(0, y),
			visible: true
		};
		
		newListTitle = '';
		inputFocused = false;
		requestAnimationFrame(() => newListInput?.focus());
	}

	function handleListDragStart(e: MouseEvent, listId: string) {
		if (search.query.trim()) return;
		
		const list = store.lists.find(l => l.id === listId);
		if (!list) return;

		e.preventDefault();
		contextMenu = { ...contextMenu, visible: false };
		draggingListId = listId;
		
		if (containerRef) {
			containerRect = containerRef.getBoundingClientRect();
		}
		
		dragOffset = {
			x: e.clientX - list.position.x - containerRect.left,
			y: e.clientY - list.position.y - containerRect.top
		};

		document.addEventListener('mousemove', handleListDrag);
		document.addEventListener('mouseup', handleListDragEnd);
	}

	function handleListDrag(e: MouseEvent) {
		if (!draggingListId) return;
		
		const newX = e.clientX - containerRect.left - dragOffset.x;
		const newY = e.clientY - containerRect.top - dragOffset.y;
		
		store.updateListPosition(draggingListId, { 
			x: Math.max(0, newX), 
			y: Math.max(0, newY) 
		});
	}

	function handleListDragEnd() {
		draggingListId = null;
		document.removeEventListener('mousemove', handleListDrag);
		document.removeEventListener('mouseup', handleListDragEnd);
	}

	function submitList() {
		const trimmed = newListTitle.trim();
		if (trimmed && contextMenu.visible) {
			const id = store.addList(trimmed, { x: contextMenu.x, y: contextMenu.y });
			newlyCreatedListId = id;
			newListTitle = '';
			contextMenu = { ...contextMenu, x: contextMenu.x + 340 };
			setTimeout(() => { newlyCreatedListId = null; }, 500);
			requestAnimationFrame(() => newListInput?.focus());
		}
	}

	function closeContextMenu() {
		contextMenu = { ...contextMenu, visible: false };
		newListTitle = '';
	}

	function handleWheel(e: WheelEvent) {
		if (e.deltaY === 0) return;
		e.preventDefault();
		if (containerRef) {
			containerRef.scrollLeft += e.deltaY;
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={containerRef}
	class="relative h-full w-full overflow-x-auto overflow-y-hidden p-5"
	oncontextmenu={handleContextMenu}
	onwheel={handleWheel}
>
	{#each filteredLists as list (list.id)}
		<div
			class="absolute {list.id === newlyCreatedListId ? 'animate-list-morph-in' : ''}"
			style="left: {list.position.x}px; top: {list.position.y}px; z-index: {draggingListId === list.id ? 100 : 1};"
		>
			<BoardList
				{list}
				onremovelist={() => store.removeList(list.id)}
				onrenamelist={(title) => store.renameList(list.id, title)}
				onaddcard={(title, desc) => store.addCard(list.id, title, desc)}
				onremovecard={(cardId) => store.removeCard(list.id, cardId)}
				onupdatecard={(cardId, updates) => store.updateCard(list.id, cardId, updates)}
				onsetcards={(cards) => store.setListCards(list.id, cards)}
				ondragstart={(e) => handleListDragStart(e, list.id)}
			/>
		</div>
	{/each}

	{#if contextMenu.visible}
		<div
			id="context-menu"
			class="absolute z-[1000] w-80 animate-list-morph-in"
			style="left: {contextMenu.x}px; top: {contextMenu.y}px;"
			onclick={(e) => e.stopPropagation()}
			oncontextmenu={(e) => e.preventDefault()}
		>
			<div class="relative">
				<input
					bind:this={newListInput}
					bind:value={newListTitle}
					placeholder="添加列表"
					class="w-full rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-ring dark:bg-card/80"
					style="backdrop-filter: blur({settings.blurLevel}px); -webkit-backdrop-filter: blur({settings.blurLevel}px);"
					onkeydown={(e) => {
						if (e.key === 'Enter') { e.preventDefault(); submitList(); }
						if (e.key === 'Escape') { newListTitle = ''; newListInput?.blur(); closeContextMenu(); }
					}}
					onfocus={() => inputFocused = true}
					onblur={() => {
						inputFocused = false;
						if (!newListTitle.trim()) closeContextMenu();
					}}
				/>
				{#if inputFocused}
					<kbd class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm">Enter</kbd>
				{/if}
			</div>
		</div>
	{/if}
</div>
