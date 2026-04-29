#!/usr/bin/env -S npx tsx
import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as legifrance from "./legifrance.js";
import * as judilibre from "./judilibre.js";

const server = new Server(
  { name: "piste-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

const tools = [
  {
    name: "legifrance_search",
    description:
      "Recherche dans Légifrance (codes, lois, décrets, JORF, jurisprudence administrative et constitutionnelle). Retourne une liste de textes avec identifiants utilisables avec legifrance_get_article.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Termes recherchés (ex: 'consentement éclairé', 'article 1240')" },
        fond: {
          type: "string",
          enum: ["CODE_DATE", "LODA_DATE", "JURI", "JORF", "CNIL", "CETAT", "CONSTIT", "ALL"],
          description: "Fonds documentaire. CODE_DATE=codes, LODA_DATE=lois/décrets, JURI=jurisprudence judiciaire, CETAT=Conseil d'État, CONSTIT=Conseil constitutionnel.",
        },
        pageSize: { type: "integer", default: 10, minimum: 1, maximum: 100 },
        pageNumber: { type: "integer", default: 1, minimum: 1 },
        sort: { type: "string", enum: ["PERTINENCE", "DATE_ASC", "DATE_DESC"] },
      },
      required: ["query"],
    },
  },
  {
    name: "legifrance_get_article",
    description: "Récupère le texte intégral d'un article par son identifiant Légifrance (ex: LEGIARTI...).",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Identifiant Légifrance (LEGIARTI..., JORFARTI..., etc.)" },
      },
      required: ["id"],
    },
  },
  {
    name: "legifrance_get_article_by_num",
    description: "Récupère un article d'un code par numéro (ex: code='LEGITEXT000006070721' pour le Code civil, num='1240').",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Identifiant LEGITEXT du code" },
        num: { type: "string", description: "Numéro d'article" },
        date: { type: "string", description: "Date (YYYY-MM-DD), défaut aujourd'hui" },
      },
      required: ["code", "num"],
    },
  },
  {
    name: "legifrance_list_codes",
    description: "Liste les codes en vigueur disponibles sur Légifrance avec leurs identifiants LEGITEXT.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "judilibre_search",
    description:
      "Recherche dans Judilibre : décisions de la Cour de cassation, du Conseil d'État, des Cours d'appel et de tribunaux judiciaires. Retourne des décisions avec id à utiliser avec judilibre_get_decision.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Termes recherchés" },
        jurisdiction: {
          type: "array",
          items: { type: "string", enum: ["cc", "ce", "ca", "tj"] },
          description: "cc=Cour de cassation, ce=Conseil d'État, ca=Cours d'appel, tj=Tribunaux judiciaires. Défaut: [cc, ce].",
        },
        date_start: { type: "string", description: "Date début (YYYY-MM-DD)" },
        date_end: { type: "string", description: "Date fin (YYYY-MM-DD)" },
        chamber: { type: "array", items: { type: "string" }, description: "Chambre (ex: civ1, soc, comm, crim)" },
        publication: { type: "array", items: { type: "string" }, description: "Niveau de publication (ex: b, r, l, c)" },
        page: { type: "integer", default: 0, minimum: 0 },
        page_size: { type: "integer", default: 10, minimum: 1, maximum: 50 },
        sort: { type: "string", enum: ["score", "date"], default: "score" },
        order: { type: "string", enum: ["asc", "desc"], default: "desc" },
      },
      required: ["query"],
    },
  },
  {
    name: "judilibre_get_decision",
    description: "Récupère le texte intégral d'une décision par son id Judilibre.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Identifiant Judilibre" },
      },
      required: ["id"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  const a = args as Record<string, unknown>;
  try {
    let result: unknown;
    switch (name) {
      case "legifrance_search":
        result = await legifrance.search(a as unknown as legifrance.SearchParams);
        break;
      case "legifrance_get_article":
        result = await legifrance.getArticle(String(a.id));
        break;
      case "legifrance_get_article_by_num":
        result = await legifrance.getArticleByNum(
          String(a.code),
          String(a.num),
          a.date ? String(a.date) : undefined,
        );
        break;
      case "legifrance_list_codes":
        result = await legifrance.listCodes();
        break;
      case "judilibre_search":
        result = await judilibre.search(a as unknown as judilibre.SearchParams);
        break;
      case "judilibre_get_decision":
        result = await judilibre.getDecision(String(a.id));
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isError: true,
      content: [{ type: "text", text: `Error: ${message}` }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
