// Grok search via the xAI **Responses API** (Agent Tools).
//
// The previous implementation used xAI "Live Search" (search_parameters on the
// Chat Completions endpoint). xAI removed it, so every call now fails with:
//   xAI 410: Live search is deprecated. Please switch to the Agent Tools API
//
// We migrate to POST https://api.x.ai/v1/responses with the server-side search
// tools `web_search` and `x_search`. The old knobs (mode, from_date, to_date,
// language, max_results) have no first-class field in the Responses API, so we
// map `mode` onto the tool selection and fold the rest into the instruction
// text — the model then constrains its own tool calls accordingly.

const XAI_RESPONSES_URL = "https://api.x.ai/v1/responses";

export type GrokMode = "auto" | "web" | "x" | "news";

export interface GrokSearchParams {
  query: string;
  mode?: GrokMode;
  from_date?: string; // YYYY-MM-DD
  to_date?: string; // YYYY-MM-DD
  language?: string; // ex: 'fr', 'en'
  max_results?: number;
}

// Configurable so the model can be bumped without a code change. `grok-4-latest`
// is a rolling alias to the current Grok 4 flagship; override with XAI_MODEL
// (e.g. `grok-4`, `grok-4-fast`, `grok-4.5`).
function xaiModel(): string {
  return process.env.XAI_MODEL || "grok-4-latest";
}

// `mode` selects which server-side search tools Grok may call.
function toolsForMode(mode: GrokMode): Array<{ type: string }> {
  switch (mode) {
    case "web":
    case "news":
      return [{ type: "web_search" }];
    case "x":
      return [{ type: "x_search" }];
    case "auto":
    default:
      return [{ type: "web_search" }, { type: "x_search" }];
  }
}

function buildInstruction(p: GrokSearchParams): string {
  const mode = p.mode ?? "auto";
  const directives: string[] = [];
  if (mode === "news") {
    directives.push(
      "Privilégie l'actualité récente et les articles de presse pertinents.",
    );
  }
  if (p.from_date || p.to_date) {
    const from = p.from_date ?? "l'origine";
    const to = p.to_date ?? "aujourd'hui";
    directives.push(`Ne retiens que des informations datées entre ${from} et ${to}.`);
  }
  if (p.max_results) {
    directives.push(
      `Appuie-toi sur au plus ${p.max_results} sources, les plus fiables et pertinentes.`,
    );
  }
  if (p.language) {
    directives.push(`Rédige la réponse en langue « ${p.language} ».`);
  }
  directives.push(
    "Fournis une synthèse factuelle et cite systématiquement tes sources (URLs).",
  );
  return `${directives.join(" ")}\n\nQuestion : ${p.query}`;
}

// The Responses API returns an `output` array whose items carry a `content`
// array; the assistant text lives in items of type `output_text`.
function extractText(resp: unknown): string {
  const r = resp as Record<string, unknown>;
  if (typeof r.output_text === "string" && r.output_text.length > 0) {
    return r.output_text;
  }
  const output = Array.isArray(r.output) ? r.output : [];
  const parts: string[] = [];
  for (const item of output) {
    const content = (item as Record<string, unknown>)?.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      const block = c as Record<string, unknown>;
      if (typeof block.text === "string") parts.push(block.text);
    }
  }
  return parts.join("\n").trim();
}

// Citations may surface either as a top-level `citations` array or as
// `annotations` (url_citation) attached to text blocks. Collect both.
function extractCitations(resp: unknown): unknown[] {
  const r = resp as Record<string, unknown>;
  if (Array.isArray(r.citations)) return r.citations;
  const cites: unknown[] = [];
  const output = Array.isArray(r.output) ? r.output : [];
  for (const item of output) {
    const content = (item as Record<string, unknown>)?.content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      const annotations = (c as Record<string, unknown>)?.annotations;
      if (!Array.isArray(annotations)) continue;
      for (const a of annotations) {
        const ann = a as Record<string, unknown>;
        if (ann.url || ann.type === "url_citation") cites.push(ann);
      }
    }
  }
  return cites;
}

export async function search(p: GrokSearchParams): Promise<unknown> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY must be set in .env");
  }

  const mode = p.mode ?? "auto";
  const model = xaiModel();
  const body = {
    model,
    input: [{ role: "user", content: buildInstruction(p) }],
    tools: toolsForMode(mode),
  };

  const res = await fetch(XAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`xAI ${res.status} on /v1/responses: ${text}`);
  }

  const json = await res.json();
  const r = json as Record<string, unknown>;
  return {
    model,
    mode,
    text: extractText(json),
    citations: extractCitations(json),
    usage: r.usage ?? r.server_side_tool_usage,
  };
}
