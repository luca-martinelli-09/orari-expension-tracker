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
		'font-semibold transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 border-2';

	const variants: Record<Variant, string> = {
		primary:
			'bg-md-primary text-md-onPrimary border-md-primary hover:bg-transparent hover:text-md-primary rounded-full px-6 py-2.5',
		secondary:
			'bg-transparent text-md-onSurface border-md-outline hover:bg-md-onSurface hover:text-md-surface rounded-full px-6 py-2.5',
		danger:
			'bg-transparent text-md-onSurface border-md-onSurface hover:bg-md-onSurface hover:text-md-surface rounded-full px-6 py-2.5',
		ghost:
			'bg-transparent text-md-onSurface border-transparent hover:bg-md-surfaceVariant rounded-full px-4 py-2',
		icon: 'p-2 rounded-full border-transparent hover:bg-md-surfaceVariant text-md-onSurface'
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
