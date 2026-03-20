<script lang="ts">
	import XIcon from "@lucide/svelte/icons/x";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import GripVerticalIcon from "@lucide/svelte/icons/grip-vertical";
	import type { Card } from "$lib/stores/board.svelte";

	let {
		card,
		onremove,
		onupdate,
		ondragstart,
		ondragend,
	}: {
		card: Card;
		onremove: () => void;
		onupdate: (updates: Partial<Pick<Card, 'title' | 'description'>>) => void;
		ondragstart: (e: DragEvent) => void;
		ondragend: (e: DragEvent) => void;
	} = $props();

	let editing = $state(false);
	let editTitle = $state('');
	let editDescription = $state('');
	let titleInput: HTMLTextAreaElement | undefined = $state();

	function startEdit() {
		editTitle = card.title;
		editDescription = card.description ?? '';
		editing = true;
		requestAnimationFrame(() => {
			titleInput?.focus();
			titleInput?.select();
		});
	}

	function saveEdit() {
		const trimmed = editTitle.trim();
		if (trimmed) {
			onupdate({ title: trimmed, description: editDescription.trim() || undefined });
		}
		editing = false;
	}

	function cancelEdit() {
		editing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			saveEdit();
		} else if (e.key === 'Escape') {
			cancelEdit();
		}
	}
</script>

{#if editing}
	<div class="rounded-lg border bg-card p-3 shadow-sm">
		<textarea
			bind:this={titleInput}
			bind:value={editTitle}
			onkeydown={handleKeydown}
			class="w-full resize-none rounded border-0 bg-transparent p-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
			rows="2"
			placeholder="卡片标题"
		></textarea>
		<textarea
			bind:value={editDescription}
			onkeydown={handleKeydown}
			class="mt-1.5 w-full resize-none rounded border-0 bg-transparent p-1 text-sm text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
			rows="3"
			placeholder="描述（可选）"
		></textarea>
		<div class="mt-2 flex gap-1.5">
			<button
				onclick={saveEdit}
				class="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
			>保存</button>
			<button
				onclick={cancelEdit}
				class="rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-accent"
			>取消</button>
		</div>
	</div>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="group relative cursor-grab rounded-lg border bg-card px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing active:shadow-lg"
		draggable="true"
		ondragstart={ondragstart}
		ondragend={ondragend}
	>
		<div class="flex items-start gap-1.5">
			<div class="mt-0.5 cursor-grab opacity-0 transition-opacity group-hover:opacity-40">
				<GripVerticalIcon class="h-4 w-4" />
			</div>
			<div class="min-w-0 flex-1">
				<p class="text-sm font-medium leading-normal">{card.title}</p>
				{#if card.description}
					<p class="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">{card.description}</p>
				{/if}
			</div>
			<div class="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
				<button
					onclick={startEdit}
					class="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
					aria-label="编辑"
				>
					<PencilIcon class="h-3.5 w-3.5" />
				</button>
				<button
					onclick={onremove}
					class="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
					aria-label="删除"
				>
					<XIcon class="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	</div>
{/if}
