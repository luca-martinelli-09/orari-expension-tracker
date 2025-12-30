<script lang="ts">
    import type { Snippet } from 'svelte';

    type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
    
    let { 
        children, 
        variant = 'primary', 
        onclick, 
        disabled = false, 
        type = 'button',
        class: className = '' 
    } = $props<{ 
        children: Snippet, 
        variant?: Variant, 
        onclick?: () => void, 
        disabled?: boolean,
        type?: 'button' | 'submit' | 'reset',
        class?: string
    }>();

    const baseClasses = "font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2";
    
    const variants = {
        primary: "bg-indigo-600 dark:bg-indigo-300 text-white dark:text-indigo-900 hover:brightness-110 rounded-full px-6 py-3 shadow-sm",
        secondary: "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:brightness-105 rounded-full px-5 py-3",
        danger: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/50 rounded-full px-5 py-3",
        ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full px-4 py-2",
        icon: "p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400"
    };
</script>

<button 
    {type}
    class="{baseClasses} {variants[variant]} {className}" 
    {onclick} 
    {disabled}
>
    {@render children()}
</button>
