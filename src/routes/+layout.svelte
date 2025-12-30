<script lang="ts">
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import { page } from '$app/stores';
    import { store } from '$lib/store.svelte';
    import { ChevronLeft, ChevronRight, Moon, Sun, Calendar } from 'lucide-svelte';
    import { format, addMonths, subMonths } from 'date-fns';
    import { it } from 'date-fns/locale';

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
    <!-- Add Inter font for better look -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<!-- Global Wrapper - Material You Tones -->
<div class="{store.state.theme} min-h-screen transition-colors duration-300 font-['Inter',sans-serif]">
    <div class="min-h-screen bg-[#fdfcff] dark:bg-[#1a1b1e] text-[#1a1b1e] dark:text-[#e3e2e6] flex flex-col transition-colors duration-300">
        
        <!-- Top App Bar (Material 3 Style - Center Aligned usually, but we keep left for web app utility) -->
        <nav class="bg-[#fdfcff]/90 dark:bg-[#1a1b1e]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-4 transition-colors duration-300">
            <div class="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                
                <!-- Left: Logo & Date Navigation (Grouped for MD3 feel) -->
                <div class="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
                    <div class="flex items-center gap-3">
                        <div class="bg-primary-container dark:bg-primary-container-dark text-on-primary-container dark:text-on-primary-container-dark p-3 rounded-2xl">
                            <Calendar size={24} class="text-indigo-600 dark:text-indigo-300" />
                        </div>
                        <h1 class="text-2xl font-medium tracking-tight text-slate-800 dark:text-slate-100 hidden sm:block">
                            Gestione Orari
                        </h1>
                    </div>

                    <!-- Date Picker Pill -->
                    <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 pl-2 pr-2 py-1">
                        <button onclick={prevMonth} class="p-2 hover:brightness-110 rounded-full text-slate-600 dark:text-slate-300 transition-all duration-200">
                            <ChevronLeft size={20} />
                        </button>
                        <span class="text-sm font-medium capitalize min-w-[140px] text-center text-slate-700 dark:text-slate-200">
                            {format(currentDate, 'MMMM yyyy', { locale: it })}
                        </span>
                        <button onclick={nextMonth} class="p-2 hover:brightness-110 rounded-full text-slate-600 dark:text-slate-300 transition-all duration-200">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <!-- Center/Right: Navigation Pills -->
                <div class="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                    {#each navItems as item}
                        <a 
                            href={item.href}
                            class="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 relative overflow-hidden
                            {$page.url.pathname === item.href 
                                ? 'bg-indigo-200 dark:bg-indigo-700 text-indigo-900 dark:text-indigo-100' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:brightness-110'}"
                        >
                            {item.label}
                        </a>
                    {/each}
                </div>

                <!-- Far Right: Theme -->
                <div class="hidden md:block">
                    <button 
                        onclick={() => store.toggleTheme()}
                        class="p-3 rounded-full border border-slate-200 dark:border-slate-700 hover:brightness-110 text-slate-600 dark:text-slate-300 transition-all duration-200"
                        aria-label="Toggle Theme"
                    >
                        {#if store.state.theme === 'light'}
                            <Moon size={22} />
                        {:else}
                            <Sun size={22} />
                        {/if}
                    </button>
                </div>
            </div>
        </nav>

        <main class="flex-1 p-4 md:p-8 container mx-auto max-w-[1600px] animate-in fade-in duration-500">
            {@render children()}
        </main>
    </div>
</div>
