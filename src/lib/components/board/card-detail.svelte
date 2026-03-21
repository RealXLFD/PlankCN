<script lang="ts">
	import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "$lib/components/ui/sheet";
	import TrashIcon from "@lucide/svelte/icons/trash-2";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import TagIcon from "@lucide/svelte/icons/tag";
	import PaletteIcon from "@lucide/svelte/icons/palette";
	import FileTextIcon from "@lucide/svelte/icons/file-text";
	import XIcon from "@lucide/svelte/icons/x";
	import type { Card, LabelColor } from "$lib/stores/board.svelte";
	import { LABEL_COLORS, LABEL_PALETTE, COVER_COLORS, getDueDateStatus } from "$lib/stores/board.svelte";

	let {
		card,
		listTitle,
		open = $bindable(false),
		onupdate,
		onremove,
	}: {
		card: Card;
		listTitle: string;
		open: boolean;
		onupdate: (updates: Partial<Pick<Card, 'title' | 'description' | 'labels' | 'dueDate' | 'coverColor'>>) => void;
		onremove: () => void;
	} = $props();

	let editTitle = $state('');
	let editDescription = $state('');
	let editDueDate = $state('');

	$effect(() => {
		if (open) {
			editTitle = card.title;
			editDescription = card.description ?? '';
			editDueDate = card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '';
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

	function handleDelete() {
		onremove();
		open = false;
	}
</script>

<Sheet bind:open>
	<SheetContent side="right" class="w-full sm:max-w-md overflow-y-auto p-0">
		<!-- Header -->
		<div class="sticky top-0 z-10 border-b bg-background px-6 py-5">
			<SheetHeader class="p-0">
				<SheetTitle class="text-left text-base">编辑卡片</SheetTitle>
				<SheetDescription class="text-left text-xs">在「{listTitle}」列表中</SheetDescription>
			</SheetHeader>
		</div>

		<div class="flex flex-col gap-8 px-6 py-6">
			<!-- Title -->
			<div>
				<div class="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">标题</div>
				<input
					bind:value={editTitle}
					onblur={saveTitle}
					onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveTitle(); (e.target as HTMLInputElement).blur(); } }}
					class="w-full rounded-lg border bg-muted/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
				/>
			</div>

			<!-- Labels -->
			<div>
				<div class="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
					<TagIcon class="h-3.5 w-3.5" />
					标签
				</div>
				<div class="flex flex-wrap gap-3">
					{#each LABEL_COLORS as color}
						{@const active = card.labels?.includes(color)}
						<button
							onclick={() => selectLabel(color)}
							class="h-8 w-8 rounded-full transition-all {LABEL_PALETTE[color].bg} {active ? 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-110' : 'opacity-50 hover:opacity-80 hover:scale-105'}"
							aria-label={color}
						></button>
					{/each}
				</div>
			</div>

			<!-- Due date -->
			<div>
				<div class="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
					<CalendarIcon class="h-3.5 w-3.5" />
					截止日期
				</div>
				<div class="flex items-center gap-2">
					<input
						type="date"
						bind:value={editDueDate}
						onchange={saveDueDate}
						class="flex-1 rounded-lg border bg-muted/50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
					/>
					{#if editDueDate}
						<button
							onclick={() => { editDueDate = ''; saveDueDate(); }}
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
							aria-label="清除日期"
						>
							<XIcon class="h-4 w-4" />
						</button>
					{/if}
				</div>
			</div>

			<!-- Cover color -->
			<div>
				<div class="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
					<PaletteIcon class="h-3.5 w-3.5" />
					封面颜色
				</div>
				<div class="flex flex-wrap gap-3">
					<button
						onclick={() => setCoverColor(null)}
						class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed text-[10px] text-muted-foreground transition-all {card.coverColor === null || card.coverColor === undefined ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : 'opacity-50 hover:opacity-80'}"
						aria-label="无封面"
					>
						<XIcon class="h-3 w-3" />
					</button>
					{#each LABEL_COLORS as color}
						<button
							onclick={() => setCoverColor(color)}
							class="h-8 w-8 rounded-full transition-all {COVER_COLORS[color]} {card.coverColor === color ? 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-110' : 'opacity-50 hover:opacity-80 hover:scale-105'}"
							aria-label={color}
						></button>
					{/each}
				</div>
			</div>

			<!-- Description -->
			<div>
				<div class="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
					<FileTextIcon class="h-3.5 w-3.5" />
					描述
				</div>
				<textarea
					bind:value={editDescription}
					onblur={saveDescription}
					class="w-full resize-none rounded-lg border bg-muted/50 px-3 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
					rows="5"
					placeholder="添加描述..."
				></textarea>
			</div>
		</div>

		<!-- Footer -->
		<div class="sticky bottom-0 border-t bg-background px-6 py-4">
			<button
				onclick={handleDelete}
				class="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
			>
				<TrashIcon class="h-4 w-4" />
				删除卡片
			</button>
		</div>
	</SheetContent>
</Sheet>
