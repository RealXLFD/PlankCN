<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { INITIAL_VIEWPORTS } from 'storybook/viewport';

	import AppShell from './app-shell.svelte';

	const { Story } = defineMeta({
		title: 'App/AppShell',
		component: AppShell,
		args: {
			open: true,
			mobileOpen: false
		},
		parameters: {
			layout: 'fullscreen',
			viewport: {
				options: INITIAL_VIEWPORTS
			}
		}
	});
</script>

<Story name="Desktop Expanded" args={{ open: true, mobileOpen: false }} />

<Story name="Desktop Collapsed" args={{ open: false, mobileOpen: false }} />

<Story
	name="Mobile Drawer Open"
	args={{ open: true, mobileOpen: true }}
	globals={{ viewport: { value: 'mobile1', isRotated: false } }}
/>
