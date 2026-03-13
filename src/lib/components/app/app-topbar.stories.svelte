<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { INITIAL_VIEWPORTS } from 'storybook/viewport';
	import type { Snippet } from 'svelte';

	import AppTopbar from './app-topbar.svelte';

	type Args = {
		open: boolean;
	};

	const { Story } = defineMeta<Snippet<[Args, unknown]>, typeof AppTopbar>({
		title: 'App/AppTopbar',
		component: AppTopbar,
		args: {
			open: true
		},
		parameters: {
			layout: 'fullscreen',
			viewport: {
				options: INITIAL_VIEWPORTS
			}
		}
	});
</script>

<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	function createShellState(open: boolean) {
		return {
			open,
			mobileOpen: false
		};
	}
</script>

<Story name="Desktop Expanded" args={{ open: true }}>
	{#snippet template({ open }: Args)}
		{@const shell = createShellState(open)}
		<Sidebar.Provider bind:open={shell.open} class="min-h-40 bg-muted/30">
			<Sidebar.Root collapsible="offcanvas" />
			<Sidebar.Inset>
				<AppTopbar />
				<div class="flex-1 border-t border-dashed border-border/60 bg-background"></div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	{/snippet}
</Story>

<Story name="Desktop Collapsed" args={{ open: false }}>
	{#snippet template({ open }: Args)}
		{@const shell = createShellState(open)}
		<Sidebar.Provider bind:open={shell.open} class="min-h-40 bg-muted/30">
			<Sidebar.Root collapsible="offcanvas" />
			<Sidebar.Inset>
				<AppTopbar />
				<div class="flex-1 border-t border-dashed border-border/60 bg-background"></div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	{/snippet}
</Story>

<Story
	name="Mobile"
	args={{ open: true }}
	globals={{ viewport: { value: 'mobile1', isRotated: false } }}
>
	{#snippet template({ open }: Args)}
		{@const shell = createShellState(open)}
		<Sidebar.Provider bind:open={shell.open} class="min-h-40 bg-muted/30">
			<Sidebar.Root collapsible="offcanvas" />
			<Sidebar.Inset>
				<AppTopbar />
			</Sidebar.Inset>
		</Sidebar.Provider>
	{/snippet}
</Story>
