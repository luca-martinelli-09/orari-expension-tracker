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
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="{store.state.theme} min-h-screen transition-colors duration-300 font-['Inter',sans-serif]"
>
	<div
		class="min-h-screen bg-md-background text-md-on-background flex flex-col transition-colors duration-300"
	>
		<nav
			class="bg-md-background/80 backdrop-blur-md sticky top-0 z-40 px-4 py-4 md:px-6 md:py-6 transition-colors duration-300"
		>
			<div
				class="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0"
			>
				<div
					class="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-start"
				>
					<div class="flex items-center gap-3 group">
						<div
							class="bg-md-primary text-md-on-primary p-2.5 rounded-full transition-transform duration-500 group-hover:rotate-12"
						>
							<Calendar size={24} strokeWidth={2.5} />
						</div>
						<h1 class="text-xl font-black tracking-tighter uppercase hidden sm:block">Journal</h1>
					</div>

					<div
						class="flex items-center bg-md-surface-variant rounded-full border border-md-outline/20 p-1"
					>
						<Button
							variant="icon"
							onclick={prevMonth}
							class="!p-1.5 border-none hover:bg-md-on-surface/5"
						>
							<ChevronLeft size={20} />
						</Button>
						<span
							class="text-[10px] md:text-xs font-black uppercase tracking-widest min-w-[120px] md:min-w-[140px] text-center"
						>
							{format(currentDate, 'MMMM yyyy', { locale: it })}
						</span>
						<Button
							variant="icon"
							onclick={nextMonth}
							class="!p-1.5 border-none hover:bg-md-on-surface/5"
						>
							<ChevronRight size={20} />
						</Button>
					</div>
				</div>

				<div
					class="flex items-center gap-1 md:gap-2 bg-md-surface-variant p-1 rounded-full border border-md-outline/10 w-auto overflow-x-auto no-scrollbar justify-center md:justify-start"
				>
					{#each navItems as item}
						<a
							href={item.href}
							class="px-4 py-2 md:px-6 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer whitespace-nowrap
					                            {$page.url.pathname === item.href
								? 'bg-md-primary text-md-on-primary shadow-lg shadow-md-primary/20'
								: 'text-md-on-surface-variant hover:bg-md-on-surface/10 hover:text-md-on-surface'}"
						>
							{item.label}
						</a>
					{/each}
				</div>

				<div class="hidden md:block">
					<Button
						variant="icon"
						onclick={() => store.toggleTheme()}
						class="border border-md-outline/20 hover:rotate-12 transition-transform"
					>
						{#if store.state.theme === 'light'}
							<Moon size={22} />
						{:else}
							<Sun size={22} />
						{/if}
					</Button>
				</div>
			</div>
		</nav>

		<main class="flex-1 p-4 md:p-8 container mx-auto max-w-[1600px] animate-in fade-in">
			{@render children()}
		</main>
	</div>
</div>
