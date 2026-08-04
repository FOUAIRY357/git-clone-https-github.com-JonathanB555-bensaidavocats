import { pisteFetch } from "./auth.js";

const BASE = "/dila/legifrance/lf-engine-app";

export interface SearchParams {
  query: string;
  fond?:
    | "CODE_DATE"
    | "LODA_DATE"
    | "JURI"
    | "JORF"
    | "CNIL"
    | "CETAT"
    | "CONSTIT"
    | "ALL";
  pageSize?: number;
  pageNumber?: number;
  sort?: "PERTINENCE" | "DATE_ASC" | "DATE_DESC";
}

export async function search(p: SearchParams): Promise<unknown> {
  const body = {
    recherche: {
      champs: [
        {
          typeChamp: "ALL",
          criteres: [
            {
              typeRecherche: "EXACTE",
              valeur: p.query,
              operateur: "ET",
            },
          ],
          operateur: "ET",
        },
      ],
      pageSize: p.pageSize ?? 10,
      pageNumber: p.pageNumber ?? 1,
      sort: p.sort ?? "PERTINENCE",
      typePagination: "DEFAUT",
    },
    fond: p.fond ?? "ALL",
  };
  return pisteFetch(`${BASE}/search`, { method: "POST", json: body });
}

export async function getArticle(id: string): Promise<unknown> {
  return pisteFetch(`${BASE}/consult/getArticle`, {
    method: "POST",
    json: { id },
  });
}

const LEGITEXT_RE = /^LEGITEXT\d+$/i;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Recursively walk a lf-engine-app payload (code tree or search results) and
// return the LEGIARTI id of the article whose `num` matches exactly. Keys on
// `id`/`num` (the primary article fields), which avoids matching the `articleId`
// /`articleNum` pairs found inside citation/modification link lists.
function findLegiArtiId(node: unknown, num: string): string | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findLegiArtiId(item, num);
      if (found) return found;
    }
    return null;
  }
  const obj = node as Record<string, unknown>;
  const id = typeof obj.id === "string" ? obj.id : undefined;
  const objNum = obj.num != null ? String(obj.num) : undefined;
  if (id && /^LEGIARTI/i.test(id) && objNum === String(num)) {
    return id;
  }
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      const found = findLegiArtiId(value, num);
      if (found) return found;
    }
  }
  return null;
}

// Accept a code name ("Code civil") or its LEGITEXT id and return the LEGITEXT.
async function resolveTextId(code: string): Promise<string> {
  if (LEGITEXT_RE.test(code)) return code;

  const list = (await listCodes()) as Record<string, unknown>;
  const results = Array.isArray(list.results) ? list.results : [];
  const target = normalize(code);

  const titleOf = (r: Record<string, unknown>): string =>
    (typeof r.titre === "string" && r.titre) ||
    (typeof r.title === "string" && r.title) ||
    "";
  const idOf = (r: Record<string, unknown>): string | undefined =>
    (typeof r.cid === "string" && r.cid) ||
    (typeof r.id === "string" && r.id) ||
    (typeof r.textId === "string" && r.textId) ||
    undefined;

  for (const r of results as Array<Record<string, unknown>>) {
    if (normalize(titleOf(r)) === target) {
      const id = idOf(r);
      if (id) return id;
    }
  }
  for (const r of results as Array<Record<string, unknown>>) {
    const t = titleOf(r);
    if (t && normalize(t).includes(target)) {
      const id = idOf(r);
      if (id) return id;
    }
  }
  throw new Error(
    `Code introuvable: "${code}". Fournissez un identifiant LEGITEXT ou un intitulé exact (voir legifrance_list_codes).`,
  );
}

// Fetch a code article by its number.
//
// Bug fixed here: the deployed server called POST /consult/getArticleByNum,
// which is not a real lf-engine-app endpoint — PISTE's gateway answers 403 for
// it even though the OAuth token and Légifrance subscription are valid (POST
// /consult/getArticle works with the same credentials). We resolve the article
// to its LEGIARTI id using real endpoints (/consult/code, and /search as a
// fallback), then return the clean full text via /consult/getArticle.
export async function getArticleByNum(
  code: string,
  num: string,
  date?: string,
): Promise<unknown> {
  const day = date ?? new Date().toISOString().slice(0, 10);
  const textId = await resolveTextId(code);

  // Primary path: consult the code and locate the article in its tree.
  const consult = await pisteFetch(`${BASE}/consult/code`, {
    method: "POST",
    json: { textId, searchedString: num, date: day },
  });
  let legiArtiId = findLegiArtiId(consult, num);

  // Fallback: full-text search restricted to this code + article number.
  if (!legiArtiId) {
    const searchRes = await pisteFetch(`${BASE}/search`, {
      method: "POST",
      json: {
        recherche: {
          champs: [
            {
              typeChamp: "NUM_ARTICLE",
              criteres: [
                { typeRecherche: "EXACTE", valeur: num, operateur: "ET" },
              ],
              operateur: "ET",
            },
          ],
          filtres: [{ facette: "TEXT_ID", valeurs: [textId] }],
          pageSize: 10,
          pageNumber: 1,
          sort: "PERTINENCE",
          typePagination: "ARTICLE",
        },
        fond: "CODE_DATE",
      },
    });
    legiArtiId = findLegiArtiId(searchRes, num);
  }

  if (!legiArtiId) {
    throw new Error(
      `Article ${num} introuvable dans le code ${textId} à la date ${day}`,
    );
  }
  return getArticle(legiArtiId);
}

export async function listCodes(): Promise<unknown> {
  return pisteFetch(`${BASE}/list/code`, {
    method: "POST",
    json: {
      sort: "TITLE_ASC",
      pageNumber: 1,
      pageSize: 50,
      states: ["VIGUEUR"],
    },
  });
}
