<script lang="ts">
	import { store } from '$lib/store.svelte';
	import type { DayType, WorkDay } from '$lib/types';
	import { Clock } from 'lucide-svelte';
	import { untrack } from 'svelte';
	import { slide } from 'svelte/transition';
	import AttachmentManager from './ui/AttachmentManager.svelte';
	import Button from './ui/Button.svelte';
	import Input from './ui/Input.svelte';
	import Modal from './ui/Modal.svelte';
	import Select from './ui/Select.svelte';

	let { date, onClose } = $props<{ date: string; onClose: () => void }>();

	let day = $state<WorkDay>(untrack(() => structuredClone($state.snapshot(store.getDay(date)))));

	const types: DayType[] = [
		'Lavoro',
		'Ferie',
		'Malattia',
		'Permesso',
		'Chiusura',
		'Festivo',
		'Sabato',
		'Domenica'
	];

	// Watch for type changes and clear hours if switching to Ferie, Permesso, or Malattia
	let previousType = $state<DayType>(day.type);

	$effect(() => {
		const currentType = day.type;
		if (currentType !== previousType) {
			if (currentType === 'Ferie' || currentType === 'Permesso' || currentType === 'Malattia') {
				day.morningStart = '';
				day.morningEnd = '';
				day.afternoonStart = '';
				day.afternoonEnd = '';
			}
			previousType = currentType;
		}
	});

	function save() {
		store.updateDay(date, day);
		onClose();
	}

	function addFile(file: File) {
		const reader = new FileReader();
		reader.onload = (e) => {
			day.attachments.push({
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

<Modal title="Aggiorna Giorno" subtitle={date} {onClose}>
	<div class="space-y-8">
		<!-- Type Selector -->
		<Select label="Tipologia Giornata" bind:value={day.type} options={types} />

		<!-- Hours Section -->
		<div
			transition:slide
			class="space-y-6 border-2 border-md-on-surface p-6 bg-md-surface-variant/5"
		>
			<div
				class="flex items-center gap-3 text-md-on-surface border-b-2 border-md-on-surface/5 pb-4"
			>
				<Clock size={22} strokeWidth={2.5} />
				<span class="text-xs font-black uppercase tracking-[0.2em]">Orari Sessione</span>
			</div>

			<div class="grid grid-cols-2 gap-6">
				<Input label="Inizio Mattina" type="time" bind:value={day.morningStart} />
				<Input label="Fine Mattina" type="time" bind:value={day.morningEnd} />
			</div>
			<div class="grid grid-cols-2 gap-6">
				<Input label="Inizio Pomeriggio" type="time" bind:value={day.afternoonStart} />
				<Input label="Fine Pomeriggio" type="time" bind:value={day.afternoonEnd} />
			</div>
		</div>

		<!-- Attachment Manager -->
		<AttachmentManager
			bind:attachments={day.attachments}
			onFileAdd={addFile}
			label="Documentazione / Certificati"
		/>
	</div>

	{#snippet footer()}
		<Button variant="ghost" onclick={onClose} class="uppercase tracking-widest text-[10px]"
			>Chiudi</Button
		>
		<Button variant="primary" onclick={save} class="uppercase tracking-widest text-[10px]"
			>Salva</Button
		>
	{/snippet}
</Modal>
