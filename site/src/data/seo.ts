/**
 * Utilitaires SEO/GEO partagés par les gabarits de pages :
 * extraction des questions fréquentes (schéma FAQPage) et nettoyage
 * du markdown pour les données structurées.
 */

export interface QuestionReponse {
  question: string;
  reponse: string;
}

/** Retire liens, emphase, HTML et espaces superflus d'un fragment markdown. */
export function aplatirMarkdown(texte: string): string {
  return texte
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrait les couples question/réponse de la section « Questions fréquentes »
 * d'un corps markdown (### question, puis paragraphes de réponse).
 */
export function extraireFaq(body: string): QuestionReponse[] {
  const depart = body.search(/^## Questions? fréquentes?/m);
  if (depart === -1) return [];
  const lignes = body.slice(depart).split('\n').slice(1);
  const faq: QuestionReponse[] = [];
  let question: string | null = null;
  let reponse: string[] = [];
  const clore = () => {
    if (question && reponse.length > 0) {
      faq.push({ question: aplatirMarkdown(question), reponse: aplatirMarkdown(reponse.join(' ')).slice(0, 700) });
    }
    question = null;
    reponse = [];
  };
  for (const ligne of lignes) {
    if (/^## /.test(ligne)) break; // section suivante
    const titreQuestion = ligne.match(/^### (.+)$/);
    if (titreQuestion) {
      clore();
      question = titreQuestion[1]!;
    } else if (question) {
      reponse.push(ligne);
    }
  }
  clore();
  return faq;
}

/** Nœud FAQPage schema.org, ou null si la page n'a pas de FAQ. */
export function noeudFaq(body: string): object | null {
  const faq = extraireFaq(body);
  if (faq.length === 0) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: { '@type': 'Answer', text: qa.reponse },
    })),
  };
}
