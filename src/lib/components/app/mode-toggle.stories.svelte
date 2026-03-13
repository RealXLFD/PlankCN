<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { Snippet } from 'svelte';

	import ModeToggle from './mode-toggle.svelte';

	type Args = {
		forcedMode: 'light' | 'dark' | 'system';
	};

	const { Story } = defineMeta<Snippet<[Args, unknown]>, typeof ModeToggle>({
		title: 'App/ModeToggle',
		component: ModeToggle,
		parameters: {
			layout: 'centered'
		}
	});
</script>

<script lang="ts">
	import { getThemeStore } from '$lib/stores/theme.svelte';

	type ForcedMode = 'light' | 'dark' | 'system';
	const themeStore = getThemeStore();

	function applyForcedMode(forcedMode: ForcedMode) {
		if (typeof document === 'undefined') {
			return;
		}

		themeStore.setMode(forcedMode);
	}

	function forceMode(_node: HTMLElement, forcedMode: ForcedMode) {
		applyForcedMode(forcedMode);

		return {
			update(nextMode: ForcedMode) {
				applyForcedMode(nextMode);
			}
		};
	}
</script>

<Story name="Light" args={{ forcedMode: 'light' }}>
	{#snippet template({ forcedMode }: Args)}
		<div
			use:forceMode={forcedMode}
			class="flex min-h-40 items-center justify-center bg-background p-8 text-foreground"
		>
			<ModeToggle />
		</div>
	{/snippet}
</Story>

<Story name="Dark" args={{ forcedMode: 'dark' }}>
	{#snippet template({ forcedMode }: Args)}
		<div
			use:forceMode={forcedMode}
			class="flex min-h-40 items-center justify-center bg-background p-8 text-foreground"
		>
			<ModeToggle />
		</div>
	{/snippet}
</Story>

<Story name="System" args={{ forcedMode: 'system' }}>
	{#snippet template({ forcedMode }: Args)}
		<div
			use:forceMode={forcedMode}
			class="flex min-h-40 items-center justify-center bg-background p-8 text-foreground"
		>
			<ModeToggle />
		</div>
	{/snippet}
</Story>
