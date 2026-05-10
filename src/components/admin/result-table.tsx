"use client";

interface ResultTableProps {
  columns: string[];
  rows: Array<Array<string | number | boolean | null>>;
  caption?: string;
  maxRows?: number;
}

export function ResultTable({
  columns,
  rows,
  caption,
  maxRows = 50,
}: ResultTableProps) {
  const truncated = rows.length > maxRows;
  const display = truncated ? rows.slice(0, maxRows) : rows;

  if (columns.length === 0) {
    return (
      <p className="result-table__empty">
        Query returned no columns.
      </p>
    );
  }

  return (
    <div className="result-table-wrap">
      {caption ? (
        <p className="result-table__caption">{caption}</p>
      ) : null}
      <div className="result-table-scroll">
        <table className="result-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="result-table__empty-row"
                >
                  No rows returned.
                </td>
              </tr>
            ) : (
              display.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{formatCell(cell)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="result-table__meta">
        {rows.length.toLocaleString()} {rows.length === 1 ? "row" : "rows"}
        {truncated ? ` · showing first ${maxRows}` : ""}
      </p>
    </div>
  );
}

function formatCell(cell: string | number | boolean | null): string {
  if (cell === null) return "NULL";
  if (typeof cell === "boolean") return cell ? "true" : "false";
  return String(cell);
}
