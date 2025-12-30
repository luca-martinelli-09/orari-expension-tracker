<script lang="ts">
	import { store } from '$lib/store.svelte';
	import { format } from 'date-fns';
	import ExpenseEditor from '$lib/components/ExpenseEditor.svelte';
	import { generateExpensesPdf } from '$lib/pdf';
	import { Download, Plus, RefreshCw, Trash2, Settings, CreditCard, Pencil } from 'lucide-svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Table from '$lib/components/ui/table/Table.svelte';
	import TableHead from '$lib/components/ui/table/TableHead.svelte';
	import TableRow from '$lib/components/ui/table/TableRow.svelte';
	import TableCell from '$lib/components/ui/table/TableCell.svelte';

	let showEditor = $state(false);
	let editingExpense = $state<any>(null);
	let loading = $state(false);
	let syncStatus = $state('');

	let sortedExpenses = $derived(
		store.state.expenses
			.filter((e) => {
				const d = new Date(e.date);
				return (
					d.getMonth() === store.state.selectedMonth && d.getFullYear() === store.state.selectedYear
				);
			})
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
	);
	let total = $derived(sortedExpenses.reduce((acc, e) => acc + e.amount, 0));

	function exportPdf() {
		generateExpensesPdf(
			store.state.selectedMonth,
			store.state.selectedYear,
			sortedExpenses,
			store.state.userName
		);
	}

	async function syncTrenitalia() {
		if (!store.state.trenitaliaUser || !store.state.trenitaliaPass) {
			alert('Configura Trenitalia nelle impostazioni.');
			return;
		}

		loading = true;
		syncStatus = 'SINCRONIZZAZIONE...';

		try {
			const loginRes = await fetch('/api/trenitalia/login', {
				method: 'POST',
				body: JSON.stringify({
					username: store.state.trenitaliaUser,
					password: store.state.trenitaliaPass
				})
			});
			const loginData = await loginRes.json();
			if (loginData.error) throw new Error(loginData.error);
			const token = loginData.access_token;

			const fromDateObj = new Date(store.state.selectedYear, store.state.selectedMonth, 1);
			const fromDate = format(fromDateObj, 'dd/MM/yyyy');
			const lastDay = new Date(store.state.selectedYear, store.state.selectedMonth + 1, 0);
			const toDate = format(lastDay, 'dd/MM/yyyy');

			const tripsRes = await fetch('/api/trenitalia/trips', {
				method: 'POST',
				body: JSON.stringify({ token, fromDate, toDate })
			});
			const tripsData = await tripsRes.json();

			if (!tripsData.solutions) throw new Error('ERRORE API');

			const relevantTrips = tripsData.solutions.filter((sol: any) => {
				const tripDate = new Date(sol.departureDate);
				return (
					tripDate.getMonth() === store.state.selectedMonth &&
					tripDate.getFullYear() === store.state.selectedYear &&
					!store.state.expenses.some((e) => e.id === sol.resourceId)
				);
			});

			if (relevantTrips.length === 0) {
				syncStatus = 'NESSUN VIAGGIO';
				loading = false;
				setTimeout(() => (syncStatus = ''), 2000);
				return;
			}

			syncStatus = `DOWNLOAD (${relevantTrips.length})...`;

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
					const amount =
						detailData.solutions?.[0]?.solutionContainer?.solutionSummary?.totalPrice?.amount || 0;

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
					syncStatus = `SINCRONIZZATI ${completed}/${relevantTrips.length}`;
				} catch (e) {
					console.error(e);
				}
			};

			for (let i = 0; i < relevantTrips.length; i += CONCURRENCY_LIMIT) {
				const chunk = relevantTrips.slice(i, i + CONCURRENCY_LIMIT).map(processTrip);
				await Promise.all(chunk);
			}

			syncStatus = 'COMPLETATO';
		} catch (e: any) {
			console.error(e);
			syncStatus = 'ERRORE';
		} finally {
			loading = false;
			setTimeout(() => (syncStatus = ''), 3000);
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
		if (confirm('Eliminare questa spesa?')) {
			store.removeExpense(id);
		}
	}
</script>

