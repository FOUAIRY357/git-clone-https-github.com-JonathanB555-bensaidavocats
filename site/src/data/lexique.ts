/**
 * Lexique TVA & taxe sur les salaires : chaque terme pointe vers sa page de
 * définition (/definition/<slug>/) et porte une définition courte affichée
 * en info-bulle dans les scans. Les pages vivent dans src/content/definitions.
 */

export interface TermeLexique {
  /** Formes reconnues dans les textes (la première sert de libellé). */
  formes: string[];
  url: string;
  /** Définition courte pour l'info-bulle (une phrase). */
  definition: string;
}

export const lexique: TermeLexique[] = [
  {
    formes: ['assujetti agissant en tant que tel'],
    url: '/definition/assujetti-tva/',
    definition: "Assujetti dont l'opération se rattache à son activité économique, condition d'entrée dans le champ de la TVA.",
  },
  {
    formes: ['assujettis', 'assujetti', 'assujettie'],
    url: '/definition/assujetti-tva/',
    definition: 'Personne qui exerce de manière indépendante une activité économique, quels qu’en soient le statut ou le but (CGI, art. 256 A).',
  },
  {
    formes: ['redevable partiel', 'redevables', 'redevable'],
    url: '/definition/redevable-tva/',
    definition: "Personne tenue de payer la taxe au Trésor : on peut être assujetti sans être redevable (franchise, opérations exonérées).",
  },
  {
    formes: ['hors du champ', 'hors champ'],
    url: '/definition/operation-hors-champ-tva/',
    definition: 'Opération qui ne remplit pas les conditions de l’article 256 du CGI : pas de TVA, pas de droit à déduction, mais un impact sur la taxe sur les salaires.',
  },
  {
    formes: ['exonérations', 'exonération', 'exonérées', 'exonérée', 'exonérés', 'exonéré'],
    url: '/definition/exoneration-tva/',
    definition: 'Opération dans le champ de la TVA que la loi dispense de taxation, en principe sans droit à déduction.',
  },
  {
    formes: ['prorata', 'coefficient de déduction'],
    url: '/definition/prorata-tva/',
    definition: 'Fraction de TVA déductible sur une dépense : produit des coefficients d’assujettissement, de taxation et d’admission (ann. II, art. 206).',
  },
  {
    formes: ["coefficient d'assujettissement"],
    url: '/definition/coefficient-assujettissement/',
    definition: "Proportion d'utilisation d'une dépense pour des opérations situées dans le champ de la TVA.",
  },
  {
    formes: ['coefficient de taxation'],
    url: '/definition/coefficient-taxation/',
    definition: "Part des opérations ouvrant droit à déduction parmi les opérations dans le champ : c'est le « prorata » au sens courant.",
  },
  {
    formes: ["coefficient d'admission"],
    url: '/definition/coefficient-admission/',
    definition: 'Coefficient qui traduit les exclusions et restrictions légales du droit à déduction propres à certaines dépenses.',
  },
  {
    formes: ['livraisons à soi-même', 'livraison à soi-même', 'LASM'],
    url: '/definition/livraison-a-soi-meme/',
    definition: "Opération par laquelle l'entreprise se livre un bien ou un service à elle-même, taxée dans certains cas pour rétablir la neutralité.",
  },
  {
    formes: ["universalité totale ou partielle de biens", 'universalité de biens', 'universalité'],
    url: '/definition/universalite-de-biens/',
    definition: "Ensemble d'éléments permettant la poursuite d'une activité économique autonome : sa transmission entre redevables est dispensée de TVA (art. 257 bis).",
  },
  {
    formes: ['terrains à bâtir', 'terrain à bâtir'],
    url: '/definition/terrain-a-batir/',
    definition: 'Terrain sur lequel des constructions peuvent être autorisées par les documents d’urbanisme (CGI, art. 257, I, 2, 1°) : sa vente par un assujetti est taxée de plein droit.',
  },
  {
    formes: ['immeuble neuf', 'bâtiment neuf', 'immeubles neufs'],
    url: '/definition/immeuble-neuf/',
    definition: "Bâtiment achevé depuis cinq ans au plus, construction nouvelle ou travaux l'ayant rendu à l'état neuf : sa livraison est taxée de plein droit.",
  },
  {
    formes: ["rapport d'assujettissement"],
    url: '/definition/rapport-assujettissement-taxe-salaires/',
    definition: "Fraction des rémunérations soumise à la taxe sur les salaires : recettes n'ayant pas ouvert droit à déduction / recettes totales (CGI, art. 231).",
  },
  {
    formes: ['sectorisation', 'secteurs distincts'],
    url: '/definition/sectorisation/',
    definition: "Constitution de secteurs d'activité distincts, chacun avec son propre droit à déduction, et son propre rapport de taxe sur les salaires.",
  },
  {
    formes: ["autoliquidation"],
    url: '/definition/autoliquidation/',
    definition: 'Mécanisme par lequel le client, et non le fournisseur, déclare et paie la TVA due sur l’opération.',
  },
  {
    formes: ['à titre onéreux'],
    url: '/definition/operation-a-titre-onereux/',
    definition: 'Opération comportant une contrepartie directe : le lien direct entre la prestation et le prix conditionne l’entrée dans le champ de la TVA.',
  },
];
