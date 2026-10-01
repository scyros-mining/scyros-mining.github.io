/* A small C highlighter for the code listings on the study page. It is not a
   parser: one regular expression picks out comments, preprocessor lines,
   strings, numbers, calls and words, which is enough for short listings.
   Each line becomes its own element so CSS can number it. Without
   JavaScript the listing stays plain text. */

const C_KEYWORDS = new Set(('break case const continue default do else enum extern for goto if inline ' +
  'register restrict return sizeof static struct switch typedef union volatile while').split(' '));
const C_TYPES = new Set(('bool char double float int long short signed unsigned void size_t ' +
  'int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t').split(' '));

const C_TOKEN = new RegExp([
  String.raw`(\/\*[\s\S]*?\*\/|\/\/[^\n]*)`,
  String.raw`(^[ \t]*#[^\n]*)`,
  String.raw`("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')`,
  String.raw`\b(\d[\w.]*)`,
  String.raw`\b([A-Za-z_]\w*)(?=\s*\()`,
  String.raw`\b([A-Za-z_]\w*)\b`,
].join('|'), 'gm');

function classify(match) {
  const [text, comment, preprocessor, string, number, call] = match;
  if (comment) return 'tok-comment';
  if (preprocessor) return 'tok-preprocessor';
  if (string) return 'tok-string';
  if (number) return 'tok-number';
  if (C_KEYWORDS.has(text)) return 'tok-keyword';
  if (C_TYPES.has(text)) return 'tok-type';
  if (call) return 'tok-function';
  return null;
}

function* tokensOf(code) {
  let last = 0;
  for (const match of code.matchAll(C_TOKEN)) {
    if (match.index > last) yield { text: code.slice(last, match.index), kind: null };
    yield { text: match[0], kind: classify(match) };
    last = match.index + match[0].length;
  }
  if (last < code.length) yield { text: code.slice(last), kind: null };
}

function highlightListing(pre) {
  const lines = [[]];
  for (const { text, kind } of tokensOf(pre.textContent)) {
    text.split('\n').forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, kind });
    });
  }
  pre.replaceChildren(...lines.map((parts) => {
    const line = document.createElement('span');
    line.className = 'line';
    for (const { text, kind } of parts) {
      if (!kind) { line.append(text); continue; }
      const token = document.createElement('span');
      token.className = kind;
      token.textContent = text;
      line.append(token);
    }
    return line;
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre[data-lang="c"]').forEach(highlightListing);
});
