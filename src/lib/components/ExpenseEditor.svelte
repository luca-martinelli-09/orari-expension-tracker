<script lang="ts">
	import { store } from '$lib/store.svelte';
	import type { Expense, ExpenseCategory } from '$lib/types';
	import Modal from './ui/Modal.svelte';
	import Button from './ui/Button.svelte';
	import Input from './ui/Input.svelte';
	import Select from './ui/Select.svelte';
	import { untrack } from 'svelte';
	import AttachmentManager from './ui/AttachmentManager.svelte';

	let { onClose, expense = null } = $props<{ onClose: () => void; expense?: Expense | null }>();

	const categories: ExpenseCategory[] = [
		'Viaggi aerei, ferroviari',
		'Autostrada',
		'Noleggi auto',
		'Rimborso Km',
		'Viaggi locali (tram, bus, ecc)',
		'Alloggio',
		'Vitto',
		'Lavanderia, stireria',
		'Postali, telegrafiche, telefoniche',
		'Parcheggi',
		'Spese straordinarie'
	];

	let currentExpense = $state<Expense>(
		untrack(() =>
			expense
				? structuredClone($state.snapshot(expense))
				: {
						id: crypto.randomUUID(),
						date: new Date().toISOString().split('T')[0],
						description: '',
						amount: 0,
						currency: 'EUR',
						type: 'Manuale',
						category: 'Viaggi aerei, ferroviari',
						attachments: []
					}
		)
	);

	function save() {
		if (expense) {
			const idx = store.state.expenses.findIndex((e) => e.id === expense!.id);
			if (idx >= 0) {
				store.state.expenses[idx] = currentExpense;
			}
		} else {
			store.addExpense(currentExpense);
		}
		onClose();
	}

	function addFile(file: File) {
		const reader = new FileReader();
		reader.onload = (e) => {
			currentExpense.attachments.push({
				id: crypto.randomUUID(),
				name: file.name,
				type: file.type,
				data: e.target?.result as string
			});
		};
		reader.readAsDataURL(file);
	}

	function handlePaste(e: ClipboardEvent) {
		if (e.clipboardData && e.clipboardData.items) {
			Array.from(e.clipboardData.items).forEach((item) => {
				if (item.kind === 'file') {
					const file = item.getAsFile();
					if (file) addFile(file);
				}
			});
		}
	}
</script>

<svelte:window onpaste={handlePaste} />

<Modal title={expense ? 'Modifica Spesa' : 'Aggiungi Spesa'} {onClose}>
	<div class="space-y-6">
		<Input label="Data" type="date" bind:value={currentExpense.date} />

		<Input
			label="Descrizione"
			placeholder="Es. Biglietto treno"
			bind:value={currentExpense.description}
		/>

		<Select label="Categoria Spesa" bind:value={currentExpense.category} options={categories} />

		<div class="grid grid-cols-2 gap-6">
			<div class="space-y-2">
				<label
					class="block text-[10px] font-black uppercase tracking-[0.2em] text-md-on-surface/40 ml-1"
					for="amount">Importo</label
				>
				<div class="relative">
					<span
						class="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant font-black text-sm"
						>€</span
					>
					<input
						id="amount"
						type="number"
						step="0.01"
						bind:value={currentExpense.amount}
						class="w-full border-2 border-md-on-surface bg-md-background text-md-on-surface shadow-sm focus:ring-4 focus:ring-md-on-surface/10 p-4 pl-10 transition-all font-black uppercase tracking-widest text-sm"
					/>
				</div>
			</div>
			<Input label="Valuta" bind:value={currentExpense.currency} />
		</div>

		<div class="pt-2">
			<AttachmentManager
				bind:attachments={currentExpense.attachments}
				onFileAdd={addFile}
				label="Ricevute / Biglietti"
			/>
		</div>
	</div>

	{#snippet footer()}
		<Button variant="ghost" onclick={onClose} class="uppercase tracking-widest text-[10px]"
			>Chiudi</Button
		>
		<Button variant="primary" onclick={save} class="uppercase tracking-widest text-[10px]"
			>Salva Spesa</Button
		>
	{/snippet}
</Modal>
