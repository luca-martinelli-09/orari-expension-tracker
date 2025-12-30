<script lang="ts">
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import { page } from '$app/stores';
    import { store } from '$lib/store.svelte';
    import { ChevronLeft, ChevronRight, Moon, Sun, Calendar } from 'lucide-svelte';
    import { format, addMonths, subMonths } from 'date-fns';
    import { it } from 'date-fns/locale';
    import Button from '$lib/components/ui/Button.svelte';

    let { children } = $props();
    
    const navItems = [
        { href: '/', label: 'Orari' },
        { href: '/rimborsi', label: 'Rimborsi' },
        { href: '/impostazioni', label: 'Impostazioni' }
    ];

    let currentDate = $derived(new Date(store.state.selectedYear, store.state.selectedMonth, 1));

    function prevMonth() {
        const newDate = subMonths(currentDate, 1);
        store.setDate(newDate.getMonth(), newDate.getFullYear());
    }

    function nextMonth() {
        const newDate = addMonths(currentDate, 1);
        store.setDate(newDate.getMonth(), newDate.getFullYear());
    }
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="{store.state.theme} min-h-screen transition-colors duration-300 font-['Inter',sans-serif]">
    <div class="min-h-screen bg-md-background text-md-onBackground flex flex-col transition-colors duration-300">
        
        <nav class="bg-md-background/80 backdrop-blur-md sticky top-0 z-40 px-6 py-6 transition-colors duration-300">
            <div class="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                
                <div class="flex items-center gap-8 w-full md:w-auto justify-between md:justify-start">
                    <div class="flex items-center gap-3">
                        <div class="bg-md-primary text-md-onPrimary p-2.5 rounded-full">
                            <Calendar size={22} />
                        </div>
                        <h1 class="text-xl font-bold tracking-tighter uppercase hidden sm:block">
                            Journal
                        </h1>
                    </div>

                    <div class="flex items-center bg-md-surfaceVariant rounded-full border border-md-outline/20 p-1">
                        <Button variant="icon" onclick={prevMonth} class="!p-1.5">
                            <ChevronLeft size={18} />
                        </Button>
                        <span class="text-xs font-bold uppercase tracking-widest min-w-[140px] text-center">
                            {format(currentDate, 'MMMM yyyy', { locale: it })}
                        </span>
                        <Button variant="icon" onclick={nextMonth} class="!p-1.5">
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>

                <div class="flex items-center gap-2 bg-md-surfaceVariant p-1 rounded-full border border-md-outline/10">
                    {#each navItems as item}
                        <a 
                            href={item.href}
                            class="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200
                            {$page.url.pathname === item.href 
                                ? 'bg-md-primary text-md-onPrimary' 
                                : 'text-md-onSurfaceVariant hover:bg-md-outline/10'}"
                        >
                            {item.label}
                        </a>
                    {/each}
                </div>

                <div class="hidden md:block">
                    <Button variant="icon" onclick={() => store.toggleTheme()} class="border border-md-outline/20">
                        {#if store.state.theme === 'light'}
                            <Moon size={20} />
                        {:else}
                            <Sun size={20} />
                        {/if}
                    </Button>
                </div>
            </div>
        </nav>

        <main class="flex-1 p-4 md:p-8 container mx-auto max-w-[1600px] animate-in fade-in duration-700">
            {@render children()}
        </main>
    </div>
</div>