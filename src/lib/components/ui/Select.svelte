<script lang="ts">
    import { ChevronDown } from "lucide-svelte";
    import { portal } from "$lib/actions/portal";

    let { 
        value = $bindable(), 
        label, 
        options = [], 
        class: className = '' 
    } = $props<{ 
        value: string, 
        label?: string, 
        options: string[], 
        class?: string 
    }>();

    let open = $state(false);
    let triggerEl = $state<HTMLButtonElement | null>(null);
    let menuPos = $state({ top: 0, left: 0, width: 0 });

    function updatePosition() {
        if (open && triggerEl) {
            const rect = triggerEl.getBoundingClientRect();
            menuPos = {
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            };
        }
    }

    function toggleMenu() {
        open = !open;
        if (open) {
            setTimeout(updatePosition, 0);
        }
    }

    function selectOption(opt: string) {
        value = opt;
        open = false;
    }

    $effect(() => {
        if (open) {
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    });
</script>

<div class="{className} space-y-2 relative">
    {#if label}
        <span class="block text-[10px] font-black uppercase tracking-[0.2em] text-md-onSurface/40 ml-1">
            {label}
        </span>
    {/if}

    <button 
        type="button"
        bind:this={triggerEl}
        onclick={toggleMenu}
        class="flex h-14 w-full items-center justify-between border-2 border-md-onSurface bg-md-background px-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-md-onSurface/10 transition-all active:scale-[0.98]"
    >
        {value || "Seleziona..."}
        <ChevronDown size={18} class="opacity-50 transition-transform {open ? 'rotate-180' : ''}" />
    </button>

    {#if open}
        <div use:portal>
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
                class="fixed inset-0 z-[100]" 
                onclick={() => open = false}
            ></div>
            
            <div 
                class="fixed z-[110] border-2 border-md-onSurface bg-md-background p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                style="top: {menuPos.top}px; left: {menuPos.left}px; width: {menuPos.width}px;"
            >
                <div class="max-h-60 overflow-y-auto custom-scrollbar">
                    {#each options as opt}
                        <button
                            type="button"
                            onclick={() => selectOption(opt)}
                            class="flex w-full items-center px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-md-onSurface hover:text-md-surface transition-colors {value === opt ? 'bg-md-onSurface text-md-surface' : ''}"
                        >
                            {opt}
                        </button>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>