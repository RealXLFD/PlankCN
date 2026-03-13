<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { Snippet } from 'svelte';

	import ThemeSwitcher from './theme-switcher.svelte';

	type Args = {
		forcedTheme: 'zinc' | 'neutral' | 'stone' | 'slate' | 'gray';
	};

	const { Story } = defineMeta<Snippet<[Args, unknown]>, typeof ThemeSwitcher>({
		title: 'App/ThemeSwitcher',
		component: ThemeSwitcher,
		parameters: {
			layout: 'centered'
			}
	});
</script>

<script lang="ts">
	import { getThemeStore } from '$lib/stores/theme.svelte';

	type ForcedTheme = 'zinc' | 'neutral' | 'stone' | 'slate' | 'gray';
	const themeStore = getThemeStore();

	function applyForcedTheme(forcedTheme: ForcedTheme) {
		if (typeof document === 'undefined') {
			return;
		}

		themeStore.setTheme(forcedTheme);
	}

	function forceTheme(_node: HTMLElement, forcedTheme: ForcedTheme) {
		applyForcedTheme(forcedTheme);

		return {
			update(nextTheme: ForcedTheme) {
				applyForcedTheme(nextTheme);
			}
		};
	}
</script>

<Story name="Default" args={{ forcedTheme: 'zinc' }}>
	{#snippet template({ forcedTheme }: Args)}
		<div
			use:forceTheme={forcedTheme}
			class="flex min-h-40 items-center justify-center bg-background p-8 text-foreground"
		>
			<ThemeSwitcher />
		</div>
	{/snippet}
</Story>

<Story name="Slate Theme" args={{ forcedTheme: 'slate' }}>
	{#snippet template({ forcedTheme }: Args)}
		<div
			use:forceTheme={forcedTheme}
			class="flex min-h-40 items-center justify-center bg-background p-8 text-foreground"
		>
			<ThemeSwitcher />
		</div>
	{/snippet}
</Story>
