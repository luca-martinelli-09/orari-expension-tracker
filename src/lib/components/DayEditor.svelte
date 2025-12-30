<script lang="ts">
    import { store } from '$lib/store.svelte';
    import type { DayType, WorkDay } from '$lib/types';
    import { X, Trash2, Upload, FileText, Clock } from 'lucide-svelte';
    import { slide } from 'svelte/transition';
    import { untrack } from 'svelte';

    let { date, onClose } = $props<{ date: string, onClose: () => void }>();

    // Create a local copy for editing
    // We use untrack to explicitely tell Svelte we only want the initial value
    let day = $state<WorkDay>(untrack(() => structuredClone($state.snapshot(store.getDay(date)))));
    
    const types: DayType[] = ['Lavoro', 'Ferie', 'Malattia', 'Permesso', 'Chiusura', 'Festivo', 'Sabato', 'Domenica'];

    function save() {
        store.updateDay(date, day);
        onClose();
    }

    function handleFile(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files) {
            Array.from(input.files).forEach(file => {
                 const reader = new FileReader();
                 reader.onload = (e) => {
                     day.attachments.push({
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
        day.attachments = day.attachments.filter(a => a.id !== id);
    }

    function handlePaste(e: ClipboardEvent) {
        if (e.clipboardData && e.clipboardData.items) {
            Array.from(e.clipboardData.items).forEach(item => {
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            day.attachments.push({
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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all" onclick={onClose} role="dialog" tabindex="-1" onkeyup={(e) => e.key === 'Escape' && onClose()}>
    <div class="bg-[#f7f9ff] dark:bg-[#1c1b1f] rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200" onclick={e => e.stopPropagation()} role="document">
        
        <!-- Header -->
        <div class="p-6 pb-2 flex justify-between items-center">
            <div>
                <h3 class="font-medium text-2xl text-slate-900 dark:text-slate-100">Modifica Giorno</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{date}</p>
            </div>
            <button onclick={onClose} class="p-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors">
                <X size={20} />
            </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6 overflow-y-auto">
            
            <!-- Type Selector -->
            <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1" for="type-select">Stato giornata</label>
                <select 
                    id="type-select"
                    bind:value={day.type}
                    class="w-full rounded-2xl border-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 p-4 transition-colors appearance-none"
                >
                    {#each types as t}
                        <option value={t}>{t}</option>
                    {/each}
                </select>
            </div>

            <!-- Hours (If Lavoro) -->
            {#if day.type === 'Lavoro'}
                <div transition:slide class="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700/50">
                    <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                        <Clock size={18} />
                        <span class="text-sm font-semibold tracking-wide">Orari di lavoro</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1" for="m-start">Inizio Mattina</label>
                            <input id="m-start" type="time" bind:value={day.morningStart} class="block w-full rounded-xl border-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 p-3 transition-all">
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1" for="m-end">Fine Mattina</label>
                            <input id="m-end" type="time" bind:value={day.morningEnd} class="block w-full rounded-xl border-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 p-3 transition-all">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1" for="a-start">Inizio Pomeriggio</label>
                            <input id="a-start" type="time" bind:value={day.afternoonStart} class="block w-full rounded-xl border-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 p-3 transition-all">
                        </div>
                        <div class="space-y-1">
                            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1" for="a-end">Fine Pomeriggio</label>
                            <input id="a-end" type="time" bind:value={day.afternoonEnd} class="block w-full rounded-xl border-none bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 p-3 transition-all">
                        </div>
                    </div>
                </div>
            {/if}

            <!-- Attachments -->
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1" for="file-upload-day">Allegati</label>
                    <label for="file-upload-day" class="cursor-pointer bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all">
                        <Upload size={14} />
                        <span>Aggiungi</span>
                        <input id="file-upload-day" type="file" multiple class="hidden" onchange={handleFile} accept=".pdf,image/*">
                    </label>
                </div>
                
                {#if day.attachments.length > 0}
                    <ul class="space-y-2">
                        {#each day.attachments as file}
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
                                    <button onclick={() => removeAttachment(file.id)} class="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-full transition-colors" title="Elimina">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <div class="text-sm text-slate-400 dark:text-slate-500 italic text-center py-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-[24px] border-2 border-dashed border-slate-200 dark:border-slate-700/50">
                        Trascina o carica file qui
                    </div>
                {/if}
            </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-6 pt-2 flex justify-end gap-3">
            <button onclick={onClose} class="px-6 py-3 text-slate-600 dark:text-slate-300 hover:brightness-110 transition-all duration-200 font-semibold rounded-full text-sm">Annulla</button>
            <button onclick={save} class="px-8 py-3 bg-indigo-600 dark:bg-indigo-300 text-white dark:text-indigo-950 font-bold rounded-full hover:brightness-110 transition-all duration-200 text-sm">Salva</button>
        </div>
    </div>
</div>




        
