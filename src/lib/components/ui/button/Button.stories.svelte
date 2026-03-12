<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Button } from '$lib/components/ui/button';

	const { Story } = defineMeta({
		title: 'UI/Button',
		component: Button,
		args: {
			variant: 'default',
			size: 'default'
		}
	});
</script>

<Story name="Default Action">Save changes</Story>
