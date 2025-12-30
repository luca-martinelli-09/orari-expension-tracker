<script lang="ts">
    import { store } from '$lib/store.svelte';
    import type { Expense, ExpenseCategory } from '$lib/types';
    import { X, Upload, Trash2, FileText } from 'lucide-svelte';

    let { onClose, expense = null } = $props<{ onClose: () => void, expense?: Expense | null }>();
    
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
        onClose();
    }

    function handleFile(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files) {
            Array.from(input.files).forEach(file => {
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
            });
        }
    }

    function removeAttachment(id: string) {
        currentExpense.attachments = currentExpense.attachments.filter(a => a.id !== id);
    }

    function handlePaste(e: ClipboardEvent) {
        if (e.clipboardData && e.clipboardData.items) {
            Array.from(e.clipboardData.items).forEach(item => {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    if (file) {
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
                }
            });
        }
    }
</script>

<svelte:window onpaste={handlePaste} />

<div class="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all" onclick={onClose} role="dialog" tabindex="-1" onkeyup={(e) => e.key === 'Escape' && onClose()}>

    <div class="bg-[#f7f9ff] dark:bg-[#1c1b1f] rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200" onclick={e => e.stopPropagation()} role="document">



        

        <!-- Header -->

        <div class="p-6 pb-2 flex justify-between items-center">

            <h3 class="font-medium text-2xl text-slate-900 dark:text-slate-100">{expense ? 'Modifica Spesa' : 'Nuova Spesa'}</h3>

            <button onclick={onClose} class="p-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors">

                <X size={20} />

            </button>

        </div>



        <div class="p-6 space-y-5">

            <div class="space-y-1">

                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1" for="date">Data</label>

                <input id="date" type="date" bind:value={currentExpense.date} class="w-full rounded-2xl border-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 p-4 transition-all">

            </div>



            <div class="space-y-1">

                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1" for="desc">Descrizione</label>

                <input id="desc" type="text" placeholder="Es. Biglietto treno" bind:value={currentExpense.description} class="w-full rounded-2xl border-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 p-4 transition-all">

            </div>



            <div class="space-y-1">

                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1" for="cat">Categoria</label>

                <select id="cat" bind:value={currentExpense.category} class="w-full rounded-2xl border-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 p-4 transition-all appearance-none">

                    {#each categories as c}

                        <option value={c}>{c}</option>

                    {/each}

                </select>

            </div>



            <div class="grid grid-cols-2 gap-4">

                <div class="space-y-1">

                    <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1" for="amount">Importo</label>

                    <div class="relative">

                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>

                        <input id="amount" type="number" step="0.01" bind:value={currentExpense.amount} class="w-full rounded-2xl border-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 p-4 pl-9 transition-all">

                    </div>

                </div>

                <div class="space-y-1">

                     <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1" for="curr">Valuta</label>

                     <input id="curr" type="text" bind:value={currentExpense.currency} class="w-full rounded-2xl border-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 p-4 transition-all">

                </div>

            </div>



            <div class="space-y-3">

                 <div class="flex justify-between items-center">

                    <label class="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Allegati</label>

                    <label class="cursor-pointer bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all">

                        <Upload size={14} />

                        <span>Aggiungi</span>

                        <input type="file" multiple class="hidden" onchange={handleFile} accept=".pdf,image/*">

                    </label>

                </div>

                {#if currentExpense.attachments.length > 0}

                    <ul class="space-y-2 max-h-40 overflow-y-auto pr-1">

                        {#each currentExpense.attachments as file}

                            <li class="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl group transition-all hover:shadow-sm">

                                <div class="flex items-center gap-3 overflow-hidden">

                                    <div class="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-slate-500 dark:text-slate-400">

                                        <FileText size={18} />

                                    </div>

                                    <span class="truncate max-w-[160px] text-sm font-medium text-slate-700 dark:text-slate-200">{file.name}</span>

                                </div>

                                <div class="flex items-center gap-1">

                                    <button onclick={() => { const w = window.open(); if(w) { w.document.write('<iframe src="' + file.data + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'); } }} class="px-3 py-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors text-xs font-bold uppercase tracking-wider">

                                        Apri

                                    </button>

                                    <button onclick={() => removeAttachment(file.id)} class="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-full transition-colors">

                                        <Trash2 size={18} />

                                    </button>

                                </div>

                            </li>

                        {/each}

                    </ul>

                {:else}

                    <div class="text-sm text-slate-400 dark:text-slate-500 italic text-center py-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-[24px] border-2 border-dashed border-slate-200 dark:border-slate-700/50">

                        Nessun allegato

                    </div>

                {/if}

            </div>

        </div>



                <div class="p-6 pt-2 flex justify-end gap-3">



                    <button onclick={onClose} class="px-6 py-3 text-slate-600 dark:text-slate-300 hover:brightness-110 transition-all duration-200 font-semibold rounded-full text-sm">Annulla</button>



                    <button onclick={save} class="px-8 py-3 bg-indigo-600 dark:bg-indigo-300 text-white dark:text-indigo-950 font-bold rounded-full hover:brightness-110 transition-all duration-200 text-sm">Salva Spesa</button>



                </div>



            </div>



        </div>



        
