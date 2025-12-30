<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, class: className = '' } = $props<{ children: Snippet; class?: string }>();
</script>

<div class="bg-md-background border-2 border-md-on-surface overflow-hidden {className}">
	{@render children()}
</div>
