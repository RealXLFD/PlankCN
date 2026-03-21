<script lang="ts">
	import TrashIcon from "@lucide/svelte/icons/trash-2";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import TagIcon from "@lucide/svelte/icons/tag";
	import PaletteIcon from "@lucide/svelte/icons/palette";
	import FileTextIcon from "@lucide/svelte/icons/file-text";
	import XIcon from "@lucide/svelte/icons/x";
	import type { Card, LabelColor } from "$lib/stores/board.svelte";
	import { LABEL_COLORS, LABEL_PALETTE, COVER_COLORS, getDueDateStatus, getSettingsStore } from "$lib/stores/board.svelte";
	import { onMount } from "svelte";

	const settings = getSettingsStore();

	let {
		card,
		listTitle,
		open = $bindable(false),
		position = $bindable({ x: 0, y: 0 }),
		onupdate,
		onremove,
	}: {
		card: Card;
		listTitle: string;
		open: boolean;
		position: { x: number; y: number };
		onupdate: (updates: Partial<Pick<Card, 'title' | 'description' | 'labels' | 'dueDate' | 'coverColor'>>) => void;
		onremove: () => void;
	} = $props();

	let editTitle = $state('');
	let editDescription = $state('');
	let editDueDate = $state('');
	let panelRef: HTMLDivElement | undefined = $state();
	let calculatedPosition = $state({ x: 0, y: 0 });

	$effect(() => {
		if (open) {
			editTitle = card.title;
			editDescription = card.description ?? '';
			editDueDate = card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '';
		}
	});

	$effect(() => {
		if (open && panelRef) {
			const panelWidth = 320;
			const panelHeight = panelRef.offsetHeight || 400;
			const padding = 16;
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			let x = position.x;
			let y = position.y;

			if (x + panelWidth + padding > viewportWidth) {
				x = viewportWidth - panelWidth - padding;
			}
			if (x < padding) {
				x = padding;
			}
			if (y + panelHeight + padding > viewportHeight) {
				y = viewportHeight - panelHeight - padding;
			}
			if (y < padding) {
				y = padding;
			}

			calculatedPosition = { x, y };
		}
	});

	function saveTitle() {
		const trimmed = editTitle.trim();
		if (trimmed && trimmed !== card.title) {
			onupdate({ title: trimmed });
		}
	}

	function saveDescription() {
		const val = editDescription.trim() || undefined;
		if (val !== (card.description ?? undefined)) {
			onupdate({ description: val });
		}
	}

	function selectLabel(color: LabelColor) {
		const current = card.labels ?? [];
		if (current.length === 1 && current[0] === color) {
			onupdate({ labels: [] });
		} else {
			onupdate({ labels: [color] });
		}
	}

	function saveDueDate() {
		if (editDueDate) {
			onupdate({ dueDate: new Date(editDueDate + 'T23:59:59').getTime() });
		} else {
			onupdate({ dueDate: undefined });
		}
	}

	function setCoverColor(color: LabelColor | null) {
		onupdate({ coverColor: color });
	}

	function handleTitleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			saveTitle();
			(e.target as HTMLInputElement).blur();
		}
	}

	function handleDescriptionBlur() {
		saveDescription();
	}

	function handleDelete() {
		onremove();
		open = false;
	}

	function closeOnEscape(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}

	onMount(() => {
		document.addEventListener('keydown', closeOnEscape);
		return () => document.removeEventListener('keydown', closeOnEscape);
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[9998]"
		onclick={() => open = false}
		onkeydown={(e) => { if (e.key === 'Escape') open = false; }}
		role="button"
		tabindex="-1"
		aria-label="关闭"
	></div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={panelRef}
		role="dialog"
		aria-label="编辑卡片"
		aria-modal="true"
		tabindex="-1"
		class="fixed z-[9999] w-80 rounded-xl border bg-background/95 backdrop-blur-xl shadow-2xl"
		style="left: {calculatedPosition.x}px; top: {calculatedPosition.y}px; backdrop-filter: blur({settings.blurLevel}px); -webkit-backdrop-filter: blur({settings.blurLevel}px);"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<!-- Header -->
		<div class="flex items-center justify-between border-b px-4 py-3">
			<div>
				<h2 class="text-sm font-semibold">编辑卡片</h2>
				<p class="text-xs text-muted-foreground">在「{listTitle}」中</p>
			</div>
			<button
				onclick={() => open = false}
				class="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				aria-label="关闭"
			>
				<XIcon class="h-4 w-4" />
			</button>
		</div>

		<div class="max-h-[60vh] overflow-y-auto p-4">
			<div class="flex flex-col gap-5">
				<!-- Title -->
				<div>
					<div class="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">标题</div>
					<input
						bind:value={editTitle}
						onblur={saveTitle}
						onkeydown={handleTitleKeydown}
						aria-label="卡片标题"
						class="w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
					/>
				</div>

				<!-- Labels -->
				<div>
					<div class="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
						<TagIcon class="h-3 w-3" />
						标签
					</div>
					<div class="flex flex-wrap gap-2">
						{#each LABEL_COLORS as color}
							{@const active = card.labels?.includes(color)}
							<button
								onclick={() => selectLabel(color)}
								class="h-7 w-7 rounded-full transition-all {LABEL_PALETTE[color].bg} {active ? 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-110' : 'opacity-50 hover:opacity-80 hover:scale-105'}"
								aria-label={color}
							></button>
						{/each}
					</div>
				</div>

				<!-- Due date -->
				<div>
					<div class="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
						<CalendarIcon class="h-3 w-3" />
						截止日期
					</div>
					<div class="flex items-center gap-2">
						<input
							type="date"
							bind:value={editDueDate}
							onchange={saveDueDate}
							aria-label="截止日期"
							class="flex-1 rounded-lg border bg-muted/50 px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
						/>
						{#if editDueDate}
							<button
								onclick={() => { editDueDate = ''; saveDueDate(); }}
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
								aria-label="清除日期"
							>
								<XIcon class="h-3.5 w-3.5" />
							</button>
						{/if}
					</div>
				</div>

				<!-- Cover color -->
				<div>
					<div class="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
						<PaletteIcon class="h-3 w-3" />
						封面颜色
					</div>
					<div class="flex flex-wrap gap-2">
						<button
							onclick={() => setCoverColor(null)}
							class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed text-[10px] text-muted-foreground transition-all {card.coverColor === null || card.coverColor === undefined ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : 'opacity-50 hover:opacity-80'}"
							aria-label="无封面"
						>
							<XIcon class="h-3 w-3" />
						</button>
						{#each LABEL_COLORS as color}
							<button
								onclick={() => setCoverColor(color)}
								class="h-7 w-7 rounded-full transition-all {COVER_COLORS[color]} {card.coverColor === color ? 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-110' : 'opacity-50 hover:opacity-80 hover:scale-105'}"
								aria-label={color}
							></button>
						{/each}
					</div>
				</div>

				<!-- Description -->
				<div>
					<div class="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
						<FileTextIcon class="h-3 w-3" />
						描述
					</div>
					<textarea
						bind:value={editDescription}
						onblur={handleDescriptionBlur}
						aria-label="卡片描述"
						class="w-full resize-none rounded-lg border bg-muted/50 px-3 py-2 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
						rows="3"
						placeholder="添加描述..."
					></textarea>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="border-t px-4 py-3">
			<button
				onclick={handleDelete}
				class="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
			>
				<TrashIcon class="h-4 w-4" />
				删除卡片
			</button>
		</div>
	</div>
{/if}