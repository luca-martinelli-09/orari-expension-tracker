<script lang="ts">
    import type { Snippet } from 'svelte';
    import { X } from 'lucide-svelte';

    let {
        open = $bindable(),
        onClose,
        title,
        subtitle,
        children,
        footer
    } = $props<{
        open: boolean,
        onClose: () => void,
        title: string,
        subtitle?: string,
        children: Snippet,
        footer?: Snippet
    }>();

    function handleBackdropClick() {
        onClose();
    }

    function handleKeyUp(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            onClose();
        }
    }
</script>

<svelte:window onkeyup={handleKeyUp} />

{#if open}
    <!-- Backdrop -->
    <div
        class="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all"
        onclick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
    >
        <!-- Modal Container -->
        <div
            class="bg-[#f7f9ff] dark:bg-[#1c1b1f] rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
            onclick={(e) => e.stopPropagation()}
            role="document"
        >
            <!-- Header -->
            <div class="p-6 pb-2 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/50">
                <div>
                    <h3 class="font-medium text-2xl text-slate-900 dark:text-slate-100">{title}</h3>
                    {#if subtitle}
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
                    {/if}
                </div>
                <button
                    onclick={onClose}
                    class="p-3 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors"
                    aria-label="Chiudi"
                >
                    <X size={20} />
                </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-6 overflow-y-auto flex-1">
                {@render children()}
            </div>

            <!-- Footer -->
            {#if footer}
                <div class="p-6 pt-2 border-t border-slate-100 dark:border-slate-800/50 flex justify-end gap-3">
                    {@render footer()}
                </div>
            {/if}
        </div>
    </div>
{/if}
