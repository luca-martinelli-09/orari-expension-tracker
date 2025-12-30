<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		head = false,
		class: className = '',
		align = 'left',
		bold = false
	} = $props<{
		children?: Snippet;
		head?: boolean;
		class?: string;
		align?: 'left' | 'center' | 'right';
		bold?: boolean;
	}>();

	const alignmentClasses: Record<'left' | 'center' | 'right', string> = {
		left: 'text-left',
		center: 'text-center',
		right: 'text-right'
	};
</script>

{#if head}
	<th
		class="p-5 font-semibold text-md-onSurfaceVariant text-sm {alignmentClasses[
			align as 'left' | 'center' | 'right'
		]} {className}"
	>
		{@render children?.()}
	</th>
{:else}
	<td
		class="p-5 text-sm {alignmentClasses[align as 'left' | 'center' | 'right']} {bold
			? 'font-bold'
			: 'font-medium'} text-md-onSurface {className}"
	>
		{@render children?.()}
	</td>
{/if}
