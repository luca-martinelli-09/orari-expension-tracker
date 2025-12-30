<script lang="ts">
    import type { Snippet } from 'svelte';

    type Variant = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'default';
    type Size = 'sm' | 'md' | 'lg';

    let {
        variant = 'default',
        size = 'md',
        children,
        class: className = ''
    } = $props<{
        variant?: Variant,
        size?: Size,
        children: Snippet,
        class?: string
    }>();

    const variantClasses = {
        primary: 'bg-indigo-100/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200',
        success: 'bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200',
        danger: 'bg-rose-100/80 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200',
        warning: 'bg-amber-100/80 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
        info: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        default: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
    };

    const sizeClasses = {
        sm: 'text-[10px] px-2.5 py-1 rounded-full',
        md: 'text-[11px] px-2 py-1 rounded-lg',
        lg: 'text-[12px] px-3 py-1.5 rounded-lg'
    };

    const baseClasses = 'font-bold inline-flex items-center justify-center gap-1.5 uppercase tracking-wide';
</script>

<div class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {className}">
    {@render children()}
</div>
