// ✅ Dropzones mit SortableJS initialisieren
document.querySelectorAll('.dropzone').forEach(zone => {
	new Sortable(zone, {
		group: 'kompetenzen',
		animation: 150,
		sort: false,
		onAdd: (evt) => {
			// ❌ Nur 1 Element erlauben
			if (evt.from !== evt.to && zone.children.length > 1) {
				[...zone.children].forEach((child, index) => {
					if (index < zone.children.length - 1) child.remove();
				});
			}
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

// ✅ Quelle: Nur klonen, kein Einfügen
new Sortable(document.querySelector('.bottom'), {
	group: {
		name: 'kompetenzen',
		pull: 'clone',
		put: false
	},
	sort: false
});

// ➕ X-Button zum Entfernen
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

// 🧠 Dropzones deaktivieren, wenn in Textarea getippt wird
function handleTextareaInput(textarea) {
	const zone = textarea.previousElementSibling;
	if (!zone) return;

	const sortInstance = Sortable.get(zone);
	const hasText = textarea.value.trim().length > 0;

	if (hasText) {
		// Text vorhanden → Dropzone deaktivieren & Inhalt löschen
		zone.innerHTML = '';
		textarea.disabled = false;
		zone.classList.add('disabled-zone');
		if (sortInstance) sortInstance.option('disabled', true);
	} else {
		// Kein Text → Dropzone wieder aktivieren
		zone.classList.remove('disabled-zone');
		if (sortInstance) sortInstance.option('disabled', false);
	}
	updateTextareaStates();
	saveDataToLocalStorage();
}

// 📦 Dropzone-Status prüfen und Textareas anpassen
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
			zone.classList.remove('disabled-zone');
			const sortInstance = Sortable.get(zone);
			if (sortInstance) sortInstance.option('disabled', false);
		} else if (hasText) {
			// handled by input logic
		} else {
			textarea.disabled = false;
			textarea.classList.remove('disabled-input');
			zone.classList.remove('disabled-zone');
			const sortInstance = Sortable.get(zone);
			if (sortInstance) sortInstance.option('disabled', false);
		}
	});
}

// 💾 Speichern
function saveDataToLocalStorage() {
	const data = [];

	document.querySelectorAll('.kind-block').forEach(block => {
		const kindName = block.querySelector('.kind-name').value;

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

	localStorage.setItem('kompetenzformular', JSON.stringify(data));
}

// 🔄 Laden
function loadDataFromLocalStorage() {
	const saved = JSON.parse(localStorage.getItem('kompetenzformular'));
	if (!saved) return;

	document.querySelectorAll('.kind-block').forEach((block, index) => {
		const data = saved[index];
		if (!data) return;

		block.querySelector('.kind-name').value = data.kindName;

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
				handleTextareaInput(textarea); // wichtig beim Laden
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
				handleTextareaInput(textarea); // wichtig beim Laden
			}
		});
	});
	updateTextareaStates();
}

// 📝 Textarea-Input mit Reaktion auf Tippen
document.querySelectorAll('textarea').forEach(textarea => {
	textarea.addEventListener('input', () => {
		handleTextareaInput(textarea);
	});
});

// ▶️ Start
window.addEventListener('DOMContentLoaded', () => {
	loadDataFromLocalStorage();
	updateTextareaStates();
});
