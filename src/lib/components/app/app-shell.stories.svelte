<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { INITIAL_VIEWPORTS } from 'storybook/viewport';

	import AppShell from './app-shell.svelte';

	const { Story } = defineMeta({
		title: 'App/AppShell',
		component: AppShell,
		parameters: {
			layout: 'fullscreen',
			viewport: {
				options: INITIAL_VIEWPORTS
			}
		}
	});
</script>

<Story name="Default" />