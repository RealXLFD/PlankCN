<script lang="ts">
	import ModeToggle from "./mode-toggle.svelte";
	import BoardView from "$lib/components/board/board-view.svelte";
	import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
	import SearchIcon from "@lucide/svelte/icons/search";
	import XIcon from "@lucide/svelte/icons/x";
	import ImageIcon from "@lucide/svelte/icons/image";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import Grid3X3Icon from "@lucide/svelte/icons/layout-grid";
	import { getSearchStore, getSettingsStore, getBoardStore } from "$lib/stores/board.svelte";
	import { onMount } from "svelte";

	const search = getSearchStore();
	const settings = getSettingsStore();
	const store = getBoardStore();

	let showSettings = $state(false);
	let showResetConfirm = $state(false);
	let showResetLayoutConfirm = $state(false);
	let settingsPanel: HTMLDivElement | undefined = $state();
	let settingsBtn: HTMLButtonElement | undefined = $state();
	let fileInput: HTMLInputElement | undefined = $state();

	function handleBgUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			settings.backgroundImage = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	function removeBg() {
		settings.backgroundImage = null;
	}

	function handleSettingsClick(e: MouseEvent) {
		e.stopPropagation();
		showSettings = !showSettings;
	}

	onMount(() => {
		function handleGlobalPointerDown(e: PointerEvent) {
			if (!showSettings) return;
			const target = e.target as Node;
			if (settingsPanel?.contains(target)) return;
			if (settingsBtn?.contains(target)) return;
			showSettings = false;
		}
		document.addEventListener('pointerdown', handleGlobalPointerDown);
		return () => document.removeEventListener('pointerdown', handleGlobalPointerDown);
	});
</script>

