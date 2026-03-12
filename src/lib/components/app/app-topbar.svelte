<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	import ModeToggle from "./mode-toggle.svelte";
	import ThemeSwitcher from "./theme-switcher.svelte";
</script>

<header data-testid="app-topbar" class="flex h-12 shrink-0 items-center gap-2 border-b px-4">
	<Sidebar.Trigger
		aria-label="Toggle sidebar"
		variant="outline"
		size="icon-sm"
		class="relative size-8"
	/>
	<div class="ml-auto flex items-center gap-2">
		<ThemeSwitcher />
		<ModeToggle />
	</div>
</header>
