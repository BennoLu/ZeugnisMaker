const sheets = [
	{ gid: "0" },
	{ gid: "630509827" }
];

const sheetId = "1qneoS-kQ01f1GdGn3wpKWeIs_BCiwxTgpXHMitmcnXg";
const alleSheetsDiv = document.getElementById('alle-sheets');

// Function to load and render a single sheet
async function loadSheet(sheet) {
	const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheet.gid}`;
	try {
		const response = await fetch(url);
		const csv = await response.text();
		const rows = csv.split('\n').map(line => line.split(','));
		const maxSpalten = Math.max(...rows.map(r => r.length));
		const sheetName = (rows[0] && rows[0][0]) ? rows[0][0].trim() : 'Unbenanntes Blatt';

		const sheetTitle = document.createElement('div');
		sheetTitle.className = 'sheet-title';
		sheetTitle.textContent = sheetName;
		alleSheetsDiv.appendChild(sheetTitle);

		for (let spalte = 0; spalte < maxSpalten; spalte++) {
			const ueberschrift = (rows[2] && rows[2][spalte]) ? rows[2][spalte] : '(Keine Überschrift)';

			let heading = document.createElement('span');
			heading.className = 'spalte-ueberschrift';
			heading.textContent = ueberschrift === '' ? '(Keine Überschrift)' : ueberschrift;
			alleSheetsDiv.appendChild(heading);

			let zellenWerte = [];
			for (let zeile = 3; zeile < rows.length; zeile++) {
				let wert = rows[zeile][spalte] !== undefined ? rows[zeile][spalte] : '';
				zellenWerte.push(wert);
			}

			while (zellenWerte.length > 0 && zellenWerte[zellenWerte.length - 1].trim() === '') {
				zellenWerte.pop();
			}

			if (zellenWerte.length > 0) {
				zellenWerte.forEach(wert => {
					const trimmedWert = wert.trim();
					if (trimmedWert !== '') {
						let cellDiv = document.createElement('div');
						cellDiv.className = 'kompetenz';
						cellDiv.draggable = "true";
						cellDiv.textContent = trimmedWert;
						alleSheetsDiv.appendChild(cellDiv);
					}
				});
			}
		}
	} catch (err) {
		const errorDiv = document.createElement('div');
		errorDiv.textContent = `Fehler beim Abruf des Blattes mit gid ${sheet.gid}`;
		errorDiv.style.color = "red";
		alleSheetsDiv.appendChild(errorDiv);
		console.error(err);
	}
}

// Sequentially load sheets
async function loadSheetsInOrder() {
	for (const sheet of sheets) {
		await loadSheet(sheet);
	}
}

loadSheetsInOrder();
