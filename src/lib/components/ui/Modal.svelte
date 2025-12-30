<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let { children, title, subtitle, onClose, footer } = $props<{
		children: Snippet;
		title: string;
		subtitle?: string;
		onClose: () => void;
		footer?: Snippet;
	}>();

	let open = $state(true);

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) {
			onClose();
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<div transition:fade={{ duration: 150 }}>
			<Dialog.Overlay class="fixed inset-0 z-50 bg-md-on-surface/40 backdrop-blur-md" />
		</div>
		<div
			class="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] focus:outline-none animate-in fade-in zoom-in-95 duration-300 ease-out"
		>
			<Dialog.Content class="bg-md-background border-2 border-md-on-surface p-0 shadow-2xl">
				<!-- Header -->
				<div class="px-8 py-5 flex justify-between items-start border-b-2 border-md-on-surface/5">
					<div>
						<Dialog.Title class="text-3xl font-black uppercase tracking-tighter text-md-on-surface">
							{title}
						</Dialog.Title>
						{#if subtitle}
							<Dialog.Description
								class="text-[10px] font-black uppercase tracking-[0.2em] text-md-on-surface/40 mt-1"
							>
								{subtitle}
							</Dialog.Description>
						{/if}
					</div>
					<Dialog.Close
						class="p-2 rounded-full hover:bg-md-surface-variant text-md-on-surface transition-colors border-none"
					>
						<X size={22} strokeWidth={2.5} />
					</Dialog.Close>
				</div>

				<!-- Scrollable Body -->
				<div class="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar text-md-on-surface">
					{@render children()}
				</div>

				<!-- Footer -->
				{#if footer}
					<div
						class="px-8 py-5 border-t-2 border-md-on-surface/5 bg-md-surface-variant/10 flex justify-end gap-3 text-md-on-surface"
					>
						{@render footer()}
					</div>
				{/if}
			</Dialog.Content>
		</div>
	</Dialog.Portal>
</Dialog.Root>
