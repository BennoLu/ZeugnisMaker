document.getElementById('export-pdf').addEventListener('click', function (e) {
	// grab & trim values
	const klasse = document.querySelector('.class-name').value.trim();
	const lehrer = document.querySelector('.teacher-name').value.trim();
	const datum = document.querySelector('.date-field').value.trim();

	// collect missing fields
	const missing = [];
	if (!klasse) missing.push('Klasse');
	if (!lehrer) missing.push('Lehrkraft');
	if (!datum) missing.push('Datum');

	if (missing.length) {
		// prevent the default export logic
		e.preventDefault();
		// alert which fields
		alert('Bitte füllen Sie folgende Felder aus:\n• ' + missing.join('\n• '));
		return;
	}

	// all good — call your export logic here (or let your existing handler run)
	// exportPdf(); // <-- whatever your PDF-export function is
});





// Dropzones aktivieren
document.querySelectorAll('.dropzone').forEach(zone => {
	zone.dataset.placeholder = 'Zieh einen Satz von links hier rein';

	new Sortable(zone, {
		group: 'kompetenzen',
		animation: 150,
		sort: false,
		draggable: '.kompetenz',    // nur .kompetenz-Items sind ziehbar
		onAdd: (evt) => {
			const newItem = evt.item;
			const zone = evt.to;

			// Nur 1 Element behalten
			[...zone.children].forEach(child => {
				if (child !== newItem && child.classList.contains('kompetenz')) {
					child.remove();
				}
			});

			addRemoveButton(zone);
			saveDataToLocalStorage();
			updateTextareaStates();
		},
		onRemove: () => {
			saveDataToLocalStorage();
			updateTextareaStates();
		}
	});
});

// Quelle links (nur .kompetenz als Quelle)
new Sortable(document.querySelector('.bottom'), {
	group: {
		name: 'kompetenzen',
		pull: 'clone',
		put: false
	},
	sort: false,
	draggable: '.kompetenz'      // nur .kompetenz-Items können gezogen werden
});

// Entfernen-Button für Einträge
function addRemoveButton(zone) {
	const item = zone.querySelector('.kompetenz');
	if (item && !item.querySelector('.remove-btn')) {
		const btn = document.createElement('button');
		btn.className = 'remove-btn';
		btn.innerHTML = '&times;';
		btn.style.marginRight = '0.5em';
		btn.addEventListener('click', () => {
			item.remove();
			updateTextareaStates();
			saveDataToLocalStorage();
		});
		item.prepend(btn);
	}
}

// Textarea tippen → Dropzone deaktivieren + leeren
function handleTextareaInput(textarea) {
	const zone = textarea.previousElementSibling;
	if (!zone) return;

	const sortInstance = Sortable.get(zone);
	const hasText = textarea.value.trim().length > 0;

	if (hasText) {
		zone.innerHTML = '';
		zone.classList.add('disabled-zone');
		zone.dataset.placeholder = 'deaktiviert';
		if (sortInstance) sortInstance.option('disabled', true);
	} else {
		zone.classList.remove('disabled-zone');
		zone.dataset.placeholder = 'Zieh einen Satz von links hier rein';
		if (sortInstance) sortInstance.option('disabled', false);
	}
	updateTextareaStates();
	saveDataToLocalStorage();
}

// Dropzone-/Textarea-Status prüfen
function updateTextareaStates() {
	document.querySelectorAll('.dropzone').forEach(zone => {
		const textarea = zone.nextElementSibling;
		if (!textarea) return;

		const hasContent = zone.querySelector('.kompetenz');
		const hasText = textarea.value.trim().length > 0;

		if (hasContent) {
			textarea.value = '';
			textarea.disabled = true;
			textarea.classList.add('disabled-input');
			zone.classList.add('filled');
			zone.classList.remove('disabled-zone');
			zone.dataset.placeholder = '';
			const sortInstance = Sortable.get(zone);
			if (sortInstance) sortInstance.option('disabled', false);
		} else if (!hasContent && !hasText) {
			textarea.disabled = false;
			textarea.classList.remove('disabled-input');
			zone.classList.remove('filled', 'disabled-zone');
			zone.dataset.placeholder = 'Zieh einen Satz von links hier rein';
			const sortInstance = Sortable.get(zone);
			if (sortInstance) sortInstance.option('disabled', false);
		}
	});
}

// 🔐 Speichern in localStorage (global + pro Kind)
function saveDataToLocalStorage() {
	const globalFields = {
		className: document.querySelector('.class-name')?.value || '',
		teacherName: document.querySelector('.teacher-name')?.value || '',
		date: document.querySelector('.date-field')?.value || ''
	};

	const data = Array.from(document.querySelectorAll('.kind-block')).map(block => {
		const kindName = block.querySelector('.kind-name')?.value || '';

		const kompetenzen = Array.from(
			block.querySelectorAll('.kompetenzbereich .dropzone')
		).map(zone => ({
			items: Array.from(zone.children)
				.map(el => el.textContent.replace('×', '').trim()),
			textarea: zone.nextElementSibling?.value || '',
			disabled: zone.nextElementSibling?.disabled || false
		}));

		const lernziele = Array.from(
			block.querySelectorAll('.lernzielbereich .dropzone')
		).map(zone => ({
			items: Array.from(zone.children)
				.map(el => el.textContent.replace('×', '').trim()),
			textarea: zone.nextElementSibling?.value || '',
			disabled: zone.nextElementSibling?.disabled || false
		}));

		return { kindName, kompetenzen, lernziele };
	});

	localStorage.setItem(
		'kompetenzformular_global',
		JSON.stringify(globalFields)
	);
	localStorage.setItem('kompetenzformular', JSON.stringify(data));
}

