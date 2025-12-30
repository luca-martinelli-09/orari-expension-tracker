<script lang="ts">
    import type { Attachment } from '$lib/types';
    import { Upload, Trash2, FileText } from 'lucide-svelte';

    let {
        attachments = $bindable(),
        enablePaste = true,
        accept = '.pdf,image/*',
        label = 'Allegati',
        emptyText = 'Nessun allegato'
    } = $props<{
        attachments: Attachment[],
        enablePaste?: boolean,
        accept?: string,
        label?: string,
        emptyText?: string
    }>();

    function handleFile(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files) {
            Array.from(input.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    attachments.push({
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
        attachments = attachments.filter(a => a.id !== id);
    }

    function openAttachment(data: string) {
        const w = window.open();
        if (w) {
            const iframe = w.document.createElement('iframe');
            iframe.src = data;
            iframe.setAttribute('frameborder', '0');
            iframe.style.cssText = 'border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;';
            iframe.setAttribute('allowfullscreen', 'true');
            w.document.body.appendChild(iframe);
        }
    }

    function handlePaste(e: ClipboardEvent) {
        if (!enablePaste || !e.clipboardData) return;

        Array.from(e.clipboardData.items).forEach(item => {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        attachments.push({
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
</script>

<svelte:window onpaste={handlePaste} />

<div class="space-y-3">
    <div class="flex justify-between items-center">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1" for="file-upload">
            {label}
        </label>
        <label
            for="file-upload"
            class="cursor-pointer bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all"
        >
            <Upload size={14} />
            <span>Aggiungi</span>
            <input
                id="file-upload"
                type="file"
                multiple
                class="hidden"
                onchange={handleFile}
                {accept}
            />
        </label>
    </div>

    {#if attachments.length > 0}
        <ul class="space-y-2">
            {#each attachments as file}
                <li class="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl group transition-all hover:shadow-sm">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-slate-500 dark:text-slate-400">
                            <FileText size={18} />
                        </div>
                        <span class="truncate max-w-[160px] text-sm font-medium text-slate-700 dark:text-slate-200">
                            {file.name}
                        </span>
                    </div>
                    <div class="flex items-center gap-1">
                        <button
                            onclick={() => openAttachment(file.data)}
                            class="px-3 py-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors text-xs font-bold uppercase tracking-wider"
                        >
                            Apri
                        </button>
                        <button
                            onclick={() => removeAttachment(file.id)}
                            class="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-full transition-colors"
                            title="Elimina"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </li>
            {/each}
        </ul>
    {:else}
        <div class="text-sm text-slate-400 dark:text-slate-500 italic text-center py-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-[24px] border-2 border-dashed border-slate-200 dark:border-slate-700/50">
            {emptyText}
        </div>
    {/if}
</div>
