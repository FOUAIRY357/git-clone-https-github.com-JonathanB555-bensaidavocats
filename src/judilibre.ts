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

export interface DecisionFile {
  id: string;
  name?: string;
  type?: string;
  size?: string;
  date?: string;
  url?: string; // search.judilibre.io link — JS/cookie protected (anti-bot)
  rawUrl?: string; // direct S3 link — serves the actual PDF
}

function filesOf(decision: unknown): DecisionFile[] {
  const files = (decision as Record<string, unknown>)?.files;
  return Array.isArray(files) ? (files as DecisionFile[]) : [];
}

export async function getDecisionFiles(id: string): Promise<unknown> {
  const decision = await getDecision(id);
  return { id, files: filesOf(decision) };
}

const JS_PROTECTED_HOST = "search.judilibre.io";

export interface DownloadedPdf {
  name?: string;
  content_type: string;
  bytes: number;
  data_base64: string;
  source_url: string;
}

// Download a decision's attached PDF.
//
// Bug fixed here: the `url` field returned by Judilibre points at
// https://search.judilibre.io/decision?id=…&fileId=… which is JS/cookie
// protected and answers with a ~222-byte anti-bot HTML page ("This website
// requires JS enabled and cookies") — not the PDF. The file's `rawUrl` is a
// direct S3 link that serves the real PDF. So when handed a search.judilibre.io
// link we resolve the file's `rawUrl` (via the decision) and fetch that. We
// also refuse any response whose content-type is not application/pdf instead
// of silently returning HTML.
export async function downloadPdf(url: string): Promise<DownloadedPdf> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`URL invalide: ${url}`);
  }

  let targetUrl = url;
  let name: string | undefined;

  if (parsed.hostname.includes(JS_PROTECTED_HOST)) {
    const decisionId = parsed.searchParams.get("id");
    const fileId = parsed.searchParams.get("fileId");
    if (!decisionId || !fileId) {
      throw new Error(
        `Lien search.judilibre.io sans id/fileId exploitables: ${url}`,
      );
    }
    const decision = await getDecision(decisionId);
    const file = filesOf(decision).find((f) => f.id === fileId);
    if (!file) {
      throw new Error(
        `Fichier ${fileId} introuvable dans la décision ${decisionId}`,
      );
    }
    if (!file.rawUrl) {
      throw new Error(
        `Le fichier ${fileId} n'expose pas de rawUrl (lien S3 direct)`,
      );
    }
    targetUrl = file.rawUrl;
    name = file.name;
  }

  const res = await fetch(targetUrl);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Téléchargement PDF échoué (${res.status}) sur ${targetUrl}: ${text.slice(0, 200)}`,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/pdf")) {
    const preview = (await res.text().catch(() => "")).slice(0, 200);
    throw new Error(
      `Réponse non-PDF (content-type: ${contentType || "inconnu"}) sur ${targetUrl}. ` +
        `Attendu application/pdf — le lien est probablement protégé (anti-bot). Aperçu: ${preview}`,
    );
  }

  const buf = Buffer.from(await res.arrayBuffer());
  return {
    name,
    content_type: contentType,
    bytes: buf.length,
    data_base64: buf.toString("base64"),
    source_url: targetUrl,
  };
}

export async function taxonomy(id: string, context_value?: string): Promise<unknown> {
  return pisteFetch(`${BASE}/taxonomy?${qs({ id, context_value })}`);
}
