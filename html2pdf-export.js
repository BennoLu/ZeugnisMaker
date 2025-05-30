document.getElementById("export-pdf").addEventListener("click", async () => {
  const container  = document.getElementById("pdf-container");
	const kindBlocks = document.querySelectorAll(".kind-block");
	const teacher    = document.querySelector(".teacher-name")?.value.trim() || "";
	const className  = document.querySelector(".class-name")?.value.trim() || "";
	const rawDate    = document.querySelector(".date-field")?.value || "";
	const formattedDate = rawDate
	? rawDate.split("-").reverse().join(".")
	: "";

	// clear & show the container
	container.innerHTML = "";
	container.style.display = "block";

  kindBlocks.forEach(block => {
    const childName = block.querySelector(".kind-name")?.value.trim() || "(kein Name)";
	const page = document.createElement("div");
	page.classList.add("pdf-page");

	// background
	const bg = document.createElement("img");
	bg.src = "BG.png";
	bg.classList.add("background-image");
	page.appendChild(bg);

	// header
	page.innerHTML += `
	<div class="kind-zeugnis">Kinderzeugnis für</div>
	<div class="class-schule">GGS Balthasarstraße</div>
	<div class="kind-name">${childName}</div>
	${className ? `<div class="class-name">Klasse ${className}</div>` : ""}
	${teacher ? `<div class="teacher-name">${teacher}</div>` : ""}
	${formattedDate ? `<div class="pdf-date">${formattedDate}</div>` : ""}
	`;

	// Kompetenzen
	const komCont = document.createElement("div");
	komCont.classList.add("kompetenzen-container");
    block.querySelectorAll(".kompetenzbereich div").forEach(w => {
      const txt = w.querySelector(".dropzone")?.textContent.replace("×","").trim() || "";
	const cmt = w.querySelector("textarea")?.value.trim() || "";
	if (txt || cmt) {
        const item = document.createElement("div");
	item.classList.add("item-wrapper");
	const p = document.createElement("p");
	p.textContent = txt + cmt; // safely inserts any “<”, “&”, etc.
	item.appendChild(p);
	komCont.appendChild(item);
      }
    });
	if (komCont.children.length) page.appendChild(komCont);

	// Lernziele
	const lernCont = document.createElement("div");
	lernCont.classList.add("lernziele-container");
    block.querySelectorAll(".lernzielbereich div").forEach(w => {
      const txt = w.querySelector(".dropzone")?.textContent.replace("×","").trim() || "";
	const cmt = w.querySelector("textarea")?.value.trim() || "";
	if (txt || cmt) {
        const item = document.createElement("div");
	item.classList.add("item-wrapper");
	const p = document.createElement("p");
	p.textContent = txt + cmt; // safely inserts any “<”, “&”, etc.
	item.appendChild(p);
	lernCont.appendChild(item);
      }
    });
	if (lernCont.children.length) page.appendChild(lernCont);

	container.appendChild(page);
  });

	// generate PDF: one page per `.pdf-page`, thanks to pagebreak.after
	await html2pdf()
	.set({
	margin: 0,
	filename: 'zeugnisse.pdf',
	html2canvas: { scale: 3, useCORS: true },
	jsPDF: {unit: 'mm', format: 'a4', orientation: 'portrait' },
	pagebreak:   {
	mode: ['css'],
	after: '.pdf-page'
      }
    })
	.from(container)
	.save();

	// hide it again
	container.style.display = "none";
});

