// The Visual Editor shows code blocks as plain text and owns their DOM, so colours
// go on as CSS Custom Highlight ranges (`::highlight(prism-*)` in prism.css).

// Token types prism.css colours; other tokens take their nearest coloured parent's.
const STYLED = new Set([
	'comment', 'prolog', 'doctype', 'cdata', 'punctuation', 'property', 'tag', 'constant',
	'symbol', 'deleted', 'boolean', 'number', 'selector', 'attr-name', 'string', 'char',
	'builtin', 'inserted', 'operator', 'entity', 'url', 'variable', 'atrule', 'attr-value',
	'function', 'class-name', 'keyword', 'regex', 'important'
]);

const typesOf = (token) => [token.type, ...[].concat(token.alias ?? [])];

function collectSpans(tokens, offset, inherited, spans) {
	for (const token of tokens) {
		if (typeof token === 'string') {
			if (inherited) spans.push([inherited, offset, offset + token.length]);
			offset += token.length;
			continue;
		}
		const own = typesOf(token).find((type) => STYLED.has(type)) ?? inherited;
		const content = typeof token.content === 'string' ? [token.content] : [].concat(token.content);
		offset = collectSpans(content, offset, own, spans);
	}
	return offset;
}

function rangesFor(code, Prism) {
	const language = /\blanguage-(\S+)/.exec(code.className)?.[1];
	const grammar = language && Prism.languages[language];
	if (!grammar) return [];

	const nodes = [];
	let text = '';
	const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		nodes.push({ node, start: text.length });
		text += node.data;
	}

	const locate = (offset) => {
		let i = nodes.length - 1;
		while (i > 0 && nodes[i].start > offset) i--;
		return [nodes[i].node, offset - nodes[i].start];
	};

	const spans = [];
	collectSpans(Prism.tokenize(text, grammar), 0, null, spans);
	return spans.map(([type, start, end]) => {
		const range = new Range();
		range.setStart(...locate(start));
		range.setEnd(...locate(end));
		return [type, range];
	});
}

export async function highlightEditorCode() {
	if (!globalThis.CSS?.highlights) return;

	// Stops Prism highlighting the page itself, which would rewrite the editor's DOM.
	globalThis.Prism = { manual: true };
	const { default: Prism } = await import('prismjs');
	globalThis.Prism = Prism;
	await import('prism-svelte');

	let queued = false;
	const run = () => {
		queued = false;
		const highlights = new Map();
		for (const code of document.querySelectorAll('[data-editable="text"] pre > code')) {
			for (const [type, range] of rangesFor(code, Prism)) {
				if (!highlights.has(type)) highlights.set(type, new Highlight());
				highlights.get(type).add(range);
			}
		}
		for (const name of [...CSS.highlights.keys()]) {
			if (name.startsWith('prism-')) CSS.highlights.delete(name);
		}
		for (const [type, highlight] of highlights) CSS.highlights.set(`prism-${type}`, highlight);
	};
	const queue = () => {
		if (queued) return;
		queued = true;
		requestAnimationFrame(run);
	};

	new MutationObserver(queue).observe(document.body, {
		subtree: true,
		childList: true,
		characterData: true,
		attributes: true,
		attributeFilter: ['class']
	});
	queue();
}
