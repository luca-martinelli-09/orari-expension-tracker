<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, class: className = '' } = $props<{ children: Snippet; class?: string }>();
</script>

<div class="w-full overflow-x-auto custom-scrollbar">
	<table class="w-full text-left border-collapse {className}">
		{@render children()}
	</table>
</div>
