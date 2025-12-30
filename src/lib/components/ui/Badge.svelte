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

    const variantClasses: Record<Variant, string> = {
        primary: 'bg-md-primary text-md-onPrimary border-md-primary',
        success: 'bg-md-onSurface text-md-surface border-md-onSurface',
        danger: 'border-2 border-md-onSurface text-md-onSurface',
        warning: 'bg-md-onSurface/10 text-md-onSurface border-md-onSurface/20',
        info: 'bg-md-surface-variant text-md-onSurface border-md-onSurface/10',
        default: 'border border-md-onSurface/30 text-md-onSurface/60'
    };

    const sizeClasses: Record<Size, string> = {
        sm: 'text-[9px] px-2 py-0.5 rounded-none',
        md: 'text-[10px] px-3 py-1 rounded-none',
        lg: 'text-[11px] px-4 py-1.5 rounded-none'
    };

    const baseClasses = 'font-black inline-flex items-center justify-center gap-1.5 uppercase tracking-widest transition-all duration-200 border';
</script>

<div class="{baseClasses} {variantClasses[variant as Variant]} {sizeClasses[size as Size]} {className}">
    {@render children()}
</div>