<script lang="ts">
	import { store } from '$lib/store.svelte';
	import { fetchHolidays, calculateHours, formatDuration } from '$lib/utils';
	import { onMount } from 'svelte';
	import {
		startOfMonth,
		endOfMonth,
		eachDayOfInterval,
		format,
		isWeekend,
		startOfWeek,
		endOfWeek
	} from 'date-fns';
	import { Download, Paperclip, Clock } from 'lucide-svelte';
	import { generateHoursPdf } from '$lib/pdf';
	import DayEditor from '$lib/components/DayEditor.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let selectedDay = $state<string | null>(null);

	function exportPdf() {
		generateHoursPdf(
			store.state.selectedMonth,
			store.state.selectedYear,
			store.state.days,
			store.state.holidays,
			store.state.userName
		);
	}

	onMount(async () => {
		const holidays = await fetchHolidays(store.state.selectedYear);
		const holidayMap: Record<string, string> = {};
		holidays.forEach((h: any) => (holidayMap[h.date] = h.localName));
		store.setHolidays(holidayMap);
	});

	let currentMonthDate = $derived(new Date(store.state.selectedYear, store.state.selectedMonth, 1));

	let days = $derived.by(() => {
		const start = startOfWeek(startOfMonth(currentMonthDate), { weekStartsOn: 1 });
		const end = endOfWeek(endOfMonth(currentMonthDate), { weekStartsOn: 1 });
		return eachDayOfInterval({ start, end });
	});

	function handleDayClick(date: Date) {
		selectedDay = format(date, 'yyyy-MM-dd');
	}

	function closeEditor() {
		selectedDay = null;
	}

	function getDayData(date: Date) {
		const dateStr = format(date, 'yyyy-MM-dd');
		return store.getDay(dateStr);
	}

	function getHolidayName(date: Date) {
		const dateStr = format(date, 'yyyy-MM-dd');
		return store.state.holidays[dateStr];
	}
</script>

<svelte:head>
	<title>Calendario | Journal</title>
</svelte:head>

<div class="flex flex-col gap-8">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-3xl md:text-5xl font-black text-md-on-surface tracking-tighter uppercase">
				Calendario
			</h2>

			<p
				class="text-[10px] font-black uppercase tracking-[0.3em] text-md-on-surface-variant/60 mt-1"
			>
				Registrazione Ore & Permessi
			</p>
		</div>

		<Button variant="primary" onclick={exportPdf}>
			<Download size={22} strokeWidth={2.5} />

			<span class="hidden md:inline">Esporta PDF</span>
		</Button>
	</div>

	<Card
		class="p-4 md:p-8 border-md-on-surface shadow-none rounded-none transition-colors duration-300"
	>
		<div class="grid grid-cols-7 mb-4 md:mb-8 border-b-2 border-md-on-surface/5">
			{#each ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'] as day}
				<div
					class="text-center text-[8px] md:text-[10px] font-black text-md-on-surface-variant py-2 md:py-4 tracking-[0.2em]"
				>
					{day.slice(0, 3)}
				</div>
			{/each}
		</div>

		<div class="grid grid-cols-7 gap-1 md:gap-2">
			{#each days as date}
				{@const isCurrentMonth = date.getMonth() === store.state.selectedMonth}

				{@const dayData = getDayData(date)}

				{@const holiday = getHolidayName(date)}

				{@const isWknd = isWeekend(date)}

				{@const hours = calculateHours(dayData)}

				{@const isToday = new Date().toDateString() === date.toDateString()}

				{@const isNonWork = holiday || isWknd || dayData.type !== 'Lavoro'}

				<button
					onclick={() => handleDayClick(date)}
					class="relative p-1 md:p-4 text-left transition-all duration-300 group flex flex-col justify-between aspect-square border-2 cursor-pointer
                    {!isCurrentMonth
						? 'opacity-20 grayscale border-md-on-surface/5'
						: 'hover:bg-md-on-surface/10 border-md-on-surface/10 hover:border-md-on-surface hover:z-10'}

                    {selectedDay === format(date, 'yyyy-MM-dd')
						? 'border-md-on-surface bg-md-on-surface/10 ring-4 ring-md-on-surface/5 z-10'
						: isNonWork && isCurrentMonth
							? 'bg-md-on-surface/5'
							: 'bg-md-background'}

                    "
				>
					<div class="flex justify-between items-start w-full">
						<span
							class="text-sm md:text-2xl font-black tracking-tighter {isToday
								? 'underline underline-offset-4 decoration-4'
								: selectedDay === format(date, 'yyyy-MM-dd')
									? 'text-md-on-surface'
									: isNonWork
										? 'text-md-on-surface-variant'
										: 'text-md-on-surface'}"
						>
							{format(date, 'd')}
						</span>

						{#if dayData.attachments.length > 0}
							<div
								class="border border-current rounded-full p-0.5 md:p-1 opacity-50 group-hover:opacity-100 transition-all"
							>
								<Paperclip size={10} class="md:w-3 md:h-3" strokeWidth={2.5} />
							</div>
						{/if}
					</div>

					<div class="flex flex-col gap-0.5 md:gap-1 mt-1 md:mt-2">
						{#if holiday}
							<div
								class="text-[7px] md:text-[9px] font-black uppercase tracking-tight truncate opacity-60"
							>
								{holiday}
							</div>
						{:else if dayData.type !== 'Lavoro'}
							<div
								class="text-[7px] md:text-[9px] font-black uppercase tracking-tight truncate border-t border-md-on-surface/10 pt-0.5 md:pt-1 opacity-60"
							>
								{dayData.type}
							</div>
						{:else if hours > 0}
							<div class="text-[8px] md:text-[10px] font-black flex items-center gap-0.5 md:gap-1">
								<Clock size={10} class="md:w-3 md:h-3" strokeWidth={2.5} />

								{formatDuration(hours)}
							</div>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</Card>
</div>

{#if selectedDay}
	<DayEditor date={selectedDay} onClose={closeEditor} />
{/if}
