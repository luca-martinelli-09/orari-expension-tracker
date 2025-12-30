<script lang="ts">
    import { store } from '$lib/store.svelte';
    import type { DayType, WorkDay } from '$lib/types';
    import { Clock } from 'lucide-svelte';
    import { slide } from 'svelte/transition';
    import { untrack } from 'svelte';
    import Modal from './ui/Modal.svelte';
    import AttachmentManager from './ui/AttachmentManager.svelte';
    import Input from './ui/Input.svelte';
    import Select from './ui/Select.svelte';
    import Button from './ui/Button.svelte';

    let { date, onClose } = $props<{ date: string, onClose: () => void }>();

    let showModal = $state(true);

    // Create a local copy for editing
    // We use untrack to explicitely tell Svelte we only want the initial value
    let day = $state<WorkDay>(untrack(() => structuredClone($state.snapshot(store.getDay(date)))));

    const types: DayType[] = ['Lavoro', 'Ferie', 'Malattia', 'Permesso', 'Chiusura', 'Festivo', 'Sabato', 'Domenica'];

    function save() {
        store.updateDay(date, day);
        handleClose();
    }

    function handleClose() {
        showModal = false;
        onClose();
    }
</script>

<Modal
    bind:open={showModal}
    onClose={handleClose}
    title="Modifica Giorno"
    subtitle={date}
>
    {#snippet children()}
        <!-- Type Selector -->
        <Select
            bind:value={day.type}
            id="type-select"
            label="Stato giornata"
            options={types}
            variant="filled"
        />

        <!-- Hours (If Lavoro) -->
        {#if day.type === 'Lavoro'}
            <div transition:slide class="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700/50">
                <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                    <Clock size={18} />
                    <span class="text-sm font-semibold tracking-wide">Orari di lavoro</span>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <Input
                        bind:value={day.morningStart}
                        id="m-start"
                        label="Inizio Mattina"
                        type="time"
                        variant="filled"
                    />
                    <Input
                        bind:value={day.morningEnd}
                        id="m-end"
                        label="Fine Mattina"
                        type="time"
                        variant="filled"
                    />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <Input
                        bind:value={day.afternoonStart}
                        id="a-start"
                        label="Inizio Pomeriggio"
                        type="time"
                        variant="filled"
                    />
                    <Input
                        bind:value={day.afternoonEnd}
                        id="a-end"
                        label="Fine Pomeriggio"
                        type="time"
                        variant="filled"
                    />
                </div>
            </div>
        {/if}

        <!-- Attachments -->
        <AttachmentManager
            bind:attachments={day.attachments}
            enablePaste={true}
            label="Allegati"
            emptyText="Trascina o carica file qui"
        />
    {/snippet}

    {#snippet footer()}
        <Button variant="ghost" onclick={handleClose}>
            <span>Annulla</span>
        </Button>
        <Button variant="primary" onclick={save}>
            <span>Salva</span>
        </Button>
    {/snippet}
</Modal>




        
