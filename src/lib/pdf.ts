import { format, getDaysInMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';
import type { Expense, WorkDay } from './types';

export async function generateHoursPdf(
	month: number,
	year: number,
	days: Record<string, WorkDay>,
	holidays: Record<string, string>,
	userName: string = 'Luca Martinelli'
) {
	const doc = new jsPDF();

	doc.setFontSize(14);
	doc.text('TABELLA ORARI DI LAVORO', 14, 15);
	doc.setFontSize(10);
	doc.text(`DIPENDENTE: ${userName}`, 14, 22);
	doc.text(
		`MESE: ${format(new Date(year, month, 1), 'MMMM yyyy', {
			locale: it
		}).toUpperCase()}`,
		14,
		27
	);

	const tableData: any[] = [];
	const daysInMonth = getDaysInMonth(new Date(year, month, 1));
	let totalMinutes = 0;

	for (let d = 1; d <= daysInMonth; d++) {
		const date = new Date(year, month, d);
		const dateStr = format(date, 'yyyy-MM-dd');
		const day = days[dateStr];
		const dayData = day || {
			type: 'Lavoro',
			morningStart: '08:30',
			morningEnd: '13:00',
			afternoonStart: '14:00',
			afternoonEnd: '17:30',
			attachments: []
		};

		const row: string[] = [d.toString()];
		const isWknd = date.getDay() === 0 || date.getDay() === 6;
		const holidayName = holidays[dateStr];

		if (holidayName) {
			row.push(holidayName, '', '', '', '', '');
		} else if (isWknd) {
			const dayName = format(date, 'EEEE', { locale: it });
			row.push(dayName.charAt(0).toUpperCase() + dayName.slice(1), '', '', '', '', '');
		} else if (dayData.type !== 'Lavoro') {
			row.push(dayData.type, '', '', '', '', '');
		} else {
			row.push(
				dayData.morningStart,
				dayData.morningEnd,
				dayData.afternoonStart,
				dayData.afternoonEnd
			);
			const parse = (t: string) => {
				if (!t) return 0;
				const [h, m] = t.split(':').map(Number);
				return h * 60 + m;
			};
			const minutes =
				parse(dayData.morningEnd) -
				parse(dayData.morningStart) +
				(parse(dayData.afternoonEnd) - parse(dayData.afternoonStart));
			totalMinutes += minutes;
			const h = Math.floor(minutes / 60);
			const m = minutes % 60;
			row.push(`${h}:${m.toString().padStart(2, '0')}`);
			row.push(userName);
		}
		tableData.push(row);
	}

	const th = Math.floor(totalMinutes / 60);
	const tm = totalMinutes % 60;
	tableData.push(['TOTALE', '', '', '', '', `${th}:${tm.toString().padStart(2, '0')}`, '']);

	autoTable(doc, {
		head: [
			[
				{
					content: 'Data',
					rowSpan: 2,
					styles: {
						halign: 'center',
						valign: 'middle',
						fillColor: [240, 240, 240],
						textColor: [50, 50, 50],
						fontStyle: 'bold'
					}
				},
				{
					content: 'MATTINO',
					colSpan: 2,
					styles: {
						halign: 'center',
						fillColor: [240, 240, 240],
						textColor: [50, 50, 50],
						fontStyle: 'bold'
					}
				},
				{
					content: 'POMERIGGIO',
					colSpan: 2,
					styles: {
						halign: 'center',
						fillColor: [240, 240, 240],
						textColor: [50, 50, 50],
						fontStyle: 'bold'
					}
				},
				{
					content: 'ORE',
					rowSpan: 2,
					styles: {
						halign: 'center',
						valign: 'middle',
						fillColor: [240, 240, 240],
						textColor: [50, 50, 50],
						fontStyle: 'bold'
					}
				},
				{
					content: 'FIRMA',
					rowSpan: 2,
					styles: {
						halign: 'center',
						valign: 'middle',
						fillColor: [240, 240, 240],
						textColor: [50, 50, 50],
						fontStyle: 'bold'
					}
				}
			],
			[
				{
					content: 'Entrata',
					styles: { fillColor: [240, 240, 240], textColor: [50, 50, 50] }
				},
				{
					content: 'Uscita',
					styles: { fillColor: [240, 240, 240], textColor: [50, 50, 50] }
				},
				{
					content: 'Entrata',
					styles: { fillColor: [240, 240, 240], textColor: [50, 50, 50] }
				},
				{
					content: 'Uscita',
					styles: { fillColor: [240, 240, 240], textColor: [50, 50, 50] }
				}
			]
		],
		body: tableData,
		startY: 35,
		theme: 'grid',
		styles: {
			fontSize: 8,
			cellPadding: 1.5,
			textColor: [0, 0, 0],
			lineColor: [200, 200, 200],
			lineWidth: 0.1
		},
		didParseCell: (data) => {
			const dayIndex = data.row.index;
			if (dayIndex < daysInMonth) {
				const date = new Date(year, month, dayIndex + 1);
				const dateStr = format(date, 'yyyy-MM-dd');
				const day = days[dateStr];
				const isHoliday = !!holidays[dateStr];
				const isWknd = date.getDay() === 0 || date.getDay() === 6;
				const type = day?.type || 'Lavoro';

				if (type !== 'Lavoro' || isHoliday || isWknd) {
					data.cell.styles.fillColor = [240, 240, 240];
					data.cell.styles.fontStyle = 'italic';
				}
			}

			// Bold First Column (Date)
			if (data.column.index === 0) {
				data.cell.styles.fontStyle = 'bold';
			}

			// Bold Total Row
			if (dayIndex === daysInMonth) {
				// Total row is last
				data.cell.styles.fontStyle = 'bold';
			}
		}
	});

	const reportPdfBuffer = doc.output('arraybuffer');
	const pdfDoc = await PDFDocument.load(reportPdfBuffer);

	// Attachments
	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = format(new Date(year, month, d), 'yyyy-MM-dd');
		const day = days[dateStr];
		if (day?.attachments) {
			for (const att of day.attachments) {
				await embedAttachment(pdfDoc, att);
			}
		}
	}

	const savedBytes = await pdfDoc.save();
	downloadBlob(savedBytes, `Orari_${month + 1}_${year}.pdf`);
}

