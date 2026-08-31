import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * llms.txt : plan du site commenté à destination des moteurs génératifs
 * (convention llmstxt.org). Généré au build depuis les collections.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = (chemin: string) => new URL(chemin, site).toString();
  const [secteurs, doctrine, definitions] = await Promise.all([
    getCollection('secteurs', ({ data }) => data.statut === 'publie'),
    getCollection('doctrine', ({ data }) => data.statut === 'publie'),
    getCollection('definitions', ({ data }) => data.statut === 'publie'),
  ]);
  const hubs = secteurs
    .filter((e) => !e.id.includes('/') && e.data.rubrique === 'secteur')
    .sort((a, b) => a.data.ordre - b.data.ordre);
  const guides = secteurs
    .filter((e) => e.data.rubrique === 'article')
    .sort((a, b) => a.data.ordre - b.data.ordre);

  const ligne = (titre: string, chemin: string, description: string) =>
    `- [${titre}](${base(chemin)}) : ${description}`;

  const texte = `# Taxe sur les Salaires & TVA (taxesalaire.com)

> Site de référence en français sur la TVA des opérateurs partiellement exonérés
> (holdings, banques, assurances, immobilier, santé, associations) et sur la taxe
> sur les salaires. Édité par le cabinet BENSAID AVOCATS ; auteur : François Ouairy,
> avocat fiscaliste. Contenus adossés au Code général des impôts, au BOFiP et à la
> jurisprudence citée article par article.

## Outils interactifs

${ligne('Scan TVA', '/scan-tva/', "qualifier une opération (champ, exonérations, options) et calculer ses coefficients de déduction")}
${ligne('Scan Taxe sur les salaires', '/scan-taxe-salaires/', "déterminer si un employeur est redevable et calculer son rapport d'assujettissement")}

## Doctrine par secteur

${hubs.map((e) => ligne(e.data.titreCourt, `/${e.id}/`, e.data.description)).join('\n')}

## Guides TVA thématiques

${guides.map((e) => ligne(e.data.titreCourt, `/${e.id}/`, e.data.description)).join('\n')}

## Notions transversales

${doctrine.sort((a, b) => a.data.ordre - b.data.ordre).map((e) => ligne(e.data.titreCourt, `/doctrine/${e.id}/`, e.data.description)).join('\n')}

## Lexique (définitions)

${definitions.sort((a, b) => a.data.ordre - b.data.ordre).map((e) => ligne(e.data.terme, `/definition/${e.id}/`, e.data.description)).join('\n')}

## Contact

${ligne('François Ouairy, avocat fiscaliste', '/expert/', 'présentation et contact du cabinet BENSAID AVOCATS')}
`;

  return new Response(texte, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