<div class="relative flex h-screen flex-col" data-testid="app-shell">
	<!-- Background image layer -->
	{#if settings.backgroundImage}
		<div class="pointer-events-none absolute inset-0 z-0">
			<img
				src={settings.backgroundImage}
				alt=""
				class="h-full w-full object-cover"
			/>
		</div>
	{/if}

	<!-- Top bar -->
	<header class="relative z-20 flex h-11 shrink-0 items-center border-b border-border/50 px-4 backdrop-blur-xl {settings.backgroundImage ? 'bg-background/60' : 'bg-background shadow-sm dark:bg-card'}">
		<div class="flex items-end gap-2">
			<LayoutDashboardIcon class="h-4 w-4 text-foreground mb-[1px]" />
			<h1 class="text-sm font-semibold leading-none">PlankCN</h1>
			<span class="text-[10px] leading-none text-muted-foreground/60">by RealXLFD</span>
		</div>
		<!-- Search -->
		<div class="mx-4 flex max-w-xs flex-1 items-center gap-1.5 rounded-lg border border-border/50 bg-background/40 backdrop-blur-sm px-2.5 py-1 dark:bg-secondary/50">
			<SearchIcon class="h-3.5 w-3.5 text-muted-foreground" />
			<input
				bind:value={search.query}
				placeholder="搜索卡片..."
				aria-label="搜索卡片"
				class="min-w-0 flex-1 bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none"
			/>
			{#if search.query}
				<button onclick={() => search.query = ''} class="text-muted-foreground hover:text-foreground">
					<XIcon class="h-3.5 w-3.5" />
				</button>
			{/if}
		</div>
		<div class="ml-auto flex items-center gap-1.5">
			<button
				onclick={() => showResetLayoutConfirm = true}
				class="flex h-8 w-8 items-center justify-center rounded-md border border-border/50 shadow-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground dark:bg-secondary/50 dark:shadow-none"
				aria-label="重置布局"
			>
				<Grid3X3Icon class="h-4 w-4" />
			</button>
			<button
				onclick={() => showResetConfirm = true}
				class="flex h-8 w-8 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 shadow-sm text-red-500 transition-colors hover:bg-red-500/20 hover:border-red-500/50"
				aria-label="清空看板"
			>
				<Trash2Icon class="h-4 w-4" />
			</button>
			<input bind:this={fileInput} type="file" accept="image/*" class="hidden" onchange={handleBgUpload} />
			<button
				onclick={() => fileInput?.click()}
				class="flex h-8 w-8 items-center justify-center rounded-md border border-border/50 shadow-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground dark:bg-secondary/50 dark:shadow-none"
				aria-label="上传背景"
			>
				<ImageIcon class="h-4 w-4" />
			</button>
			<!-- Settings -->
			<div class="relative" style="z-index: 9999;">
				<button
					bind:this={settingsBtn}
					onclick={handleSettingsClick}
					class="flex h-8 w-8 items-center justify-center rounded-md border border-border/50 shadow-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground dark:bg-secondary/50 dark:shadow-none"
					aria-label="设置"
					aria-expanded={showSettings}
					aria-haspopup="true"
				>
					<SettingsIcon class="h-4 w-4" />
				</button>
				{#if showSettings}
					<div
						bind:this={settingsPanel}
						role="dialog"
						aria-label="设置面板"
						tabindex="-1"
						class="absolute right-0 mt-2 w-64 rounded-xl border bg-popover p-4 shadow-lg"
						style="z-index: 9999;"
						onclick={(e) => e.stopPropagation()}
						onpointerdown={(e) => e.stopPropagation()}
						onkeydown={(e) => { if (e.key === 'Escape') showSettings = false; }}
					>
						<div class="text-xs font-medium text-muted-foreground mb-3">面板模糊度</div>
						<div class="flex items-center gap-3">
							<input
								type="range"
								min="0"
								max="40"
								step="1"
								bind:value={settings.blurLevel}
								class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
							/>
							<span class="w-8 text-right text-xs tabular-nums text-muted-foreground">{settings.blurLevel}</span>
						</div>
						<div class="text-xs font-medium text-muted-foreground mb-3 mt-4">视图缩放</div>
						<div class="flex items-center gap-3">
							<input
								type="range"
								min="50"
								max="150"
								step="5"
								bind:value={settings.viewScale}
								class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
							/>
							<span class="w-8 text-right text-xs tabular-nums text-muted-foreground">{settings.viewScale}%</span>
						</div>
						{#if settings.backgroundImage}
							<button
								onclick={removeBg}
								class="mt-4 w-full rounded-md border border-destructive/20 px-3 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/10"
							>移除背景</button>
						{/if}
					</div>
				{/if}
			</div>
			<ModeToggle />
		</div>
	</header>

	<!-- Board -->
	<main class="relative z-10 min-h-0 flex-1 overflow-hidden">
		<div style="transform: scale({settings.viewScale / 100}); transform-origin: top left; width: {10000 / settings.viewScale}%; height: {10000 / settings.viewScale}%;">
			<BoardView />
		</div>
	</main>

	{#if showResetConfirm}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="reset-confirm-title"
			tabindex="-1"
			class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
			onclick={() => showResetConfirm = false}
			onkeydown={(e) => { if (e.key === 'Escape') showResetConfirm = false; }}
		>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="rounded-xl border bg-popover p-6 shadow-xl"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<h2 id="reset-confirm-title" class="text-lg font-semibold mb-2">确认清空看板？</h2>
				<p class="text-sm text-muted-foreground mb-4">此操作将删除所有列表并恢复为默认状态，无法撤销。</p>
				<div class="flex justify-end gap-2">
					<button
						onclick={() => showResetConfirm = false}
						class="rounded-md border border-border/50 px-4 py-2 text-sm hover:bg-accent"
					>取消</button>
					<button
						onclick={() => { store.resetBoard(); showResetConfirm = false; }}
						class="rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
					>确认清空</button>
				</div>
			</div>
		</div>
	{/if}

{#if showResetLayoutConfirm}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="reset-layout-title"
			tabindex="-1"
			class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
			onclick={() => showResetLayoutConfirm = false}
			onkeydown={(e) => { if (e.key === 'Escape') showResetLayoutConfirm = false; }}
		>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="rounded-xl border bg-popover p-6 shadow-xl"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
			>
				<h2 id="reset-layout-title" class="text-lg font-semibold mb-2">重置布局</h2>
				<p class="text-sm text-muted-foreground mb-4">此操作将所有列表重新排列为默认布局，列表内容不会丢失。</p>
				<div class="flex justify-end gap-2">
					<button
						onclick={() => showResetLayoutConfirm = false}
						class="rounded-md border border-border/50 px-4 py-2 text-sm hover:bg-accent"
					>取消</button>
					<button
						onclick={() => {
							store.resetLayout();
							showResetLayoutConfirm = false;
						}}
						class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
					>确认重置</button>
				</div>
			</div>
		</div>
	{/if}
</div>
