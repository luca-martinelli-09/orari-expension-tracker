<script lang="ts">
    import type { Snippet } from 'svelte';

    let { 
        value = $bindable(), 
        id, 
        label, 
        options = [], 
        class: className = '' 
    } = $props<{ 
        value: any, 
        id?: string, 
        label?: string, 
        options: string[], 
        class?: string 
    }>();
</script>

<div class="{className} space-y-1">
    {#if label}
        <label for={id} class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">
            {label}
        </label>
    {/if}
    <div class="relative">
        <select 
            {id} 
            bind:value 
            class="w-full rounded-2xl border-none bg-slate-50 dark:bg-[#25252b] text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 p-4 appearance-none transition-all cursor-pointer"
        >
            {#each options as opt}
                <option value={opt}>{opt}</option>
            {/each}
        </select>
        <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
            <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
            </svg>
        </div>
    </div>
</div>
