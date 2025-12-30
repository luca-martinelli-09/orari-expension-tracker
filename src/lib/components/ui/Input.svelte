<script lang="ts">
    let { 
        value = $bindable(), 
        id, 
        label, 
        type = 'text', 
        placeholder = '', 
        step,
        class: className = '' 
    } = $props<{ 
        value: any, 
        id?: string, 
        label?: string, 
        type?: string, 
        placeholder?: string, 
        step?: string | number,
        class?: string 
    }>();
</script>

<div class="{className} space-y-1">
    {#if label}
        <label for={id} class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">
            {label}
        </label>
    {/if}
    <input 
        {id} 
        {type} 
        {step}
        bind:value 
        {placeholder}
        class="w-full rounded-2xl border-none bg-slate-50 dark:bg-[#25252b] text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 p-4 transition-all placeholder:text-slate-400"
    />
</div>