// 🔁 Laden aus localStorage
function loadDataFromLocalStorage() {
	const global = JSON.parse(
		localStorage.getItem('kompetenzformular_global')
	);
	if (global) {
		document.querySelector('.class-name').value = global.className || '';
		document.querySelector('.teacher-name').value = global.teacherName || '';
		document.querySelector('.date-field').value = global.date || '';
	}

	const saved = JSON.parse(localStorage.getItem('kompetenzformular'));
	if (!saved) return;

	document.querySelectorAll('.kind-block').forEach((block, index) => {
		const data = saved[index];
		if (!data) return;

		block.querySelector('.kind-name').value = data.kindName || '';

		// restore Kompetenzen
		block.querySelectorAll(
			'.kompetenzbereich .dropzone'
		).forEach((zone, i) => {
			zone.innerHTML = '';
			const k = data.kompetenzen[i];
			if (!k) return;
			k.items.forEach(text => {
				const div = document.createElement('div');
				div.className = 'kompetenz';
				div.textContent = text;
				zone.appendChild(div);
				addRemoveButton(zone);
			});
			const textarea = zone.nextElementSibling;
			if (textarea) {
				textarea.value = k.textarea;
				textarea.disabled = k.disabled;
				textarea.classList.toggle('disabled-input', k.disabled);
				handleTextareaInput(textarea);
			}
		});

		// restore Lernziele
		block.querySelectorAll(
			'.lernzielbereich .dropzone'
		).forEach((zone, i) => {
			zone.innerHTML = '';
			const l = data.lernziele[i];
			if (!l) return;
			l.items.forEach(text => {
				const div = document.createElement('div');
				div.className = 'kompetenz';
				div.textContent = text;
				zone.appendChild(div);
				addRemoveButton(zone);
			});
			const textarea = zone.nextElementSibling;
			if (textarea) {
				textarea.value = l.textarea;
				textarea.disabled = l.disabled;
				textarea.classList.toggle('disabled-input', l.disabled);
				handleTextareaInput(textarea);
			}
		});
	});

	updateTextareaStates();
}

// Reagiere auf Texteingabe
document.querySelectorAll('textarea').forEach(textarea => {
	textarea.addEventListener('input', () => {
		handleTextareaInput(textarea);
	});
});

// Initiales Laden
window.addEventListener('DOMContentLoaded', () => {
	loadDataFromLocalStorage();
	updateTextareaStates();
});

// 🔔 Speichern bei Änderungen
document
	.querySelector('.class-name')
	?.addEventListener('input', saveDataToLocalStorage);
document
	.querySelector('.teacher-name')
	?.addEventListener('input', saveDataToLocalStorage);
document
	.querySelector('.date-field')
	?.addEventListener('input', saveDataToLocalStorage);
document.querySelectorAll('.kind-name').forEach(input => {
	input.addEventListener('input', saveDataToLocalStorage);
});
  



const colorMap = {
	"1": "#ffd1dc",  // pastel pink
	"2": "#c1f0f6",  // pastel cyan
	"3": "#caffbf",  // pastel green
	"4": "#ffffd1",  // pastel yellow
	"5": "#ffc9de",  // soft rose
	"6": "#d1e7ff",  // pastel blue
	"7": "#e0bbff",  // lavender
	"8": "#f9f0c1",  // cream yellow
	"9": "#ffe5b4",  // peach
	"10": "#b4f8c8", // mint
	"11": "#fcd5ce", // light blush
	"12": "#a0c4ff", // baby blue
	"13": "#d0f4de", // pale mint
	"14": "#ffb3c6", // bubblegum pink
	"15": "#fdffb6", // butter yellow
	"16": "#d3c4f3", // soft violet
	"17": "#fbc4ab", // light orange
	"18": "#b5ead7", // aqua green
	"19": "#ffdfba", // soft apricot
	"20": "#e4c1f9", // pastel purple
	"21": "#c9f9ff", // ice blue
	"22": "#ffcad4", // rose quartz
	"23": "#dcedc1", // light green
	"24": "#ffe0ac", // almond
	"25": "#c2f0c2", // pale lime
	"26": "#e6e6fa", // lavender mist
	"27": "#fff1e6", // cream peach
	"28": "#f0fff0", // honeydew
	"29": "#ffefc1", // banana
	"30": "#f4c2c2"  // tea rose
};

document.querySelectorAll('.kind-block').forEach(block => {
	const kind = block.getAttribute('data-kind');
	if (colorMap[kind]) {
		block.style.backgroundColor = colorMap[kind];
	}
});

document.querySelectorAll('.kind-block').forEach(block => {
	const kind = block.getAttribute('data-kind');
	if (colorMap[kind]) {
		block.style.backgroundColor = colorMap[kind];
	}
});




