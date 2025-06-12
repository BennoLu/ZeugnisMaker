

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
