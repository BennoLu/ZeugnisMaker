// Dropzones aktivieren
document.querySelectorAll('.dropzone').forEach(zone => {
	zone.dataset.placeholder = 'Zieh einen Satz von links hier rein';

	new Sortable(zone, {
		group: 'kompetenzen',
		animation: 150,
		sort: false,
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

// Quelle links
new Sortable(document.querySelector('.bottom'), {
	group: {
		name: 'kompetenzen',
		pull: 'clone',
		put: false
	},
	sort: false
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
		} else if (hasText) {
			// handled by input
		} else {
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
	const data = [];

	const globalFields = {
		className: document.querySelector('.class-name')?.value || '',
		teacherName: document.querySelector('.teacher-name')?.value || '',
		date: document.querySelector('.date-field')?.value || ''
	};

	document.querySelectorAll('.kind-block').forEach(block => {
		const kindName = block.querySelector('.kind-name')?.value || '';

		const kompetenzen = [...block.querySelectorAll('.kompetenzbereich .dropzone')].map(zone => ({
			items: [...zone.children].map(el => el.textContent.replace('×', '').trim()),
			textarea: zone.nextElementSibling?.value || '',
			disabled: zone.nextElementSibling?.disabled || false
		}));

		const lernziele = [...block.querySelectorAll('.lernzielbereich .dropzone')].map(zone => ({
			items: [...zone.children].map(el => el.textContent.replace('×', '').trim()),
			textarea: zone.nextElementSibling?.value || '',
			disabled: zone.nextElementSibling?.disabled || false
		}));

		data.push({ kindName, kompetenzen, lernziele });
	});

	localStorage.setItem('kompetenzformular_global', JSON.stringify(globalFields));
	localStorage.setItem('kompetenzformular', JSON.stringify(data));
}

// 🔁 Laden aus localStorage
function loadDataFromLocalStorage() {
	const global = JSON.parse(localStorage.getItem('kompetenzformular_global'));
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

		block.querySelectorAll('.kompetenzbereich .dropzone').forEach((zone, i) => {
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

		block.querySelectorAll('.lernzielbereich .dropzone').forEach((zone, i) => {
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

// 🟡 Speichern bei Änderungen an Klasse, Lehrkraft, Datum
document.querySelector('.class-name')?.addEventListener('input', saveDataToLocalStorage);
document.querySelector('.teacher-name')?.addEventListener('input', saveDataToLocalStorage);
document.querySelector('.date-field')?.addEventListener('input', saveDataToLocalStorage);

// 🟡 Speichern bei Änderungen an jedem Kind-Namen
document.querySelectorAll('.kind-name').forEach(input => {
	input.addEventListener('input', saveDataToLocalStorage);
});

