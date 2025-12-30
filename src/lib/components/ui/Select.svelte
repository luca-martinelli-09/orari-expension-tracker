<script lang="ts">
	import { Select, Label } from 'bits-ui';
	import { Check, ChevronDown } from 'lucide-svelte';

	let {
		value = $bindable(),
		label,
		options = [],
		class: className = ''
	} = $props<{
		value: string;
		label?: string;
		options: string[];
		class?: string;
	}>();

	const items = $derived(options.map((opt: string) => ({ value: opt, label: opt })));
	const selectedLabel = $derived(options.find((opt: string) => opt === value) || 'Seleziona...');
</script>

<div class="{className} space-y-2">
	{#if label}
		<Label.Root
			class="block text-[10px] font-black uppercase tracking-[0.2em] text-md-on-surface/40 ml-1"
		>
			{label}
		</Label.Root>
	{/if}

	<Select.Root type="single" bind:value {items}>
		<Select.Trigger
			class="flex h-14 w-full items-center justify-between border-2 border-md-on-surface bg-md-background px-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-md-on-surface/10 transition-all active:scale-[0.98] text-md-on-surface cursor-pointer"
		>
			<span>{selectedLabel}</span>
			<ChevronDown size={18} class="opacity-50" />
		</Select.Trigger>

		<Select.Portal>
			<Select.Content
				class="z-100 min-w-(--bits-select-anchor-width) border-2 border-md-on-surface bg-md-background p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
				sideOffset={4}
			>
				<div class="max-h-60 overflow-y-auto custom-scrollbar">
					{#each items as item}
						<Select.Item
							value={item.value}
							label={item.label}
							class="flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest cursor-pointer outline-none hover:bg-md-on-surface hover:text-md-surface data-selected:bg-md-on-surface data-selected:text-md-surface transition-colors"
						>
							{item.label}
							{#if value === item.value}
								<Check size={14} strokeWidth={4} />
							{/if}
						</Select.Item>
					{/each}
				</div>
			</Select.Content>
		</Select.Portal>
	</Select.Root>
</div>
