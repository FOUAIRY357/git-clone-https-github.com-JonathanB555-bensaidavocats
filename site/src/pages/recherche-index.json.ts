import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * Index de recherche rapide, généré au build : toutes les pages du site,
 * avec titre, description et catégorie. Consommé par PaletteRecherche.tsx.
 */
export const GET: APIRoute = async () => {
  const [secteurs, doctrine, actualites, definitions] = await Promise.all([
    getCollection('secteurs', ({ data }) => data.statut === 'publie'),
    getCollection('doctrine', ({ data }) => data.statut === 'publie'),
    getCollection('actualites', ({ data }) => data.statut === 'publie'),
    getCollection('definitions', ({ data }) => data.statut === 'publie'),
  ]);

  const pages = [
    { t: 'Scan TVA', d: 'Qualifiez vos opérations et mesurez votre droit à déduction, opération par opération.', u: '/scan-tva/', c: 'Outils' },
    { t: 'Scan Taxe sur les salaires', d: 'Êtes-vous redevable ? Sur quelle assiette ? Avec quels leviers ?', u: '/scan-taxe-salaires/', c: 'Outils' },
    { t: "L'expert : François Ouairy", d: 'Avocat fiscaliste dédié à la TVA et à la taxe sur les salaires. Poser une question.', u: '/expert/', c: 'Contact' },
    { t: 'Doctrine par secteur', d: 'Toutes les rubriques sectorielles : holdings, finance, assurance, immobilier, santé…', u: '/secteurs/', c: 'Rubriques' },
    { t: 'Actualités', d: 'Le fil de veille TVA et taxe sur les salaires.', u: '/actualites/', c: 'Rubriques' },
    { t: 'Lexique TVA', d: 'Les définitions essentielles : assujetti, prorata, coefficients, hors champ…', u: '/definition/', c: 'Rubriques' },
    ...definitions.map((e) => ({
      t: `${e.data.terme} (définition)`,
      d: e.data.description,
      u: `/definition/${e.id}/`,
      c: 'Définitions',
    })),
    ...secteurs.map((e) => ({
      t: e.data.titreCourt,
      d: e.data.description,
      u: `/${e.id}/`,
      c: e.data.rubrique === 'secteur' ? 'Secteurs' : 'Guides TVA',
    })),
    ...doctrine.map((e) => ({
      t: e.data.titreCourt,
      d: e.data.description,
      u: `/doctrine/${e.id}/`,
      c: 'Notions clés',
    })),
    ...actualites.map((e) => ({
      t: e.data.titre,
      d: e.data.description,
      u: `/actualites/${e.id}/`,
      c: 'Actualités',
    })),
  ];

  return new Response(JSON.stringify(pages), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
