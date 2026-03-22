<script lang="ts">
	import XIcon from "@lucide/svelte/icons/x";
	import CheckIcon from "@lucide/svelte/icons/check";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import type { BackgroundSize } from "$lib/stores/board.svelte";

	let {
		imageUrl,
		onSave,
		onCancel,
		initialSize = "cover",
		initialCrop = { x: 0, y: 0, width: 100, height: 100 },
	}: {
		imageUrl: string;
		onSave: (settings: {
			size: BackgroundSize;
			crop: { x: number; y: number; width: number; height: number };
		}) => void;
		onCancel: () => void;
		initialSize?: BackgroundSize;
		initialCrop?: { x: number; y: number; width: number; height: number };
	} = $props();

	let size = $state<BackgroundSize>(initialSize);
	let crop = $state(initialCrop);

	let containerRef: HTMLDivElement | undefined = $state();
	let imageWidth = $state(0);
	let imageHeight = $state(0);

	let isDragging = $state(false);
	let isResizing = $state(false);
	let dragType = $state<'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | null>(null);
	let dragStart = $state({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });

	function handleImageLoad(e: Event) {
		const img = e.target as HTMLImageElement;
		imageWidth = img.offsetWidth;
		imageHeight = img.offsetHeight;
	}

	function handlePointerDown(e: PointerEvent, type: 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se') {
		e.stopPropagation();
		dragType = type;
		isDragging = type === 'move';
		isResizing = type !== 'move';
		dragStart = { x: e.clientX, y: e.clientY, cropX: crop.x, cropY: crop.y, cropW: crop.width, cropH: crop.height };
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragType || !containerRef) return;

		const rect = containerRef.getBoundingClientRect();
		const dx = (e.clientX - dragStart.x) * (100 / rect.width);
		const dy = (e.clientY - dragStart.y) * (100 / rect.height);

		if (dragType === 'move') {
			const newX = Math.max(0, Math.min(100 - crop.width, dragStart.cropX + dx));
			const newY = Math.max(0, Math.min(100 - crop.height, dragStart.cropY + dy));
			crop = { ...crop, x: newX, y: newY };
		} else if (dragType === 'resize-se') {
			const newW = Math.max(10, Math.min(100 - crop.x, dragStart.cropW + dx));
			const newH = Math.max(10, Math.min(100 - crop.y, dragStart.cropH + dy));
			crop = { ...crop, width: newW, height: newH };
		} else if (dragType === 'resize-sw') {
			const newX = Math.max(0, Math.min(crop.x + crop.width - 10, dragStart.cropX + dx));
			const newW = Math.max(10, dragStart.cropW - dx);
			const newH = Math.max(10, Math.min(100 - crop.y, dragStart.cropH + dy));
			crop = { ...crop, x: newX, width: newW, height: newH };
		} else if (dragType === 'resize-ne') {
			const newW = Math.max(10, Math.min(100 - crop.x, dragStart.cropW + dx));
			const newY = Math.max(0, Math.min(crop.y + crop.height - 10, dragStart.cropY + dy));
			const newH = Math.max(10, dragStart.cropH - dy);
			crop = { ...crop, width: newW, y: newY, height: newH };
		} else if (dragType === 'resize-nw') {
			const newX = Math.max(0, Math.min(crop.x + crop.width - 10, dragStart.cropX + dx));
			const newY = Math.max(0, Math.min(crop.y + crop.height - 10, dragStart.cropY + dy));
			const newW = Math.max(10, dragStart.cropW - dx);
			const newH = Math.max(10, dragStart.cropH - dy);
			crop = { ...crop, x: newX, y: newY, width: newW, height: newH };
		}
	}

	function handlePointerUp() {
		dragType = null;
		isDragging = false;
		isResizing = false;
	}

	function handleReset() {
		crop = { x: 0, y: 0, width: 100, height: 100 };
		size = 'cover';
	}

	const sizeOptions: { value: BackgroundSize; label: string; desc: string }[] = [
		{ value: 'cover', label: '填充', desc: '完全覆盖' },
		{ value: 'contain', label: '适应', desc: '完整显示' },
		{ value: 'fill', label: '拉伸', desc: '拉伸填满' },
	];
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-[10001] flex items-center justify-center bg-black/70 backdrop-blur-sm"
	onclick={onCancel}
	onkeydown={(e) => { if (e.key === 'Escape') onCancel(); }}
	role="dialog"
	aria-modal="true"
	aria-label="背景裁剪编辑器"
	tabindex="-1"
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="relative flex w-[900px] max-w-[95vw] max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-border/50 bg-popover shadow-2xl"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
		onpointerleave={handlePointerUp}
	>
		<div class="flex items-center justify-between border-b border-border/50 px-5 py-4">
			<div>
				<h2 class="text-lg font-semibold">调整背景</h2>
				<p class="text-xs text-muted-foreground mt-0.5">拖动裁剪框调整显示区域，拖动角落调整大小</p>
			</div>
			<button
				onclick={onCancel}
				class="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				aria-label="关闭"
			>
				<XIcon class="h-5 w-5" />
			</button>
		</div>

		<div class="flex-1 overflow-hidden bg-muted/30 p-4">
			<div class="relative mx-auto flex items-center justify-center" style="height: 400px;">
				<div bind:this={containerRef} class="relative inline-block">
					{#if imageWidth > 0}
						<div
							class="absolute border-2 border-primary {isDragging || isResizing ? 'border-solid' : 'border-dashed'} bg-primary/10"
							style="left: {crop.x}%; top: {crop.y}%; width: {crop.width}%; height: {crop.height}%; cursor: move;"
							onpointerdown={(e) => handlePointerDown(e, 'move')}
						>
							<button
								class="absolute -left-1.5 -top-1.5 h-3 w-3 cursor-nw-resize rounded-full border border-primary bg-background"
								onpointerdown={(e) => handlePointerDown(e, 'resize-nw')}
							></button>
							<button
								class="absolute -right-1.5 -top-1.5 h-3 w-3 cursor-ne-resize rounded-full border border-primary bg-background"
								onpointerdown={(e) => handlePointerDown(e, 'resize-ne')}
							></button>
							<button
								class="absolute -left-1.5 -bottom-1.5 h-3 w-3 cursor-sw-resize rounded-full border border-primary bg-background"
								onpointerdown={(e) => handlePointerDown(e, 'resize-sw')}
							></button>
							<button
								class="absolute -right-1.5 -bottom-1.5 h-3 w-3 cursor-se-resize rounded-full border border-primary bg-background"
								onpointerdown={(e) => handlePointerDown(e, 'resize-se')}
							></button>
						</div>
					{/if}
					<img
						src={imageUrl}
						alt="背景预览"
						class="max-h-[400px] max-w-[800px] select-none rounded-lg"
						onload={handleImageLoad}
						draggable="false"
					/>
				</div>
			</div>
		</div>

		<div class="border-t border-border/50 px-5 py-4">
			<div class="mb-4">
				<span class="text-xs font-medium text-muted-foreground mb-2 block">尺寸模式</span>
				<div class="flex gap-2">
					{#each sizeOptions as opt}
						<button
							onclick={() => size = opt.value}
							class="flex-1 flex flex-col items-center justify-center h-12 rounded-md border text-xs transition-colors {size === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-border/50 text-muted-foreground hover:bg-muted'}"
						>
							<span class="font-medium">{opt.label}</span>
							<span class="text-[10px] text-muted-foreground/70">{opt.desc}</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="flex items-center justify-between">
				<button
					onclick={handleReset}
					class="flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					<RotateCcwIcon class="h-3.5 w-3.5" />
					重置
				</button>
				<div class="flex gap-2">
					<button
						onclick={onCancel}
						class="rounded-md border border-border/50 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
					>取消</button>
					<button
						onclick={() => onSave({ size, crop })}
						class="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						<CheckIcon class="h-4 w-4" />
						应用
					</button>
				</div>
			</div>
		</div>
	</div>
</div>