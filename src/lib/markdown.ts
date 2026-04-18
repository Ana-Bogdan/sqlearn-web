import { marked } from "marked";

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
    "CREATE",
    "TABLE",
    "PRIMARY",
    "KEY",
    "FOREIGN",
    "REFERENCES",
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
    "VARCHAR",
    "INTEGER",
    "INT",
    "TEXT",
    "DATE",
    "NUMERIC",
    "BOOLEAN",
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

    // Line comment
    if (ch === "-" && source[i + 1] === "-") {
      const end = source.indexOf("\n", i);
      const stop = end === -1 ? n : end;
      out += `<span class="tok-comment">${escapeHtml(source.slice(i, stop))}</span>`;
      i = stop;
      continue;
    }

    // Block comment
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      const stop = end === -1 ? n : end + 2;
      out += `<span class="tok-comment">${escapeHtml(source.slice(i, stop))}</span>`;
      i = stop;
      continue;
    }

    // Single-quoted string (SQL escapes '' inside)
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

    // Double-quoted identifier
    if (ch === '"') {
      const end = source.indexOf('"', i + 1);
      const stop = end === -1 ? n : end + 1;
      out += `<span class="tok-ident">${escapeHtml(source.slice(i, stop))}</span>`;
      i = stop;
      continue;
    }

    // Number
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < n && /[0-9_.]/.test(source[j])) j += 1;
      out += `<span class="tok-number">${escapeHtml(source.slice(i, j))}</span>`;
      i = j;
      continue;
    }

    // Identifier / keyword
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

    // Punctuation/operator
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
    return `<pre class="md-code md-code-sql"><code>${highlightSql(text)}</code></pre>`;
  }
  return `<pre class="md-code"><code>${escapeHtml(text)}</code></pre>`;
};

renderer.codespan = ({ text }) => {
  return `<code class="md-inline-code">${text}</code>`;
};

renderer.table = ({ header, rows }) => {
  const head = header
    .map((cell) => {
      const align = cell.align ? ` style="text-align:${cell.align}"` : "";
      return `<th${align}>${cell.text}</th>`;
    })
    .join("");
  const body = rows
    .map((row) => {
      const cells = row
        .map((cell) => {
          const align = cell.align ? ` style="text-align:${cell.align}"` : "";
          return `<td${align}>${cell.text}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<div class="md-table-scroll"><table class="md-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
};

marked.use({ renderer, gfm: true, breaks: false });

export function renderTheoryMarkdown(source: string): string {
  return marked.parse(source, { async: false }) as string;
}