export async function generateExpensesPdf(
	month: number,
	year: number,
	expenses: Expense[],
	userName: string = 'Luca Martinelli'
) {
	const doc = new jsPDF();
	doc.setFontSize(14);
	doc.text('RIMBORSI SPESE', 14, 15);
	doc.setFontSize(10);
	doc.text(`DIPENDENTE: ${userName}`, 14, 22);
	doc.text(
		`MESE: ${format(new Date(year, month, 1), 'MMMM yyyy', {
			locale: it
		}).toUpperCase()}`,
		14,
		27
	);

	const categories = [
		'Viaggi aerei, ferroviari',
		'Autostrada',
		'Noleggi auto',
		'Rimborso Km',
		'Viaggi locali (tram, bus, ecc)',
		'Alloggio',
		'Vitto',
		'Lavanderia, stireria',
		'Postali, telegrafiche, telefoniche',
		'Parcheggi',
		'Spese straordinarie'
	];

	const tableData: any[] = [];
	let total = 0;

	categories.forEach((cat) => {
		const catExpenses = expenses.filter((e) => (e.category || 'Viaggi aerei, ferroviari') === cat);
		if (catExpenses.length > 0) {
			// Header row for category
			tableData.push([
				{
					content: cat.toUpperCase(),
					colSpan: 3,
					styles: {
						fontStyle: 'bold',
						fillColor: [240, 240, 240],
						textColor: [50, 50, 50],
						halign: 'left'
					}
				}
			]);

			catExpenses.forEach((e) => {
				tableData.push([
					format(new Date(e.date), 'dd/MM/yyyy'),
					e.description,
					`€ ${e.amount.toFixed(2)}`
				]);
				total += e.amount;
			});
		}
	});

	// Catch-all for undefined categories
	const otherExpenses = expenses.filter(
		(e) => !categories.includes(e.category as any) && e.category !== undefined
	);
	if (otherExpenses.length > 0) {
		tableData.push([
			{
				content: 'ALTRO',
				colSpan: 3,
				styles: {
					fontStyle: 'bold',
					fillColor: [240, 240, 240],
					textColor: [50, 50, 50],
					halign: 'left'
				}
			}
		]);
		otherExpenses.forEach((e) => {
			tableData.push([
				format(new Date(e.date), 'dd/MM/yyyy'),
				e.description,
				`€ ${e.amount.toFixed(2)}`
			]);
			total += e.amount;
		});
	}

	tableData.push(['TOTALE', '', `€ ${total.toFixed(2)}`]);

	autoTable(doc, {
		head: [
			[
				{
					content: 'Data',
					styles: {
						fillColor: [240, 240, 240],
						textColor: [50, 50, 50],
						fontStyle: 'bold',
						halign: 'left'
					}
				},
				{
					content: 'Descrizione',
					styles: {
						fillColor: [240, 240, 240],
						textColor: [50, 50, 50],
						fontStyle: 'bold',
						halign: 'left'
					}
				},
				{
					content: 'Importo',
					styles: {
						fillColor: [240, 240, 240],
						textColor: [50, 50, 50],
						fontStyle: 'bold',
						halign: 'right'
					}
				}
			]
		],
		body: tableData,
		startY: 35,
		theme: 'grid',
		styles: {
			fontSize: 10,
			cellPadding: 3,
			textColor: [0, 0, 0],
			lineColor: [200, 200, 200],
			lineWidth: 0.1
		},
		columnStyles: {
			2: { halign: 'right' }
		},
		didParseCell: (data) => {
			// Bold Total Row (last row)
			if (data.row.index === tableData.length - 1) {
				data.cell.styles.fontStyle = 'bold';
			}
		}
	});

	const reportPdfBuffer = doc.output('arraybuffer');
	const pdfDoc = await PDFDocument.load(reportPdfBuffer);

	for (const exp of expenses) {
		for (const att of exp.attachments) {
			await embedAttachment(pdfDoc, att);
		}
	}

	const savedBytes = await pdfDoc.save();
	downloadBlob(savedBytes, `Rimborsi_${month + 1}_${year}.pdf`);
}

async function embedAttachment(pdfDoc: PDFDocument, att: import('./types').Attachment) {
	try {
		const attBytes = await fetch(att.data).then((r) => r.arrayBuffer());
		if (att.type === 'application/pdf') {
			const srcDoc = await PDFDocument.load(attBytes);
			const indices = srcDoc.getPageIndices();
			const copiedPages = await pdfDoc.copyPages(srcDoc, indices);
			copiedPages.forEach((p) => pdfDoc.addPage(p));
		} else if (att.type.startsWith('image/')) {
			let image;
			if (att.type === 'image/png') image = await pdfDoc.embedPng(attBytes);
			else image = await pdfDoc.embedJpg(attBytes);

			const page = pdfDoc.addPage();
			const { width, height } = image.scaleToFit(page.getWidth() - 50, page.getHeight() - 50);
			page.drawImage(image, {
				x: 25,
				y: page.getHeight() - height - 25,
				width,
				height
			});
		}
	} catch (e) {
		console.error('Error embedding attachment', att.name, e);
	}
}

function downloadBlob(bytes: Uint8Array, name: string) {
	const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = name;
	link.click();
}
