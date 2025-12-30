<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, class: className = '' } = $props<{ children: Snippet; class?: string }>();
</script>

<thead class="bg-md-surfaceContainer border-b border-md-outline/10 {className}">
	{@render children()}
</thead>
