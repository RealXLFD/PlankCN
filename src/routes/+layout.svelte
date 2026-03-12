<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { getThemeStore } from '$lib/stores/theme.svelte';

	let { children } = $props();
	const themeStore = getThemeStore();

	onMount(() => {
		themeStore.init();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children?.()}
