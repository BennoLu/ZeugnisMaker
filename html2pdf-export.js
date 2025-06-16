function setupPDFExport(buttonId, rangeStart, rangeEnd, fileName) {
	document.getElementById(buttonId).addEventListener("click", async () => {
		const container = document.getElementById("pdf-container");
		const allBlocks = Array.from(document.querySelectorAll(".kind-block")).slice(rangeStart, rangeEnd);
		const teacher = document.querySelector(".teacher-name")?.value.trim() || "";
		const className = document.querySelector(".class-name")?.value.trim() || "";
		const rawDate = document.querySelector(".date-field")?.value || "";
		const formattedDate = rawDate ? rawDate.split("-").reverse().join(".") : "";

		if (allBlocks.length === 0) {
			alert("Keine Kinder im ausgewählten Bereich.");
			return;
		}

		const isMobile = /Mobi|Android/i.test(navigator.userAgent);
		const scale = isMobile ? 1.5 : 2.5;

		// Clear & show container
		container.innerHTML = "";
		container.style.display = "block";

		for (const block of allBlocks) {
			const childName = block.querySelector(".kind-name")?.value.trim() || "(kein Name)";
			const page = document.createElement("div");
			page.classList.add("pdf-page");

			const bg = document.createElement("img");
			bg.src = "../BG.png";
			bg.classList.add("background-image");
			page.appendChild(bg);

			[
				{ cls: "kind-zeugnis", text: "Kinderzeugnis für" },
				{ cls: "class-schule", text: "GGS Balthasarstraße" },
				{ cls: "kind-name", text: childName }
			].forEach(({ cls, text }) => {
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

		// Wait for all images to load
		await new Promise((resolve) => {
			const images = container.querySelectorAll("img");
			let loaded = 0;
			if (images.length === 0) resolve();
			images.forEach(img => {
				if (img.complete) {
					loaded++;
					if (loaded === images.length) resolve();
				} else {
					img.onload = img.onerror = () => {
						loaded++;
						if (loaded === images.length) resolve();
					};
				}
			});
		});

		// Export PDF
		await html2pdf()
			.set({
				margin: 0,
				filename: fileName,
				html2canvas: { scale: scale, useCORS: true },
				jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
				pagebreak: { mode: ['css'], after: '.pdf-page' }
			})
			.from(container)
			.save();

		container.style.display = "none";
	});
}

// Setup buttons
setupPDFExport("export-1", 0, 10, "zeugnisse-1-10.pdf");
setupPDFExport("export-2", 10, 20, "zeugnisse-11-20.pdf");
setupPDFExport("export-3", 20, 27, "zeugnisse-21-27.pdf");
