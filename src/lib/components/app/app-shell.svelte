<script lang="ts">
	import ModeToggle from "./mode-toggle.svelte";
	import BoardView from "$lib/components/board/board-view.svelte";
	import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
</script>

<div class="flex h-screen flex-col" data-testid="app-shell">
	<!-- Top bar -->
	<header class="flex h-11 shrink-0 items-center border-b px-4">
		<div class="flex items-end gap-2">
			<LayoutDashboardIcon class="h-4 w-4 text-foreground mb-[1px]" />
			<h1 class="text-sm font-semibold leading-none">TrelloCN</h1>
			<span class="text-[10px] leading-none text-muted-foreground/60">by RealXLFD</span>
		</div>
		<div class="ml-auto flex items-center gap-2">
			<ModeToggle />
		</div>
	</header>

	<!-- Board -->
	<main class="min-h-0 flex-1 overflow-hidden">
		<BoardView />
	</main>
</div>
