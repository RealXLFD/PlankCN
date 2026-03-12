<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import type { HTMLAttributes } from "svelte/elements";

	import AppSidebar from "./app-sidebar.svelte";
	import AppTopbar from "./app-topbar.svelte";
	import MainView from "./main-view.svelte";

	let {
		open = $bindable(true),
		mobileOpen = false,
		class: className,
		style,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		open?: boolean;
		mobileOpen?: boolean;
	} = $props();
</script>

<Sidebar.Provider bind:open data-testid="app-shell" class={className} {style} {...restProps}>
	<AppSidebar mobileOpen={mobileOpen} />
	<Sidebar.Inset>
		<AppTopbar />
		<MainView />
	</Sidebar.Inset>
</Sidebar.Provider>
