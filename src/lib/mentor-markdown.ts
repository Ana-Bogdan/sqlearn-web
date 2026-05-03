import { Marked, marked } from "marked";

// A separate, narrower marked configuration for AI Mentor messages so we
// don't pollute the lesson-theory renderer. The output uses .mentor-md*
// classes that are styled tightly for chat bubbles (smaller code blocks,
// inline-friendly headings).

const SQL_KEYWORDS = new Set(
  [
    "SELECT",
    "FROM",
    "WHERE",
    "AND",
    "OR",
    "NOT",
    "IN",
    "IS",
    "NULL",
    "LIKE",
    "BETWEEN",
    "ORDER",
    "BY",
    "ASC",
    "DESC",
    "LIMIT",
    "OFFSET",
    "GROUP",
    "HAVING",
    "DISTINCT",
    "AS",
    "JOIN",
    "INNER",
    "LEFT",
    "RIGHT",
    "FULL",
    "OUTER",
    "ON",
    "UNION",
    "ALL",
    "INSERT",
    "INTO",
    "VALUES",
    "UPDATE",
    "SET",
    "DELETE",
    "CASE",
    "WHEN",
    "THEN",
    "ELSE",
    "END",
    "WITH",
    "EXISTS",
    "CAST",
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
    "COALESCE",
    "NULLIF",
    "TRUE",
    "FALSE",
  ].map((k) => k.toUpperCase()),
);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightSql(raw: string): string {
  const source = raw;
  let out = "";
  let i = 0;
  const n = source.length;

  while (i < n) {
    const ch = source[i];

    if (ch === "-" && source[i + 1] === "-") {
      const end = source.indexOf("\n", i);
      const stop = end === -1 ? n : end;
      out += `<span class="tok-comment">${escapeHtml(source.slice(i, stop))}</span>`;
      i = stop;
      continue;
    }

    if (ch === "'") {
      let j = i + 1;
      while (j < n) {
        if (source[j] === "'" && source[j + 1] === "'") {
          j += 2;
          continue;
        }
        if (source[j] === "'") {
          j += 1;
          break;
        }
        j += 1;
      }
      out += `<span class="tok-string">${escapeHtml(source.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    if (ch === '"') {
      const end = source.indexOf('"', i + 1);
      const stop = end === -1 ? n : end + 1;
      out += `<span class="tok-ident">${escapeHtml(source.slice(i, stop))}</span>`;
      i = stop;
      continue;
    }

    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < n && /[0-9_.]/.test(source[j])) j += 1;
      out += `<span class="tok-number">${escapeHtml(source.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(source[j])) j += 1;
      const word = source.slice(i, j);
      if (SQL_KEYWORDS.has(word.toUpperCase())) {
        out += `<span class="tok-keyword">${escapeHtml(word)}</span>`;
      } else {
        out += escapeHtml(word);
      }
      i = j;
      continue;
    }

    if (/[=<>!+\-*/%(),;]/.test(ch)) {
      out += `<span class="tok-punct">${escapeHtml(ch)}</span>`;
      i += 1;
      continue;
    }

    out += escapeHtml(ch);
    i += 1;
  }

  return out;
}

const renderer = new marked.Renderer();

renderer.code = ({ text, lang }) => {
  const language = (lang ?? "").trim().toLowerCase();
  if (language === "sql" || language === "postgresql" || language === "plpgsql") {
    return `<pre class="mentor-md-code mentor-md-code-sql"><code>${highlightSql(text)}</code></pre>`;
  }
  return `<pre class="mentor-md-code"><code>${escapeHtml(text)}</code></pre>`;
};

renderer.codespan = ({ text }) => {
  return `<code class="mentor-md-inline-code">${text}</code>`;
};

renderer.heading = ({ text, depth }) => {
  // Flatten headings to bolded paragraphs — drawer space is too tight for
  // hierarchical headings.
  const tag = depth >= 4 ? "h4" : "p";
  return `<${tag} class="mentor-md-heading mentor-md-heading--h${depth}">${text}</${tag}>`;
};

const mentorMarked = new Marked({ renderer, gfm: true, breaks: true });

export function renderMentorMarkdown(source: string): string {
  return mentorMarked.parse(source, { async: false }) as string;
}

// Pull the first SQL fenced block out so the user can insert it directly
// into the editor. Returns null when no SQL block is present.
const SQL_FENCE_RE = /```(?:sql|postgresql|plpgsql)\s*\n([\s\S]*?)```/i;

export function extractFirstSqlBlock(markdown: string): string | null {
  const match = SQL_FENCE_RE.exec(markdown);
  if (!match) return null;
  const code = match[1].trim();
  return code.length > 0 ? code : null;
}
