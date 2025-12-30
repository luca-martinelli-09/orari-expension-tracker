export type DayType =
	| 'Lavoro'
	| 'Ferie'
	| 'Malattia'
	| 'Permesso'
	| 'Chiusura'
	| 'Festivo'
	| 'Sabato'
	| 'Domenica';

export type ExpenseCategory =
	| 'Viaggi aerei, ferroviari'
	| 'Autostrada'
	| 'Noleggi auto'
	| 'Rimborso Km'
	| 'Viaggi locali (tram, bus, ecc)'
	| 'Alloggio'
	| 'Vitto'
	| 'Lavanderia, stireria'
	| 'Postali, telegrafiche, telefoniche'
	| 'Parcheggi'
	| 'Spese straordinarie';

export interface Attachment {
	id: string;
	name: string;
	type: string; // mime type
	data: string; // base64 or blob url (for in-memory)
}

export interface WorkDay {
	date: string; // ISO YYYY-MM-DD
	type: DayType;
	morningStart: string; // "08:30"
	morningEnd: string; // "13:00"
	afternoonStart: string; // "14:00"
	afternoonEnd: string; // "17:30"
	attachments: Attachment[];
}

export interface Expense {
	id: string;
	date: string;
	description: string;
	amount: number;
	currency: string;
	type: 'Trenitalia' | 'Manuale';
	category: ExpenseCategory;
	attachments: Attachment[];
	metadata?: any; // To store original Trenitalia JSON if needed
}

// Store state interface
export interface AppState {
	selectedMonth: number; // 0-11
	selectedYear: number;
	days: Record<string, WorkDay>; // Keyed by YYYY-MM-DD
	expenses: Expense[];
	holidays: Record<string, string>; // YYYY-MM-DD -> Name
	trenitaliaUser: string;
	trenitaliaPass: string;
	userName: string;
	theme: 'light' | 'dark';
}
