document.addEventListener('DOMContentLoaded', () => {
	const exportBtn = document.getElementById('export-pdf');
	if (!exportBtn) {
		console.warn('Export-Button nicht gefunden');
		return;
	}

	exportBtn.addEventListener('click', () => {
		console.log('🟢 Export-Button wurde geklickt');
		const img = new Image();
		img.src = 'BG.png'; // Dein Hintergrundbild im gleichen Ordner

		img.onload = () => {
			console.log('✅ Hintergrundbild geladen');
			const doc = new jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'a4'
			});

			const pageWidth = doc.internal.pageSize.getWidth();
			const pageHeight = doc.internal.pageSize.getHeight();

			const className = document.querySelector('.class-name')?.value || '';
			const teacherName = document.querySelector('.teacher-name')?.value || '';
			const date = document.querySelector('.date-field')?.value || '';
			const kindBlocks = document.querySelectorAll('.kind-block');

			if (kindBlocks.length === 0) {
				alert('Keine Kinderblöcke gefunden.');
				return;
			}

			kindBlocks.forEach((block, index) => {
				if (index > 0) doc.addPage();

				// 🔳 Hintergrundbild vollformatig einfügen
				doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

				// 🅰 Eigene Schriftart aktivieren
				doc.setFont('MyFont', 'normal'); // Name aus deiner MyFont.js-Datei
				doc.setFontSize(12);

				let y = 20;
				doc.text(`${className}`, 20, y);
				doc.text(`${teacherName}`, 100, y);
				y += 8;
				doc.text(`${date}`, 20, y);
				y += 12;

				const kindName = block.querySelector('.kind-name')?.value || '';
				doc.setFontSize(14);
				doc.text(`${kindName}`, 20, y);
				y += 10;

				// ▶️ Kompetenzen
				doc.setFontSize(12);
				doc.text('', 20, y);
				y += 6;

				block.querySelectorAll('.kompetenzbereich .dropzone').forEach(zone => {
					const text = zone.textContent.replace('×', '').trim();
					const comment = zone.nextElementSibling?.value || '';
					if (text || comment) {
						doc.text(`• ${text}`, 25, y);
						y += 6;
						if (comment) {
							doc.setFontSize(10);
							doc.text(`→ ${comment}`, 30, y);
							doc.setFontSize(12);
							y += 6;
						}
					}
				});

				y += 8;

				// ▶️ Lernziele
				doc.text('', 20, y);
				y += 6;

				block.querySelectorAll('.lernzielbereich .dropzone').forEach(zone => {
					const text = zone.textContent.replace('×', '').trim();
					const comment = zone.nextElementSibling?.value || '';
					if (text || comment) {
						doc.text(`• ${text}`, 25, y);
						y += 6;
						if (comment) {
							doc.setFontSize(10);
							doc.text(`→ ${comment}`, 30, y);
							doc.setFontSize(12);
							y += 6;
						}
					}
				});
			});

			doc.save('kompetenzbogen.pdf');
		};

		img.onerror = () => {
			console.error('❌ Bild konnte nicht geladen werden');
			console.error('❌ Fehler beim Laden von BG.png');
			alert('Das Hintergrundbild BG.png konnte nicht geladen werden. Stelle sicher, dass es im gleichen Ordner wie index.html liegt und korrekt benannt ist.');
		};
	});
});
