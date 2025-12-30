<script lang="ts">
    import { store } from '$lib/store.svelte';
    import { Save, User, Lock, CheckCircle2 } from 'lucide-svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Card from '$lib/components/ui/Card.svelte';
    import Input from '$lib/components/ui/Input.svelte';

    let saved = $state(false);

    function save() {
        store.updateCredentials(store.state.trenitaliaUser, store.state.trenitaliaPass);
        store.updateUserName(store.state.userName);
        saved = true;
        setTimeout(() => saved = false, 2000);
    }
</script>

<div class="max-w-2xl mx-auto flex flex-col gap-12">
    <div class="flex flex-col gap-2">
        <h2 class="text-5xl font-black text-md-onSurface tracking-tighter uppercase">Impostazioni</h2>
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-md-onSurfaceVariant/60">Configurazione Profilo & Credenziali</p>
    </div>

    <div class="space-y-12">
        <!-- User Profile Section -->
        <section class="space-y-6">
            <div class="flex items-center gap-4 border-b-2 border-md-onSurface/5 pb-4">
                <div class="bg-md-onSurface text-md-surface p-2 rounded-full">
                    <User size={20} strokeWidth={3} />
                </div>
                <h3 class="text-xl font-black uppercase tracking-tight text-md-onSurface">Profilo Utente</h3>
            </div>

            <Card class="p-8">
                <Input 
                    label="Nome e Cognome" 
                    placeholder="Mario Rossi" 
                    bind:value={store.state.userName} 
                />
                <p class="text-[9px] font-bold uppercase tracking-widest text-md-onSurface/40 mt-4 ml-1">
                    * Apparirà nell'intestazione e nelle firme dei PDF.
                </p>
            </Card>
        </section>

        <!-- Trenitalia Credentials Section -->
        <section class="space-y-6">
            <div class="flex items-center gap-4 border-b-2 border-md-onSurface/5 pb-4">
                <div class="bg-md-onSurface text-md-surface p-2 rounded-full">
                    <Lock size={20} strokeWidth={3} />
                </div>
                <h3 class="text-xl font-black uppercase tracking-tight text-md-onSurface">Trenitalia</h3>
            </div>

            <Card class="p-8 space-y-6">
                <div class="grid grid-cols-1 gap-6">
                    <Input label="Username" placeholder="Il tuo username" bind:value={store.state.trenitaliaUser} />
                    <Input label="Password" type="password" placeholder="••••••••" bind:value={store.state.trenitaliaPass} />
                </div>

                <div class="p-4 border-2 border-md-onSurface/10 bg-md-surfaceVariant/5 text-[10px] font-bold uppercase tracking-widest text-md-onSurface/60 leading-relaxed">
                    Le credenziali sono salvate localmente (IndexedDB). Non vengono mai trasmesse a terzi.
                </div>
            </Card>
        </section>
    </div>

    <!-- Action Bar -->
    <div class="flex items-center justify-end gap-6 pt-4 border-t-2 border-md-onSurface/5">
        {#if saved}
            <div class="flex items-center gap-2 text-md-onSurface text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4 duration-300">
                <CheckCircle2 size={16} strokeWidth={3} />
                <span>Salvato</span>
            </div>
        {/if}
        
        <Button variant="primary" onclick={save} class="px-12 py-4 text-xs tracking-[0.2em] uppercase font-black">
            <Save size={18} strokeWidth={3} />
            <span>Salva</span>
        </Button>
    </div>
</div>
