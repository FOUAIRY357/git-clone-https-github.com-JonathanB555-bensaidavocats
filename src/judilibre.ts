import { pisteFetch } from "./auth.js";

const BASE = "/cassation/judilibre/v1.0";

export type Jurisdiction = "cc" | "ce" | "ca" | "tj";

export interface SearchParams {
  query: string;
  jurisdiction?: Jurisdiction[];
  date_start?: string;
  date_end?: string;
  chamber?: string[];
  formation?: string[];
  publication?: string[];
  solution?: string[];
  page?: number;
  page_size?: number;
  sort?: "score" | "date";
  order?: "asc" | "desc";
}

function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      for (const item of v) sp.append(k, String(item));
    } else {
      sp.append(k, String(v));
    }
  }
  return sp.toString();
}

export async function search(p: SearchParams): Promise<unknown> {
  const params: Record<string, unknown> = {
    query: p.query,
    jurisdiction: p.jurisdiction ?? ["cc", "ce"],
    date_start: p.date_start,
    date_end: p.date_end,
    chamber: p.chamber,
    formation: p.formation,
    publication: p.publication,
    solution: p.solution,
    page: p.page ?? 0,
    page_size: p.page_size ?? 10,
    sort: p.sort ?? "score",
    order: p.order ?? "desc",
  };
  return pisteFetch(`${BASE}/search?${qs(params)}`);
}

export async function getDecision(id: string): Promise<unknown> {
  return pisteFetch(`${BASE}/decision?${qs({ id })}`);
}

export async function taxonomy(id: string, context_value?: string): Promise<unknown> {
  return pisteFetch(`${BASE}/taxonomy?${qs({ id, context_value })}`);
}
