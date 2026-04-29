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

export async function getArticleByNum(
  code: string,
  num: string,
  date?: string,
): Promise<unknown> {
  return pisteFetch(`${BASE}/consult/code`, {
    method: "POST",
    json: {
      textId: code,
      searchedString: num,
      date: date ?? new Date().toISOString().slice(0, 10),
    },
  });
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
