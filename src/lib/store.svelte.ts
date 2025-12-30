import type { AppState, WorkDay, Expense, DayType } from './types';
import { loadState, dbPutDay, dbPutExpense, dbDeleteExpense, dbPutSettings } from './db';
import { browser } from '$app/environment';

class Store {
    state = $state<AppState>({
        selectedMonth: new Date().getMonth(),
        selectedYear: new Date().getFullYear(),
        days: {},
        expenses: [],
        holidays: {},
        trenitaliaUser: '',
        trenitaliaPass: '',
        userName: 'Luca Martinelli',
        theme: 'light'
    });

    constructor() {
        if (browser) {
            this.init();
        }
    }

    async init() {
        try {
            const loaded = await loadState();
            
            // Merge loaded state
            if (loaded.selectedMonth !== undefined) this.state.selectedMonth = loaded.selectedMonth;
            if (loaded.selectedYear !== undefined) this.state.selectedYear = loaded.selectedYear;
            if (loaded.theme !== undefined) this.state.theme = loaded.theme;
            if (loaded.trenitaliaUser !== undefined) this.state.trenitaliaUser = loaded.trenitaliaUser;
            if (loaded.trenitaliaPass !== undefined) this.state.trenitaliaPass = loaded.trenitaliaPass;
            if (loaded.userName !== undefined) this.state.userName = loaded.userName;
            if (loaded.holidays) this.state.holidays = loaded.holidays;
            if (loaded.days) this.state.days = loaded.days;
            if (loaded.expenses) this.state.expenses = loaded.expenses;

            // Apply theme immediately
            if (this.state.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (e) {
            console.error('Failed to load state from IndexedDB', e);
        }
    }

    setDate(month: number, year: number) {
        this.state.selectedMonth = month;
        this.state.selectedYear = year;
        if (browser) {
            dbPutSettings('selectedMonth', month);
            dbPutSettings('selectedYear', year);
        }
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        if (browser) {
            dbPutSettings('theme', this.state.theme);
            if (this.state.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }

    updateCredentials(user: string, pass: string) {
        this.state.trenitaliaUser = user;
        this.state.trenitaliaPass = pass;
        if (browser) {
            dbPutSettings('trenitaliaUser', user);
            dbPutSettings('trenitaliaPass', pass);
        }
    }

    updateUserName(name: string) {
        this.state.userName = name;
        if (browser) {
            dbPutSettings('userName', name);
        }
    }

    setHolidays(holidays: Record<string, string>) {
        this.state.holidays = holidays;
        if (browser) {
            dbPutSettings('holidays', holidays);
        }
    }

    getDay(date: string): WorkDay {
        if (!this.state.days[date]) {
            let type: DayType = 'Lavoro';
            if (this.state.holidays[date]) {
                type = 'Festivo';
            } else {
                const d = new Date(date);
                const day = d.getDay();
                if (day === 0) type = 'Domenica';
                else if (day === 6) type = 'Sabato';
            }

            return {
                date,
                type,
                morningStart: '08:30',
                morningEnd: '13:00',
                afternoonStart: '14:00',
                afternoonEnd: '17:30',
                attachments: []
            };
        }
        return this.state.days[date];
    }

    updateDay(date: string, data: Partial<WorkDay>) {
        if (!this.state.days[date]) {
            this.state.days[date] = this.getDay(date); // Initialize with default
        }
        Object.assign(this.state.days[date], data);
        
        if (browser) {
            dbPutDay($state.snapshot(this.state.days[date]));
        }
    }

    addExpense(expense: Expense) {
        // Check if exists
        const idx = this.state.expenses.findIndex(e => e.id === expense.id);
        if (idx >= 0) {
            this.state.expenses[idx] = expense;
        } else {
            this.state.expenses.push(expense);
        }
        
        if (browser) {
            dbPutExpense($state.snapshot(expense));
        }
    }

    removeExpense(id: string) {
        this.state.expenses = this.state.expenses.filter(e => e.id !== id);
        if (browser) {
            dbDeleteExpense(id);
        }
    }
}

export const store = new Store();