<div class="flex flex-col gap-8">
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h2 class="text-5xl font-black text-md-on-surface tracking-tighter uppercase">Rimborsi</h2>
			<p
				class="text-[10px] font-black uppercase tracking-[0.3em] text-md-on-surface-variant/60 mt-1"
			>
				Gestione Spese & Viaggi
			</p>
		</div>
		<div class="flex flex-wrap gap-3">
			<Button variant="primary" onclick={openNew}>
				<Plus size={20} strokeWidth={3} />
				<span>Aggiungi</span>
			</Button>
			<Button variant="secondary" onclick={syncTrenitalia} disabled={loading}>
				<RefreshCw size={20} class={loading ? 'animate-spin' : ''} strokeWidth={3} />
				<span>{loading ? syncStatus : 'Sync Trenitalia'}</span>
			</Button>
			<Button variant="secondary" onclick={exportPdf}>
				<Download size={20} strokeWidth={3} />
				<span>Esporta PDF</span>
			</Button>
		</div>
	</div>

	{#if !store.state.trenitaliaUser}
		<div
			class="border-2 border-md-on-surface p-6 flex items-center justify-between animate-in fade-in duration-300"
		>
			<div class="flex items-center gap-3">
				<Settings size={20} strokeWidth={3} />
				<span class="text-[10px] font-black uppercase tracking-widest"
					>Configura le credenziali nelle impostazioni per importare i viaggi.</span
				>
			</div>
			<a
				href="/impostazioni"
				class="text-[10px] font-black underline uppercase tracking-widest hover:bg-md-on-surface hover:text-md-surface px-4 py-2 transition-all"
				>Vai alle Impostazioni</a
			>
		</div>
	{/if}

	<Card class="border-2 border-md-on-surface shadow-none rounded-none overflow-hidden">
		<Table>
			<TableHead>
				<TableRow>
					<TableCell head class="uppercase tracking-widest text-[10px] font-black">Data</TableCell>
					<TableCell head class="uppercase tracking-widest text-[10px] font-black"
						>Descrizione</TableCell
					>
					<th
						class="p-5 font-black text-md-on-surface-variant text-[10px] uppercase tracking-widest hidden md:table-cell"
						>Categoria</th
					>
					<TableCell head align="right" class="uppercase tracking-widest text-[10px] font-black"
						>Importo</TableCell
					>
					<TableCell head align="right"></TableCell>
				</TableRow>
			</TableHead>
			<tbody class="divide-y divide-md-on-surface/10">
				{#each sortedExpenses as expense}
					<TableRow>
						<TableCell class="text-xs font-bold uppercase tracking-tight"
							>{format(new Date(expense.date), 'dd MMM')}</TableCell
						>
						<TableCell>
							<div class="font-black text-sm uppercase tracking-tight">{expense.description}</div>
							{#if expense.attachments.length}
								<div
									class="flex items-center gap-1 mt-1 text-[9px] font-black uppercase border-2 border-md-on-surface w-fit px-2 py-0.5 rounded-none opacity-60"
								>
									{expense.attachments.length} DOCS
								</div>
							{/if}
						</TableCell>
						<td class="p-5 hidden md:table-cell">
							<span
								class="text-[9px] font-black uppercase border border-md-on-surface/20 px-3 py-1 rounded-none opacity-60"
							>
								{expense.category || 'GENERICO'}
							</span>
						</td>
						<TableCell align="right" bold class="text-base tracking-tighter">
							€ {expense.amount.toFixed(2)}
						</TableCell>
						<TableCell align="right">
							<div
								class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all"
							>
								<Button
									variant="icon"
									onclick={() => edit(expense)}
									class="!p-1 hover:border-md-on-surface/20 border border-transparent"
								>
									<Pencil size={16} strokeWidth={3} />
								</Button>
								<Button
									variant="icon"
									onclick={() => remove(expense.id)}
									class="!p-1 hover:border-md-on-surface/20 border border-transparent text-md-error"
								>
									<Trash2 size={16} strokeWidth={3} />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				{/each}
				{#if sortedExpenses.length === 0}
					<tr>
						<td colspan="5" class="p-24 text-center opacity-20">
							<CreditCard size={64} strokeWidth={2} class="mx-auto mb-4" />
							<span class="text-xs font-black uppercase tracking-[0.3em]"
								>Nessuna spesa registrata</span
							>
						</td>
					</tr>
				{/if}
			</tbody>
		</Table>

		<div
			class="bg-md-primary text-md-on-primary p-8 flex justify-between items-center transition-colors border-t-2 border-md-primary"
		>
			<span class="text-xs font-black uppercase tracking-[0.4em]">Totale Mensile</span>
			<span class="text-5xl font-black tracking-tighter">€ {total.toFixed(2)}</span>
		</div>
	</Card>
</div>

{#if showEditor}
	<ExpenseEditor expense={editingExpense} onClose={() => (showEditor = false)} />
{/if}
