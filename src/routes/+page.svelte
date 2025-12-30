<script lang="ts">
    import { store } from '$lib/store.svelte';
    import { fetchHolidays, calculateHours, formatDuration } from '$lib/utils';
    import { onMount } from 'svelte';
    import { startOfMonth, endOfMonth, eachDayOfInterval, format, isWeekend, startOfWeek, endOfWeek } from 'date-fns';
    import { it } from 'date-fns/locale';
    import { Download, Paperclip, Clock } from 'lucide-svelte';
    import { generateHoursPdf } from '$lib/pdf';
    import DayEditor from '$lib/components/DayEditor.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Card from '$lib/components/ui/Card.svelte';

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

<div class="flex flex-col gap-8">
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-5xl font-black text-md-onSurface tracking-tighter uppercase">Calendario</h2>
            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-md-onSurfaceVariant/60 mt-1">Registrazione Ore & Permessi</p>
        </div>
        
        <Button variant="primary" onclick={exportPdf}>
            <Download size={20} strokeWidth={3} />
            <span class="uppercase tracking-widest text-xs font-bold">Esporta PDF</span>
        </Button>
    </div>

    <Card class="p-8 border-2 border-md-onSurface shadow-none rounded-none">
        <div class="grid grid-cols-7 mb-8 border-b-2 border-md-onSurface/5">
            {#each ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'] as day}
                <div class="text-center text-[10px] font-black text-md-onSurfaceVariant py-4 tracking-[0.2em]">
                    {day}
                </div>
            {/each}
        </div>

        <div class="grid grid-cols-7 gap-2">
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
                    class="relative p-4 text-left transition-all duration-300 group flex flex-col justify-between aspect-square border-2
                    {!isCurrentMonth ? 'opacity-20 grayscale border-md-onSurface/5' : 'hover:bg-md-onSurface hover:text-md-surface border-md-onSurface/10'}
                    {selectedDay === format(date, 'yyyy-MM-dd') ? 'bg-md-onSurface text-md-surface z-10 scale-105 shadow-2xl border-md-onSurface' : (isNonWork && isCurrentMonth ? 'bg-md-onSurface/5' : 'bg-md-background')}
                    {isToday && isCurrentMonth ? 'ring-2 ring-inset ring-md-onSurface' : ''}
                    "
                >
                    <div class="flex justify-between items-start w-full">
                        <span class="text-2xl font-black tracking-tighter {isToday ? 'underline underline-offset-4 decoration-4' : ''}">
                            {format(date, 'd')}
                        </span>
                        {#if dayData.attachments.length > 0}
                             <div class="border border-current rounded-full p-1">
                                <Paperclip size={10} strokeWidth={3} />
                            </div>
                        {/if}
                    </div>

                    <div class="flex flex-col gap-1 mt-2">
                        {#if holiday}
                            <div class="text-[9px] font-black uppercase tracking-tight truncate border-t border-current pt-1 italic">
                                {holiday}
                            </div>
                        {:else if dayData.type !== 'Lavoro'}
                            <div class="text-[9px] font-black uppercase tracking-tight truncate border-t border-current pt-1">
                                {dayData.type}
                            </div>
                        {:else if hours > 0}
                            <div class="text-[10px] font-black flex items-center gap-1">
                                <Clock size={10} strokeWidth={3} />
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
