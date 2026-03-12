<script lang="ts">
	import CheckIcon from "@lucide/svelte/icons/check";
	import PaletteIcon from "@lucide/svelte/icons/palette";

	import { Button } from "$lib/components/ui/button/index.js";
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuLabel,
		DropdownMenuRadioGroup,
		DropdownMenuRadioItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from "$lib/components/ui/dropdown-menu/index.js";
	import { getThemeStore, THEME_OPTIONS } from "$lib/stores/theme.svelte";

	const themeStore = getThemeStore();
	let selectedTheme = $state(themeStore.theme);

	$effect(() => {
		selectedTheme = themeStore.theme;
	});

	function setTheme(theme: (typeof THEME_OPTIONS)[number]["value"]) {
		selectedTheme = theme;
		themeStore.setTheme(theme);
	}
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		{#snippet child({ props }: { props: Record<string, unknown> })}
			<Button
				{...props}
				data-testid="theme-switcher-button"
				variant="outline"
				size="icon"
				class="h-8 w-8"
				aria-label="切换主题"
			>
				<PaletteIcon class="h-4 w-4" />
			</Button>
		{/snippet}
	</DropdownMenuTrigger>

	<DropdownMenuContent align="end" class="w-44">
		<DropdownMenuLabel>主题</DropdownMenuLabel>
		<DropdownMenuSeparator />
		<DropdownMenuRadioGroup bind:value={selectedTheme}>
			{#each THEME_OPTIONS as option}
				<DropdownMenuRadioItem value={option.value} onclick={() => setTheme(option.value)}>
					{#snippet children({ checked })}
						<span class="mr-auto">{option.label}</span>
						{#if checked}
							<CheckIcon class="h-4 w-4" />
						{/if}
					{/snippet}
				</DropdownMenuRadioItem>
			{/each}
		</DropdownMenuRadioGroup>
	</DropdownMenuContent>
</DropdownMenu>
