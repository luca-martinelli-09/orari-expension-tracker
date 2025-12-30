<script lang="ts">
    import { store } from '$lib/store.svelte';
    import { Save, User, Lock, Calendar } from 'lucide-svelte';

    let saved = $state(false);

    function save() {
        store.updateCredentials(store.state.trenitaliaUser, store.state.trenitaliaPass);
        store.updateUserName(store.state.userName);
        saved = true;
        setTimeout(() => saved = false, 2000);
    }
</script>

<div class="max-w-2xl mx-auto flex flex-col gap-8">
    <div>
        <h2 class="text-4xl font-normal text-slate-800 dark:text-slate-100 tracking-tight">Impostazioni</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Configura le tue credenziali e preferenze.</p>
    </div>

    <!-- General Settings Card -->
    <div class="bg-white dark:bg-[#1e1e24] p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800/50 space-y-6">
        <div class="flex items-start gap-4">
            <div class="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-2xl text-blue-700 dark:text-blue-300">
                <User size={24} />
            </div>
            <div>
                <h3 class="text-xl font-medium text-slate-900 dark:text-white">Profilo Utente</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 text-sm mt-1">Queste informazioni appariranno nei PDF esportati.</p>
            </div>
        </div>

        <div class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2" for="username">Nome e Cognome</label>
                <input 
                    type="text" 
                    id="username" 
                    bind:value={store.state.userName}
                    class="w-full bg-slate-50 dark:bg-[#25252b] border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    placeholder="Mario Rossi"
                />
            </div>
        </div>
    </div>

    <!-- Trenitalia Card -->
    <div class="bg-white dark:bg-[#1e1e24] p-8 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800/50 space-y-6">
        <div class="flex items-start gap-4">
            <div class="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-2xl text-indigo-700 dark:text-indigo-300">
                <User size={24} />
            </div>
            <div>
                <h3 class="text-xl font-medium text-slate-900 dark:text-white">Account Trenitalia</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Per scaricare biglietti e prezzi automaticamente.</p>
            </div>
        </div>

        <div class="space-y-4">
            <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2" for="user">Username</label>
                <input 
                    type="text" 
                    id="user" 
                    bind:value={store.state.trenitaliaUser}
                    class="w-full bg-slate-50 dark:bg-[#25252b] border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    placeholder="Username"
                />
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2" for="pass">Password</label>
                <input 
                    type="password" 
                    id="pass" 
                    bind:value={store.state.trenitaliaPass}
                    class="w-full bg-slate-50 dark:bg-[#25252b] border-none rounded-2xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    placeholder="Password"
                />
            </div>
        </div>
    </div>

        <!-- Action Bar -->

        <div class="flex justify-end">

            <button onclick={save} class="bg-indigo-600 dark:bg-indigo-300 text-white dark:text-indigo-900 px-8 py-3 rounded-full font-medium hover:brightness-110 transition-all duration-200 flex items-center gap-2">

                {#if saved}

                    <span>Salvato!</span>

                {:else}

                    <Lock size={20} />

                    <span>Salva Impostazioni</span>

                {/if}

            </button>

        </div>

    </div>

    