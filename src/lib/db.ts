import { openDB, type DBSchema } from 'idb';
import type { AppState, WorkDay, Expense } from './types';

interface OrariDB extends DBSchema {
    kv: {
        key: string;
        value: any;
    };
    days: {
        key: string;
        value: WorkDay;
    };
    expenses: {
        key: string;
        value: Expense;
    };
}

const DB_NAME = 'orari-app-db';
const DB_VERSION = 1;

export async function initDB() {
    return openDB<OrariDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            db.createObjectStore('kv');
            db.createObjectStore('days', { keyPath: 'date' });
            db.createObjectStore('expenses', { keyPath: 'id' });
        },
    });
}

export async function saveState(state: AppState) {
    const db = await initDB();
    const tx = db.transaction(['kv', 'days', 'expenses'], 'readwrite');
    
    // Save settings
    await tx.objectStore('kv').put(state.selectedMonth, 'selectedMonth');
    await tx.objectStore('kv').put(state.selectedYear, 'selectedYear');
    await tx.objectStore('kv').put(state.theme, 'theme');
    await tx.objectStore('kv').put(state.trenitaliaUser, 'trenitaliaUser');
    await tx.objectStore('kv').put(state.trenitaliaPass, 'trenitaliaPass');
    await tx.objectStore('kv').put(state.holidays, 'holidays');

    // Save Days (only dirty ones ideally, but for now all)
    // To optimize, we could only save changed ones, but the store reactivity makes it hard to track diffs without complexity.
    // Given the request, we will save what is in memory.
    // IMPORTANT: Clear old data? Or just upsert?
    // Upsert is safer.
    
    for (const day of Object.values(state.days)) {
        await tx.objectStore('days').put(JSON.parse(JSON.stringify(day))); // Clone to be safe
    }

    // Save Expenses
    // We should probably handle deletions too.
    // For now, let's put all current expenses.
    // If an expense was removed in memory, it won't be removed from IDB here unless we clear.
    // A better approach for sync is:
    // 1. Load from IDB to Memory on start.
    // 2. On specific actions (add/remove/update), perform specific IDB ops.
    // 3. Or, full sync: Clear store and write all (slow for files).
    
    // Let's implement specific methods in the store instead of a global saveState function.
    // But for "Impostazioni" (kv), global save is fine.
    
    await tx.done;
}

export async function loadState(): Promise<Partial<AppState>> {
    const db = await initDB();
    
    const selectedMonth = await db.get('kv', 'selectedMonth');
    const selectedYear = await db.get('kv', 'selectedYear');
    const theme = await db.get('kv', 'theme');
    const trenitaliaUser = await db.get('kv', 'trenitaliaUser');
    const trenitaliaPass = await db.get('kv', 'trenitaliaPass');
    const userName = await db.get('kv', 'userName');
    const holidays = await db.get('kv', 'holidays');

    const daysList = await db.getAll('days');
    const days: Record<string, WorkDay> = {};
    daysList.forEach(d => days[d.date] = d);

    const expenses = await db.getAll('expenses');

    return {
        selectedMonth: selectedMonth ?? new Date().getMonth(),
        selectedYear: selectedYear ?? new Date().getFullYear(),
        theme: theme ?? 'light',
        trenitaliaUser: trenitaliaUser ?? '',
        trenitaliaPass: trenitaliaPass ?? '',
        userName: userName ?? 'Luca Martinelli',
        holidays: holidays ?? {},
        days,
        expenses
    };
}

export async function dbPutDay(day: WorkDay) {
    const db = await initDB();
    await db.put('days', JSON.parse(JSON.stringify(day)));
}

export async function dbPutExpense(expense: Expense) {
    const db = await initDB();
    await db.put('expenses', JSON.parse(JSON.stringify(expense)));
}

export async function dbDeleteExpense(id: string) {
    const db = await initDB();
    await db.delete('expenses', id);
}

export async function dbPutSettings(key: string, value: any) {
    const db = await initDB();
    await db.put('kv', value, key);
}
