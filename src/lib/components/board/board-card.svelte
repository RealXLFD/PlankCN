<script lang="ts">
	import GripVerticalIcon from "@lucide/svelte/icons/grip-vertical";
	import ClockIcon from "@lucide/svelte/icons/clock";
	import type { Card, LabelColor } from "$lib/stores/board.svelte";
	import { LABEL_PALETTE, COVER_COLORS, getDueDateStatus, getSettingsStore } from "$lib/stores/board.svelte";
	import CardDetail from "./card-detail.svelte";

	const settings = getSettingsStore();

	let {
		card,
		listTitle = '',
		onremove,
		onupdate,
	}: {
		card: Card;
		listTitle?: string;
		onremove: () => void;
		onupdate: (updates: Partial<Pick<Card, 'title' | 'description' | 'labels' | 'dueDate' | 'coverColor'>>) => void;
	} = $props();

	let detailOpen = $state(false);
	let detailPosition = $state({ x: 0, y: 0 });

	function handleClick(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('[data-grip]')) return;
		detailPosition = { x: e.clientX, y: e.clientY };
		detailOpen = true;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === ' ') {
			if ((e.target as HTMLElement).closest('[data-grip]')) return;
			e.preventDefault();
			const rect = (e.target as HTMLElement).getBoundingClientRect();
			detailPosition = { x: rect.left + rect.width / 2, y: rect.top };
			detailOpen = true;
		}
	}

	function formatDueDate(ts: number): string {
		const d = new Date(ts);
		return `${d.getMonth() + 1}/${d.getDate()}`;
	}
</script>

<div
	class="group relative cursor-pointer rounded-xl border border-border/40 bg-background/50 shadow transition-[box-shadow,border-color] hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 active:scale-[0.98] dark:bg-card/80"
	style="backdrop-filter: blur({Math.max(settings.blurLevel - 4, 0)}px); -webkit-backdrop-filter: blur({Math.max(settings.blurLevel - 4, 0)}px);"
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={handleKeyDown}
>
	<!-- Cover color bar -->
	{#if card.coverColor}
		<div class="h-1.5 rounded-t-lg {COVER_COLORS[card.coverColor]}"></div>
	{/if}

	<div class="px-3 py-2.5">
		<div class="flex items-start gap-1.5">
			<!-- Label dot (centered) / Grip icon (visible on hover) -->
			<div class="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center" data-grip>
				{#if card.labels && card.labels.length > 0}
					<div class="transition-opacity group-hover:opacity-0">
						<span class="block h-3 w-3 rounded-full {LABEL_PALETTE[card.labels[0]].bg}"></span>
					</div>
				{/if}
				<div class="absolute inset-0 flex items-center justify-center cursor-grab opacity-0 transition-opacity group-hover:opacity-40">
					<GripVerticalIcon class="h-4 w-4" />
				</div>
			</div>
			<div class="min-w-0 flex-1">
				<!-- Labels (additional dots if more than 1) -->
				{#if card.labels && card.labels.length > 1}
					<div class="mb-1.5 flex flex-wrap gap-1">
						{#each card.labels as color}
							<span class="h-2 w-8 rounded-full {LABEL_PALETTE[color].bg}"></span>
						{/each}
					</div>
				{/if}

				<p class="text-sm font-medium leading-normal">{card.title}</p>

				{#if card.description}
					<p class="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">{card.description}</p>
				{/if}

				<!-- Due date -->
				{#if card.dueDate}
					{@const status = getDueDateStatus(card.dueDate)}
					<div class="mt-1.5 flex items-center gap-1 text-xs {status === 'overdue' ? 'text-destructive' : status === 'soon' ? 'text-orange-500' : 'text-muted-foreground'}">
						<ClockIcon class="h-3 w-3" />
						<span>{formatDueDate(card.dueDate)}</span>
						{#if status === 'overdue'}
							<span class="rounded bg-destructive/10 px-1 py-0.5 text-[10px] font-medium">已过期</span>
						{:else if status === 'soon'}
							<span class="rounded bg-orange-500/10 px-1 py-0.5 text-[10px] font-medium">即将到期</span>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<CardDetail
	{card}
	{listTitle}
	bind:open={detailOpen}
	bind:position={detailPosition}
	{onupdate}
	{onremove}
/>
