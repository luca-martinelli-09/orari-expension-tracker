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
		variant?: Variant;
		size?: Size;
		children: Snippet;
		class?: string;
	}>();

	const variantClasses: Record<Variant, string> = {
		primary: 'bg-md-primary text-md-on-primary border-md-primary',
		success: 'bg-md-on-surface text-md-surface border-md-on-surface',
		danger: 'border-2 border-md-on-surface text-md-on-surface',
		warning: 'bg-md-on-surface/10 text-md-on-surface border-md-on-surface/20',
		info: 'bg-md-surface-variant text-md-on-surface border-md-on-surface/10',
		default: 'border border-md-on-surface/30 text-md-on-surface/60'
	};

	const sizeClasses: Record<Size, string> = {
		sm: 'text-[9px] px-2 py-0.5 rounded-none',
		md: 'text-[10px] px-3 py-1 rounded-none',
		lg: 'text-[11px] px-4 py-1.5 rounded-none'
	};

	const baseClasses =
		'font-black inline-flex items-center justify-center gap-1.5 uppercase tracking-widest transition-all duration-200 border';
</script>

<div
	class="{baseClasses} {variantClasses[variant as Variant]} {sizeClasses[size as Size]} {className}"
>
	{@render children()}
</div>
