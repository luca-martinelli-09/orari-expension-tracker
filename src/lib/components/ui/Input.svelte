<script lang="ts">
    import { Label } from "bits-ui";

    let { 
        value = $bindable(), 
        id = crypto.randomUUID(), 
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

<div class="{className} space-y-2">
    {#if label}
        <Label.Root for={id} class="block text-[10px] font-black uppercase tracking-[0.2em] text-md-onSurface/40 ml-1">
            {label}
        </Label.Root>
    {/if}
    <input 
        {id} 
        {type} 
        {step}
        bind:value 
        {placeholder}
        class="w-full rounded-none border-2 border-md-onSurface bg-md-background text-md-onSurface shadow-sm focus:ring-4 focus:ring-md-onSurface/10 p-4 transition-all placeholder:text-md-onSurface/20 font-bold uppercase tracking-widest text-sm"
    />
</div>
