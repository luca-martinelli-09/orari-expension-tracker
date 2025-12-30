<script lang="ts">
    import { store } from '$lib/store.svelte';
    import type { Expense, ExpenseCategory } from '$lib/types';
    import Modal from './ui/Modal.svelte';
    import AttachmentManager from './ui/AttachmentManager.svelte';
    import Input from './ui/Input.svelte';
    import Select from './ui/Select.svelte';
    import Button from './ui/Button.svelte';

    let { onClose, expense = null } = $props<{ onClose: () => void, expense?: Expense | null }>();

    let showModal = $state(true);

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

    let currentExpense = $state<Expense>(expense ? structuredClone($state.snapshot(expense)) : {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        currency: 'EUR',
        type: 'Manuale',
        category: 'Viaggi aerei, ferroviari',
        attachments: []
    });

    function save() {
        if (expense) {
            const idx = store.state.expenses.findIndex(e => e.id === expense!.id);
            if (idx >= 0) {
                store.state.expenses[idx] = currentExpense;
            }
        } else {
            store.addExpense(currentExpense);
        }
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
    title={expense ? 'Modifica Spesa' : 'Nuova Spesa'}
>
    {#snippet children()}
        <Input
            bind:value={currentExpense.date}
            id="date"
            label="Data"
            type="date"
            variant="filled"
        />

        <Input
            bind:value={currentExpense.description}
            id="desc"
            label="Descrizione"
            type="text"
            placeholder="Es. Biglietto treno"
            variant="filled"
        />

        <Select
            bind:value={currentExpense.category}
            id="cat"
            label="Categoria"
            options={categories}
            variant="filled"
        />

        <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1" for="amount">
                    Importo
                </label>
                <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                    <input
                        id="amount"
                        type="number"
                        step="0.01"
                        bind:value={currentExpense.amount}
                        class="w-full rounded-2xl border-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 p-4 pl-9 transition-all"
                    />
                </div>
            </div>
            <Input
                bind:value={currentExpense.currency}
                id="curr"
                label="Valuta"
                type="text"
                variant="filled"
            />
        </div>

        <AttachmentManager
            bind:attachments={currentExpense.attachments}
            enablePaste={true}
            label="Allegati"
            emptyText="Nessun allegato"
        />
    {/snippet}

    {#snippet footer()}
        <Button variant="ghost" onclick={handleClose}>
            <span>Annulla</span>
        </Button>
        <Button variant="primary" onclick={save}>
            <span>Salva Spesa</span>
        </Button>
    {/snippet}
</Modal>



        
