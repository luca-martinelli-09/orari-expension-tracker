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
	if (day.type !== 'Lavoro') return 0; // Or standard 8h for Ferie? Requirement says "Calcolo Ore Lavorate". Usually only actual work.

	// Simple parser "HH:MM"
	const parse = (t: string) => {
		const [h, m] = t.split(':').map(Number);
		return h * 60 + m;
	};

	const mStart = parse(day.morningStart);
	const mEnd = parse(day.morningEnd);
	const aStart = parse(day.afternoonStart);
	const aEnd = parse(day.afternoonEnd);

	return mEnd - mStart + (aEnd - aStart);
}
