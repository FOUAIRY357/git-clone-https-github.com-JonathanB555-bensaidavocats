import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Pages sectorielles (« la TVA de votre secteur »).
 * Le slug (nom de fichier) devient l'URL de premier niveau : /<slug>/ —
 * il doit reprendre les slugs historiques de taxesalaire.com pour préserver le SEO.
 */
const secteurs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/secteurs' }),
  schema: z.object({
    titre: z.string(),
    titreCourt: z.string(),
    description: z.string(),
    accroche: z.string(),
    pictogramme: z.string().default('category'),
    ordre: z.number().default(99),
    statut: z.enum(['publie', 'brouillon']).default('publie'),
  }),
});

/**
 * Pages de doctrine transversale (notions : champ d'application, exonérations,
 * droit à déduction…). URL : /doctrine/<slug>/. Ce sont les pages vers
 * lesquelles renvoient les « Je ne sais pas » des scanners.
 */
const doctrine = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/doctrine' }),
  schema: z.object({
    titre: z.string(),
    titreCourt: z.string(),
    description: z.string(),
    pictogramme: z.string().default('menu_book'),
    ordre: z.number().default(99),
    statut: z.enum(['publie', 'brouillon']).default('publie'),
  }),
});

/** Fil d'actualités. URL : /actualites/<slug>/. */
const actualites = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/actualites' }),
  schema: z.object({
    titre: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    themes: z.array(z.string()).default([]),
    statut: z.enum(['publie', 'brouillon']).default('publie'),
  }),
});

export const collections = { secteurs, doctrine, actualites };
