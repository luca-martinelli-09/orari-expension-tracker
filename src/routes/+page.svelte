<script lang="ts">
    import { store } from '$lib/store.svelte';
    import { fetchHolidays, calculateHours, formatDuration } from '$lib/utils';
    import { onMount } from 'svelte';
    import { startOfMonth, endOfMonth, eachDayOfInterval, format, isWeekend, startOfWeek, endOfWeek } from 'date-fns';
    import { it } from 'date-fns/locale';
    import { Download, Paperclip, Clock } from 'lucide-svelte';
    import { generateHoursPdf } from '$lib/pdf';
    import DayEditor from '$lib/components/DayEditor.svelte';
    import Badge from '$lib/components/ui/Badge.svelte';

    let selectedDay = $state<string | null>(null);

    function exportPdf() {
        generateHoursPdf(store.state.selectedMonth, store.state.selectedYear, store.state.days, store.state.holidays, store.state.userName);
    }

    onMount(async () => {
        const holidays = await fetchHolidays(store.state.selectedYear);
        const holidayMap: Record<string, string> = {};
        holidays.forEach((h: any) => holidayMap[h.date] = h.localName);
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

<div class="flex flex-col gap-6">
    <!-- Header with FAB-like Action -->
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-4xl font-normal text-slate-800 dark:text-slate-100 tracking-tight">Calendario</h2>
        </div>
        
        <button onclick={exportPdf} class="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-300 text-white dark:text-indigo-900 px-6 py-3 rounded-full hover:brightness-110 transition-all duration-200 font-medium">
            <Download size={20} />
            <span>Esporta PDF</span>
        </button>
    </div>

    <!-- Calendar Card -->
    <div class="bg-white dark:bg-[#1e1e24] rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800/50">
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 mb-4">
            {#each ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'] as day}
                <div class="text-center text-xs font-bold text-slate-400 dark:text-slate-500 py-2 tracking-widest">
                    {day}
                </div>
            {/each}
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-3 auto-rows-[minmax(110px,auto)]">
            {#each days as date}
                {@const isCurrentMonth = date.getMonth() === store.state.selectedMonth}
                {@const dayData = getDayData(date)}
                {@const holiday = getHolidayName(date)}
                {@const isWknd = isWeekend(date)}
                {@const hours = calculateHours(dayData)}
                {@const isToday = new Date().toDateString() === date.toDateString()}
                
                <button 
                    onclick={() => handleDayClick(date)}
                    class="relative p-3 rounded-[24px] text-left transition-all duration-200 group border border-transparent flex flex-col justify-between
                    {!isCurrentMonth ? 'opacity-30 grayscale hover:opacity-50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:scale-[1.02]'}
                    {selectedDay === format(date, 'yyyy-MM-dd') ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-md' : ''}
                    {isToday && isCurrentMonth ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'bg-slate-50/30 dark:bg-[#25252b]'}
                    "
                >
                    <!-- Date Header -->
                    <div class="flex justify-between items-center w-full">
                        <span class="text-xl font-semibold tracking-tight {isToday ? 'text-indigo-600 dark:text-indigo-400' : (isWknd || holiday ? 'text-rose-500 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200')}">
                            {format(date, 'd')}
                        </span>
                        {#if dayData.attachments.length > 0}
                             <div class="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full p-1.5">
                                <Paperclip size={12} strokeWidth={3} />
                            </div>
                        {/if}
                    </div>

                    <!-- Content Body -->
                    <div class="flex flex-col gap-1.5 mt-2">
                        {#if holiday}
                            <Badge variant="danger" size="sm" class="justify-center truncate">
                                {holiday}
                            </Badge>
                        {:else if dayData.type !== 'Lavoro'}
                            <Badge variant="primary" size="sm" class="justify-center truncate">
                                {dayData.type}
                            </Badge>
                        {:else if hours > 0}
                            <Badge variant="success" size="md" class="justify-center">
                                <Clock size={12} strokeWidth={2.5} />
                                {formatDuration(hours)}
                            </Badge>
                        {:else}
                             <!-- Spacer for alignment or empty state indicator if needed -->
                             <div class="h-6"></div>
                        {/if}
                    </div>
                </button>
            {/each}
        </div>
    </div>
</div>

{#if selectedDay}
    <DayEditor date={selectedDay} onClose={closeEditor} />
{/if}