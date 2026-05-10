import { api } from "./api";
import type { Badge } from "./gamification";

export type SandboxStatus =
  | "ok"
  | "syntax_error"
  | "execution_error"
  | "timeout"
  | "forbidden";

export interface SandboxQueryResult {
  columns: string[];
  rows: Array<Array<string | number | boolean | null>>;
  rowcount: number;
}

export interface SandboxExecuteResponse {
  status: SandboxStatus;
  message?: string;
  result?: SandboxQueryResult;
  badges_earned: Badge[];
}

export interface SandboxColumn {
  name: string;
  data_type: string;
  is_nullable: boolean;
}

export interface SandboxTable {
  name: string;
  row_count: number;
  columns: SandboxColumn[];
}

export interface SandboxSchemaResponse {
  tables: SandboxTable[];
}

export function executeSandboxQuery(sqlText: string) {
  return api<SandboxExecuteResponse>("/sandbox/execute/", {
    method: "POST",
    body: JSON.stringify({ sql_text: sqlText }),
  });
}

export function fetchSandboxSchema() {
  return api<SandboxSchemaResponse>("/sandbox/schema/");
}

export function resetSandbox() {
  return api<{ status: "reset" }>("/sandbox/reset/", { method: "POST" });
}
