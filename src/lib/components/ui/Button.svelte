<script lang="ts">
	import { Button } from 'bits-ui';
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';

	let {
		children,
		variant = 'primary',
		onclick,
		disabled = false,
		type = 'button',
		class: className = '',
		...rest
	} = $props<{
		children: Snippet;
		variant?: Variant;
		onclick?: () => void;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		[key: string]: any;
	}>();

	const baseClasses =
		'font-black uppercase tracking-widest text-[10px] transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 border-2 rounded-full cursor-pointer';

	const variants: Record<Variant, string> = {
		primary: 'bg-md-primary text-md-on-primary border-md-primary hover:brightness-125 px-6 py-3',
		secondary:
			'bg-md-surface-variant text-md-on-surface border-md-outline hover:bg-md-on-surface hover:text-md-surface hover:border-md-on-surface px-6 py-3',
		danger:
			'bg-transparent text-md-on-surface border-md-on-surface hover:bg-md-on-surface hover:text-md-surface px-6 py-3',
		ghost:
			'bg-transparent text-md-on-surface border-transparent hover:bg-md-on-surface/10 px-4 py-2',
		icon: 'p-2 rounded-full border-transparent hover:bg-md-on-surface/10 text-md-on-surface'
	};
</script>

<Button.Root
	{type}
	class="{baseClasses} {variants[variant as Variant]} {className}"
	{onclick}
	{disabled}
	{...rest}
>
	{@render children()}
</Button.Root>
