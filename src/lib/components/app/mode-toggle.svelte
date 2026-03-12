<script lang="ts">
	import MonitorIcon from "@lucide/svelte/icons/monitor";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import SunIcon from "@lucide/svelte/icons/sun";
	import { tick } from "svelte";

	import { Button } from "$lib/components/ui/button/index.js";
	import { getThemeStore } from "$lib/stores/theme.svelte";
	import {
		toggleModeWithTransition,
		type StartViewTransition,
	} from "./mode-toggle.ts";

	type TransitionDocument = Document & {
		startViewTransition?: StartViewTransition;
	};

	const themeStore = getThemeStore();
	const isAppearanceTransition =
		typeof document !== "undefined" &&
		!window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	async function waitForModeFlush() {
		await tick();
	}

	function performModeSwitch(event?: MouseEvent) {
		if (!isAppearanceTransition) {
			themeStore.cycleMode();
			return;
		}

		const documentWithTransition = typeof document !== "undefined" ? (document as TransitionDocument) : undefined;
		const startViewTransition = documentWithTransition?.startViewTransition
			? (callback: () => Promise<void> | void) => documentWithTransition.startViewTransition!(callback)
			: undefined;

		void toggleModeWithTransition(
			{
				getCurrentMode: () => themeStore.mode,
				getResolvedMode: () => (themeStore.isDark ? "dark" : "light"),
				resolveMode: (mode) => themeStore.resolveMode(mode),
				cycleMode: () => themeStore.cycleMode(),
				prefersReducedMotion: () => false,
				startViewTransition,
				waitForModeFlush,
				getViewport: () => ({ width: window.innerWidth, height: window.innerHeight }),
				animateReveal: ({ x, y, endRadius }) => {
					document.documentElement.animate?.(
						{
							clipPath: [
								`circle(0px at ${x}px ${y}px)`,
								`circle(${endRadius}px at ${x}px ${y}px)`
							]
						},
						{
							duration: 500,
							easing: "ease-in",
							pseudoElement: "::view-transition-new(root)"
						}
					);
				}
			},
			event
		);
	}
</script>

<Button
	data-testid="mode-toggle-button"
	aria-label="切换亮暗模式"
	variant="outline"
	size="icon"
	class="h-8 w-8"
	onclick={performModeSwitch}
>
	{#if themeStore.mode === "light"}
		<SunIcon class="h-4 w-4 transition-all" />
	{:else if themeStore.mode === "dark"}
		<MoonIcon class="h-4 w-4 transition-all" />
	{:else}
		<MonitorIcon class="h-4 w-4 transition-all" />
	{/if}
</Button>

<style>
	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation: none;
		mix-blend-mode: normal;
	}

	:global(::view-transition-old(root)) {
		z-index: 1;
	}

	:global(::view-transition-new(root)) {
		z-index: 2147483646;
	}
</style>
