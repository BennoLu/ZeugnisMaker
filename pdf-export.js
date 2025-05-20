document.querySelector('.button')?.addEventListener('click', () => {
	const doc = new jsPDF();

	const className = document.querySelector('.class-name')?.value || '';
	const teacherName = document.querySelector('.teacher-name')?.value || '';
	const date = document.querySelector('.date-field')?.value || '';

	const kindBlocks = document.querySelectorAll('.kind-block');

	kindBlocks.forEach((block, index) => {
		if (index > 0) doc.addPage(); // ab zweiter Seite

		const kindName = block.querySelector('.kind-name')?.value || '';

		let y = 20;

		// ⬆️ Kopfbereich
		doc.setFontSize(12);
		doc.text(`Klasse: ${className}`, 20, y);
		doc.text(`Lehrkraft: ${teacherName}`, 100, y);
		y += 8;
		doc.text(`Datum: ${date}`, 20, y);
		y += 12;
		doc.setFontSize(14);
		doc.text(`Name des Kindes: ${kindName}`, 20, y);
		y += 10;

		// 🟦 Kompetenzen
		doc.setFontSize(12);
		doc.text('Kompetenzen:', 20, y);
		y += 6;
		block.querySelectorAll('.kompetenzbereich .dropzone').forEach((zone, i) => {
			const kompetenzText = zone.textContent.replace('×', '').trim();
			const comment = zone.nextElementSibling?.value || '';
			if (kompetenzText || comment) {
				doc.text(`• ${kompetenzText}`, 25, y);
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

		// 🟩 Lernziele
		doc.text('Lernziele:', 20, y);
		y += 6;
		block.querySelectorAll('.lernzielbereich .dropzone').forEach((zone, i) => {
			const lernzielText = zone.textContent.replace('×', '').trim();
			const comment = zone.nextElementSibling?.value || '';
			if (lernzielText || comment) {
				doc.text(`• ${lernzielText}`, 25, y);
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

	// 📥 Speichern
	doc.save('kompetenzbogen.pdf');
});
