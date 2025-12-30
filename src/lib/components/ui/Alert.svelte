<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from 'lucide-svelte';

	type Variant = 'info' | 'warning' | 'success' | 'error';

	let {
		variant = 'info',
		dismissible = false,
		onDismiss,
		children,
		action
	} = $props<{
		variant?: Variant;
		dismissible?: boolean;
		onDismiss?: () => void;
		children: Snippet;
		action?: Snippet;
	}>();

	let visible = $state(true);

	function handleDismiss() {
		visible = false;
		onDismiss?.();
	}

	const variantClasses: Record<Variant, string> = {
		info: 'bg-md-surface-variant border-md-onSurface/10 text-md-onSurface',
		warning: 'bg-md-onSurface/5 border-md-onSurface/20 text-md-onSurface',
		success: 'bg-md-primary text-md-onPrimary border-md-primary',
		error: 'border-2 border-md-onSurface bg-md-background text-md-onSurface'
	};
</script>

{#if visible}
	<div
		class="{variantClasses[
			variant as Variant
		]} px-6 py-4 rounded-none flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300"
	>
		<div class="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
			{@render children()}
		</div>

		{#if action || dismissible}
			<div class="flex items-center gap-2 flex-shrink-0">
				{#if action}
					<div>
						{@render action()}
					</div>
				{/if}
				{#if dismissible}
					<button
						onclick={handleDismiss}
						class="p-1.5 hover:bg-white/10 dark:hover:bg-white/5 rounded-full transition-all duration-200"
						aria-label="Chiudi"
					>
						<X size={16} strokeWidth={3} />
					</button>
				{/if}
			</div>
		{/if}
	</div>
{/if}
