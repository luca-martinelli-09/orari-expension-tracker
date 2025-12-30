<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, class: className = '' } = $props<{ children: Snippet; class?: string }>();
</script>

<thead class="bg-md-surface-container border-b border-md-on-surface {className}">
	{@render children()}
</thead>
