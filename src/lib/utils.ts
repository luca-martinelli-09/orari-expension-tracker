export async function fetchHolidays(year: number) {
	try {
		const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IT`);
		if (!res.ok) {
			console.error('Failed to fetch holidays', res.statusText);
			return [];
		}
		return await res.json();
	} catch (e) {
		console.error('Error fetching holidays', e);
		return [];
	}
}

export function formatDuration(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function calculateHours(day: import('./types').WorkDay): number {
	// Sabato and Domenica are always 0 hours
	if (day.type === 'Sabato' || day.type === 'Domenica') return 0;

	// Simple parser "HH:MM", returns 0 if empty or invalid
	const parse = (t: string) => {
		if (!t || t.trim() === '') return 0;
		const [h, m] = t.split(':').map(Number);
		if (isNaN(h) || isNaN(m)) return 0;
		return h * 60 + m;
	};

	const mStart = parse(day.morningStart);
	const mEnd = parse(day.morningEnd);
	const aStart = parse(day.afternoonStart);
	const aEnd = parse(day.afternoonEnd);

	let total = 0;

	// Calculate morning hours only if both start and end are provided
	if (mStart > 0 && mEnd > 0) {
		total += mEnd - mStart;
	}

	// Calculate afternoon hours only if both start and end are provided
	if (aStart > 0 && aEnd > 0) {
		total += aEnd - aStart;
	}

	return total;
}
