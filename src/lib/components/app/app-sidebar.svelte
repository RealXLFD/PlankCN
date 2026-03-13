<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	let { mobileOpen = false }: { mobileOpen?: boolean } = $props();

	const sidebar = Sidebar.useSidebar();

	$effect(() => {
		sidebar.setOpenMobile(mobileOpen);
	});
</script>

<Sidebar.Root data-testid="app-sidebar" collapsible="offcanvas" />
