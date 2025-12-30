<script lang="ts">
    import type { Snippet } from 'svelte';
    import { X } from 'lucide-svelte';

    type Variant = 'info' | 'warning' | 'success' | 'error';

    let {
        variant = 'info',
        dismissible = false,
        onDismiss,
        children,
        action
    } = $props<{
        variant?: Variant,
        dismissible?: boolean,
        onDismiss?: () => void,
        children: Snippet,
        action?: Snippet
    }>();

    let visible = $state(true);

    function handleDismiss() {
        visible = false;
        onDismiss?.();
    }

    const variantClasses = {
        info: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200',
        warning: 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100',
        success: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200',
        error: 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200'
    };
</script>

{#if visible}
    <div class="{variantClasses[variant]} px-6 py-4 rounded-[24px] font-medium flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
            {@render children()}
        </div>

        {#if action || dismissible}
            <div class="flex items-center gap-2">
                {#if action}
                    <div>
                        {@render action()}
                    </div>
                {/if}
                {#if dismissible}
                    <button
                        onclick={handleDismiss}
                        class="p-1 hover:opacity-70 transition-opacity"
                        aria-label="Chiudi"
                    >
                        <X size={18} />
                    </button>
                {/if}
            </div>
        {/if}
    </div>
{/if}
