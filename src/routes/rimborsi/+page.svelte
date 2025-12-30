<script lang="ts">
    import { store } from '$lib/store.svelte';
    import { format } from 'date-fns';
    import ExpenseEditor from '$lib/components/ExpenseEditor.svelte';
    import { generateExpensesPdf } from '$lib/pdf';
    import { Download, Plus, RefreshCw, Trash2, FileText, Settings, CreditCard, Pencil } from 'lucide-svelte';
    import Alert from '$lib/components/ui/Alert.svelte';
    import Badge from '$lib/components/ui/Badge.svelte';

    let showEditor = $state(false);
    let editingExpense = $state<any>(null);
    let loading = $state(false);
    let syncStatus = $state('');

    async function syncTrenitalia() {
        if (!store.state.trenitaliaUser || !store.state.trenitaliaPass) {
            alert('Inserisci username e password Trenitalia nelle impostazioni.');
            return;
        }

        loading = true;
        syncStatus = 'Connessione...';

        try {
            const loginRes = await fetch('/api/trenitalia/login', {
                method: 'POST',
                body: JSON.stringify({ username: store.state.trenitaliaUser, password: store.state.trenitaliaPass })
            });
            const loginData = await loginRes.json();
            if (loginData.error) throw new Error(loginData.error);
            const token = loginData.access_token;

            syncStatus = 'Ricerca viaggi...';
            const fromDateObj = new Date(store.state.selectedYear, store.state.selectedMonth, 1);
            const fromDate = format(fromDateObj, 'dd/MM/yyyy');
            const lastDay = new Date(store.state.selectedYear, store.state.selectedMonth + 1, 0);
            const toDate = format(lastDay, 'dd/MM/yyyy');
            
            const tripsRes = await fetch('/api/trenitalia/trips', {
                 method: 'POST',
                 body: JSON.stringify({ token, fromDate, toDate })
            });
            const tripsData = await tripsRes.json();
            
            if (!tripsData.solutions) throw new Error('Errore API o nessun viaggio');

            const relevantTrips = tripsData.solutions.filter((sol: any) => {
                const tripDate = new Date(sol.departureDate);
                return (
                    tripDate.getMonth() === store.state.selectedMonth && 
                    tripDate.getFullYear() === store.state.selectedYear &&
                    !store.state.expenses.some(e => e.id === sol.resourceId)
                );
            });

            if (relevantTrips.length === 0) {
                syncStatus = 'Nessun nuovo viaggio.';
                loading = false;
                setTimeout(() => syncStatus = '', 3000);
                return;
            }

            syncStatus = `Download di ${relevantTrips.length} viaggi...`;

            const CONCURRENCY_LIMIT = 5;
            let completed = 0;

            const processTrip = async (sol: any) => {
                try {
                    const tripDate = new Date(sol.departureDate);
                    
                    const detailRes = await fetch('/api/trenitalia/detail', {
                        method: 'POST',
                        body: JSON.stringify({ token, resourceId: sol.resourceId })
                    });
                    const detailData = await detailRes.json();
                    const amount = detailData.solutions?.[0]?.solutionContainer?.solutionSummary?.totalPrice?.amount || 0;

                    let attachments = [];
                    if (sol.downloadPdf) {
                        const pdfUrl = `https://www.lefrecce.it/Channels.Website.BFF.WEB/website/post/purchase/pdf?resourceId=${sol.resourceId}`;
                        const pdfRes = await fetch('/api/trenitalia/pdf', {
                            method: 'POST',
                            body: JSON.stringify({ token, resourceUrl: pdfUrl })
                        });
                        const pdfData = await pdfRes.json();
                        if (pdfData.data) {
                            attachments.push({
                                id: crypto.randomUUID(),
                                name: `Biglietto_${format(tripDate, 'yyyyMMdd_HHmm')}.pdf`,
                                type: 'application/pdf',
                                data: pdfData.data
                            });
                        }
                    }

                    store.addExpense({
                        id: sol.resourceId,
                        date: format(tripDate, 'yyyy-MM-dd'),
                        description: sol.description,
                        amount: amount,
                        currency: 'EUR',
                        type: 'Trenitalia',
                        category: 'Viaggi aerei, ferroviari',
                        attachments
                    });
                    
                    completed++;
                    syncStatus = `${completed}/${relevantTrips.length} scaricati...`;
                } catch (e) {
                    console.error(`Error processing trip`, e);
                }
            };

            const chunks = [];
            for (let i = 0; i < relevantTrips.length; i += CONCURRENCY_LIMIT) {
                const chunk = relevantTrips.slice(i, i + CONCURRENCY_LIMIT).map(processTrip);
                await Promise.all(chunk);
            }

            syncStatus = `Sincronizzazione completata!`;
        } catch (e: any) {
            syncStatus = 'Errore: ' + e.message;
        } finally {
            loading = false;
            setTimeout(() => syncStatus = '', 3000);
        }
    }

    function openNew() {
        editingExpense = null;
        showEditor = true;
    }

    function edit(e: any) {
        editingExpense = e;
        showEditor = true;
    }

    function remove(id: string) {
        if(confirm('Eliminare questa spesa?')) {
            store.removeExpense(id);
        }
    }

    let sortedExpenses = $derived([...store.state.expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    let total = $derived(sortedExpenses.reduce((acc, e) => acc + e.amount, 0));

    function exportPdf() {
        generateExpensesPdf(store.state.selectedMonth, store.state.selectedYear, sortedExpenses, store.state.userName);
    }
</script>

<div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-4xl font-normal text-slate-800 dark:text-slate-100 tracking-tight">Rimborsi</h2>
        </div>
        <div class="flex gap-3">
            <button onclick={openNew} class="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-300 text-white dark:text-indigo-900 px-5 py-3 rounded-full hover:brightness-110 transition-all duration-200 font-medium">
                <Plus size={20} />
                <span class="hidden sm:inline">Nuova</span>
            </button>
            <button onclick={syncTrenitalia} disabled={loading} class="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-5 py-3 rounded-full hover:brightness-105 transition-all duration-200 font-medium disabled:opacity-50">
                <RefreshCw size={20} class={loading ? 'animate-spin' : ''} />
                <span class="hidden sm:inline">{loading ? 'Sync...' : 'Trenitalia'}</span>
            </button>
            <button onclick={exportPdf} class="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-5 py-3 rounded-full hover:brightness-105 transition-all duration-200 font-medium">
                <Download size={20} />
                <span class="hidden sm:inline">PDF</span>
            </button>
        </div>
    </div>

    <!-- Alert for credentials -->
    {#if !store.state.trenitaliaUser}
        <Alert variant="warning">
            {#snippet children()}
                <Settings size={20} />
                <span>Configura Trenitalia per scaricare i viaggi.</span>
            {/snippet}
            {#snippet action()}
                <a href="/impostazioni" class="bg-amber-200 dark:bg-amber-800/60 px-5 py-2 rounded-full text-sm font-semibold hover:brightness-110 transition-all duration-200">
                    Vai a Impostazioni
                </a>
            {/snippet}
        </Alert>
    {/if}

    {#if syncStatus}
        <Alert variant="info">
            {#snippet children()}
                <RefreshCw size={20} class="animate-spin" />
                <span>{syncStatus}</span>
            {/snippet}
        </Alert>
    {/if}

    <div class="bg-white dark:bg-[#1e1e24] rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800/50">
        <table class="w-full text-left">
            <thead class="bg-slate-50/50 dark:bg-[#25252b] border-b border-slate-100 dark:border-slate-800/50">
                <tr>
                    <th class="p-5 font-semibold text-slate-500 dark:text-slate-400 text-sm">Data</th>
                    <th class="p-5 font-semibold text-slate-500 dark:text-slate-400 text-sm">Descrizione</th>
                    <th class="p-5 font-semibold text-slate-500 dark:text-slate-400 text-sm hidden md:table-cell">Categoria</th>
                    <th class="p-5 font-semibold text-slate-500 dark:text-slate-400 text-sm text-right">Importo</th>
                    <th class="p-5 font-semibold text-slate-500 dark:text-slate-400 text-sm text-right"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                {#each sortedExpenses as expense}
                    <tr class="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td class="p-5 text-slate-700 dark:text-slate-300">{format(new Date(expense.date), 'dd MMM')}</td>
                        <td class="p-5">
                            <div class="font-medium text-slate-900 dark:text-white">{expense.description}</div>
                            <div class="md:hidden text-xs text-slate-500 mt-1">{expense.category}</div>
                            {#if expense.attachments.length}
                                <div class="flex items-center gap-1 mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                                    <FileText size={12} /> {expense.attachments.length} allegati
                                </div>
                            {/if}
                        </td>
                        <td class="p-5 hidden md:table-cell">
                            <Badge variant="info" size="sm">
                                {expense.category || 'Generico'}
                            </Badge>
                        </td>
                        <td class="p-5 text-right font-medium text-slate-900 dark:text-white">
                            € {expense.amount.toFixed(2)}
                        </td>
                        <td class="p-5 text-right">
                            <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onclick={() => edit(expense)} class="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full transition-colors">
                                    <Pencil size={18} />
                                </button>
                                <button onclick={() => remove(expense.id)} class="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
                {#if store.state.expenses.length === 0}
                    <tr>
                        <td colspan="5" class="p-16 text-center">
                            <div class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                <CreditCard size={64} strokeWidth={1} class="mb-4 opacity-50" />
                                <span class="text-lg font-medium">Nessuna spesa</span>
                            </div>
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
        
        <!-- Total Footer -->
        <div class="bg-slate-50 dark:bg-[#25252b] p-6 flex justify-between items-center border-t border-slate-100 dark:border-slate-800/50">
            <span class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Totale Mese</span>
            <span class="text-2xl font-bold text-slate-900 dark:text-white">€ {total.toFixed(2)}</span>
        </div>
    </div>
</div>

{#if showEditor}
    <ExpenseEditor expense={editingExpense} onClose={() => showEditor = false} />
{/if}
