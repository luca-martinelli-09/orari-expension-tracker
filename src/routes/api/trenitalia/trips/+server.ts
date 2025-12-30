import { json } from '@sveltejs/kit';

export async function POST({ request, fetch }) {
	const { token, fromDate, toDate } = await request.json();

	const postData = JSON.stringify({
		travelGroup: 'TICKET',
		searchType: 'DEPARTURE_DATE',
		fromDate: fromDate,
		toDate: toDate,
		code: '',
		limit: 100,
		offset: 0
	});

	const url = new URL('https://www.lefrecce.it/Channels.Website.BFF.WEB/website/travel/solutions');

	const res = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: postData
	});

	const data = await res.json();
	return json(data);
}
