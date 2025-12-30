<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children, class: className = '', onclick } = $props<{ children: Snippet, class?: string, onclick?: () => void }>();
</script>

<tr 
    class="hover:bg-md-onSurface/5 transition-colors group {onclick ? 'cursor-pointer' : ''} {className}"
    {onclick}
>
    {@render children()}
</tr>
