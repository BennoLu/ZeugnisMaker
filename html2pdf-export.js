document.getElementById("export-pdf").addEventListener("click", async () => {
	const container = document.getElementById("pdf-container");
	const kindBlocks = document.querySelectorAll(".kind-block");
	const teacher = document.querySelector(".teacher-name")?.value.trim() || "";
	const className = document.querySelector(".class-name")?.value.trim() || "";
	const rawDate = document.querySelector(".date-field")?.value || "";
	const formattedDate = rawDate
		? rawDate.split("-").reverse().join(".")
		: "";

	// clear & show the container
	container.innerHTML = "";
	container.style.display = "block";

	for (const block of kindBlocks) {
		const childName = block.querySelector(".kind-name")?.value.trim() || "(kein Name)";
		const page = document.createElement("div");
		page.classList.add("pdf-page");

		// background image
		const bg = document.createElement("img");
		bg.src = "BG.png";
		bg.classList.add("background-image");
		page.appendChild(bg);

		// header elements (all textContent to escape '<', '&', etc.)
		const headerItems = [
			{ cls: "kind-zeugnis", text: "Kinderzeugnis für" },
			{ cls: "class-schule", text: "GGS Balthasarstraße" },
			{ cls: "kind-name", text: childName }
		];
		headerItems.forEach(({ cls, text }) => {
			const el = document.createElement("div");
			el.classList.add(cls);
			el.textContent = text;
			page.appendChild(el);
		});

		if (className) {
			const el = document.createElement("div");
			el.classList.add("class-name");
			el.textContent = `Klasse ${className}`;
			page.appendChild(el);
		}
		if (teacher) {
			const el = document.createElement("div");
			el.classList.add("teacher-name");
			el.textContent = teacher;
			page.appendChild(el);
		}
		if (formattedDate) {
			const el = document.createElement("div");
			el.classList.add("pdf-date");
			el.textContent = formattedDate;
			page.appendChild(el);
		}

		// Kompetenzen
		const komCont = document.createElement("div");
		komCont.classList.add("kompetenzen-container");
		block.querySelectorAll(".kompetenzbereich div").forEach(w => {
			const txt = w.querySelector(".dropzone")?.textContent.replace("×", "").trim() || "";
			const cmt = w.querySelector("textarea")?.value.trim() || "";
			if (txt || cmt) {
				const item = document.createElement("div");
				item.classList.add("item-wrapper");
				const p = document.createElement("p");
				p.textContent = txt + cmt;
				item.appendChild(p);
				komCont.appendChild(item);
			}
		});
		if (komCont.children.length) page.appendChild(komCont);

		// Lernziele
		const lernCont = document.createElement("div");
		lernCont.classList.add("lernziele-container");
		block.querySelectorAll(".lernzielbereich div").forEach(w => {
			const txt = w.querySelector(".dropzone")?.textContent.replace("×", "").trim() || "";
			const cmt = w.querySelector("textarea")?.value.trim() || "";
			if (txt || cmt) {
				const item = document.createElement("div");
				item.classList.add("item-wrapper");
				const p = document.createElement("p");
				p.textContent = txt + cmt;
				item.appendChild(p);
				lernCont.appendChild(item);
			}
		});
		if (lernCont.children.length) page.appendChild(lernCont);

		container.appendChild(page);
	}

	// generate PDF: use CSS breaks only, with 'after' to avoid extra blank pages
	await html2pdf()
		.set({
			margin: 0,
			filename: 'zeugnisse.pdf',
			html2canvas: { scale: 3, useCORS: true },
			jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
			pagebreak: { mode: ['css'], after: '.pdf-page' }
		})
		.from(container)
		.save();

	// hide it again
	container.style.display = "none";
});
  