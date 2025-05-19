// 👶 Initialize Sortable for each dropzone
document.querySelectorAll('.dropzone').forEach(zone => {
	new Sortable(zone, {
		group: 'kompetenzen', // Shared group to allow dragging between zones
		animation: 150,
		onAdd: () => {
			saveDataToLocalStorage();
			updateTextareaStates();
		},
		onRemove: () => {
			saveDataToLocalStorage();
			updateTextareaStates();
		}
	});
});

// 📦 Make the kompetenz list draggable too (the source)
new Sortable(document.querySelector('.bottom'), {
	group: {
		name: 'kompetenzen',
		pull: 'clone', // Allow copying
		put: false     // Disallow dropping into original list
	},
	sort: false     // Prevent reordering in source
});

// 🧠 Enable/disable textareas depending on dropzone contents
function updateTextareaStates() {
	document.querySelectorAll('.dropzone').forEach(zone => {
		const textarea = zone.nextElementSibling;
		if (!textarea) return;

		if (zone.children.length > 0) {
			textarea.value = '';
			textarea.disabled = true;
			textarea.classList.add('disabled-input');
		} else {
			textarea.disabled = false;
			textarea.classList.remove('disabled-input');
		}
	});
}

// 💾 Save to localStorage
function saveDataToLocalStorage() {
	const data = [];

	document.querySelectorAll('.kind-block').forEach(block => {
		const kindName = block.querySelector('.kind-name').value;

		const kompetenzen = [...block.querySelectorAll('.kompetenzbereich .dropzone')].map(zone => ({
			items: [...zone.children].map(el => el.textContent.trim()),
			textarea: zone.nextElementSibling?.value || '',
			disabled: zone.nextElementSibling?.disabled || false
		}));

		const lernziele = [...block.querySelectorAll('.lernzielbereich .dropzone')].map(zone => ({
			items: [...zone.children].map(el => el.textContent.trim()),
			textarea: zone.nextElementSibling?.value || '',
			disabled: zone.nextElementSibling?.disabled || false
		}));

		data.push({ kindName, kompetenzen, lernziele });
	});

	localStorage.setItem('kompetenzformular', JSON.stringify(data));
}

// 🔁 Restore from localStorage
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
			});
			const textarea = zone.nextElementSibling;
			if (textarea) {
				textarea.value = k.textarea;
				textarea.disabled = k.disabled;
				textarea.classList.toggle('disabled-input', k.disabled);
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
			});
			const textarea = zone.nextElementSibling;
			if (textarea) {
				textarea.value = l.textarea;
				textarea.disabled = l.disabled;
				textarea.classList.toggle('disabled-input', l.disabled);
			}
		});
	});
	updateTextareaStates();
}

// 🟡 React to manual input in textareas
document.querySelectorAll('textarea').forEach(textarea => {
	textarea.addEventListener('input', () => {
		saveDataToLocalStorage();
		updateTextareaStates();
	});
});

// ▶️ Load on page ready
window.addEventListener('DOMContentLoaded', loadDataFromLocalStorage);
