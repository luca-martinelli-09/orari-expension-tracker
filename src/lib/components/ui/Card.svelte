<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children, class: className = '' } = $props<{ children: Snippet, class?: string }>();
</script>

<div class="bg-white dark:bg-[#1e1e24] rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800/50 overflow-hidden {className}">
    {@render children()}
</div>
