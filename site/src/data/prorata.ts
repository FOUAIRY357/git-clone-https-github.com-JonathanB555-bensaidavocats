/**
 * Données du calculateur de prorata : les catégories de recettes propres à
 * chaque univers, avec leur classement au regard de la TVA (coefficients)
 * et de la taxe sur les salaires (rapport d'assujettissement).
 *
 * ⚠ Approche simplifiée par les recettes, à valider par le cabinet : le
 * coefficient d'assujettissement réel s'apprécie par l'utilisation des
 * dépenses, et certaines exclusions (produits accessoires, titres
 * immobilisés ≤ 5 %) obéissent à des conditions propres.
 */

export type ClassementRecette =
  /** Taxée (ou taxée sur option exercée) : ouvre droit à déduction. */
  | 'taxee'
  /** Exonérée mais assimilée à une opération taxée (export, preneur hors UE…). */
  | 'assimilee'
  /** Exonérée sans droit à déduction. */
  | 'exoneree'
  /** Hors du champ de la TVA — comptée au rapport taxe sur les salaires. */
  | 'hors-champ'
  /** Hors de tout : ni prorata TVA, ni rapport TS (LASM, subventions exceptionnelles). */
  | 'exclue';

export interface LigneRecette {
  id: string;
  libelle: string;
  /** Précision affichée sous la ligne (référence comprise). */
  aide: string;
  classement: ClassementRecette;
  /** Une option pour la taxation est possible : cochée, la ligne devient taxée. */
  optionable?: string;
  /** Ligne exonérée pouvant être exclue du coefficient de taxation si accessoire. */
  accessoirePossible?: string;
}

export interface PresetProrata {
  id: string;
  titre: string;
  lignes: LigneRecette[];
}

export const presetsProrata: PresetProrata[] = [
  {
    id: 'holdings',
    titre: 'Holding',
    lignes: [
      {
        id: 'fees',
        libelle: 'Management fees et prestations facturées aux filiales',
        aide: "Immixtion dans la gestion : taxées, elles ouvrent droit à déduction (CJUE, Floridienne).",
        classement: 'taxee',
      },
      {
        id: 'interets',
        libelle: 'Intérêts de prêts et d’avances aux filiales',
        aide: "Dans le champ mais exonérés (art. 261 C) ; l'option de l'article 260 B les rend taxables.",
        classement: 'exoneree',
        optionable: 'Option 260 B exercée sur ces intérêts',
        accessoirePossible: 'Produits financiers accessoires : exclus du coefficient de taxation',
      },
      {
        id: 'dividendes',
        libelle: 'Dividendes',
        aide: 'Hors du champ (CJUE, Sofitam) : exclus du prorata de TVA, mais comptés au rapport taxe sur les salaires (CE, 14 févr. 2018, n° 410302).',
        classement: 'hors-champ',
      },
      {
        id: 'cessions',
        libelle: 'Produits de cession de titres',
        aide: "Selon les cas hors champ ou exonérés ; souvent exclus du coefficient de taxation comme accessoires.",
        classement: 'exoneree',
        accessoirePossible: 'Cessions accessoires : exclues du coefficient de taxation',
      },
      {
        id: 'subventions',
        libelle: 'Subventions et abandons de créances reçus',
        aide: "Hors champ si sans contrepartie ; au rapport TS sauf subventions exceptionnelles ou d'équipement (BOI-TPS-TS-20-30, § 160).",
        classement: 'hors-champ',
      },
      {
        id: 'loyers',
        libelle: 'Loyers facturés (immeubles du groupe)',
        aide: "Locaux nus professionnels : exonérés sauf lettre d'option (art. 260, 2°).",
        classement: 'exoneree',
        optionable: "Lettre d'option TVA couvrant ces locaux",
      },
    ],
  },
  {
    id: 'general',
    titre: 'Entreprise générale',
    lignes: [
      {
        id: 'ventes',
        libelle: 'Ventes et prestations taxées en France',
        aide: 'Régime de droit commun : TVA collectée, droit à déduction.',
        classement: 'taxee',
      },
      {
        id: 'exports',
        libelle: 'Exportations et livraisons intracommunautaires',
        aide: 'Exonérées avec droit à déduction préservé (art. 262 et 262 ter) : elles améliorent le prorata.',
        classement: 'assimilee',
      },
      {
        id: 'exonerees',
        libelle: 'Recettes exonérées sans droit à déduction',
        aide: 'Formation, locations nues, sous-traitance médicale… (art. 261 et s.).',
        classement: 'exoneree',
      },
      {
        id: 'produits-financiers',
        libelle: 'Produits financiers (intérêts, placements)',
        aide: 'Exonérés ; exclus du coefficient de taxation s’ils sont accessoires.',
        classement: 'exoneree',
        accessoirePossible: 'Produits financiers accessoires : exclus du coefficient de taxation',
      },
      {
        id: 'subventions',
        libelle: 'Subventions de fonctionnement, dividendes',
        aide: 'Hors champ : hors prorata TVA, mais au rapport taxe sur les salaires.',
        classement: 'hors-champ',
      },
      {
        id: 'exceptionnel',
        libelle: "Subventions exceptionnelles ou d'équipement, LASM",
        aide: 'Exclues des deux calculs (CE, 9 nov. 2015, Crédit agricole ; BOI-TPS-TS-20-30, § 160).',
        classement: 'exclue',
      },
    ],
  },
  {
    id: 'immobilier',
    titre: 'Immobilier',
    lignes: [
      {
        id: 'loyers-taxes',
        libelle: 'Loyers taxés (locaux aménagés, para-hôtellerie)',
        aide: 'Taxés de plein droit : droit à déduction sur travaux et charges.',
        classement: 'taxee',
      },
      {
        id: 'loyers-optes',
        libelle: 'Loyers de locaux nus professionnels',
        aide: "Exonérés sauf lettre d'option, local par local (art. 260, 2° ; CE, SCI EMO).",
        classement: 'exoneree',
        optionable: "Lettre d'option TVA couvrant ces locaux",
      },
      {
        id: 'loyers-habitation',
        libelle: "Loyers d'habitation (nus ou meublés simples)",
        aide: "Exonérés sans option possible (art. 261 D).",
        classement: 'exoneree',
      },
      {
        id: 'ventes-taxees',
        libelle: 'Ventes taxées (neuf, terrains à bâtir, options)',
        aide: 'Immeubles de moins de 5 ans, terrains à bâtir, ventes sur option.',
        classement: 'taxee',
      },
      {
        id: 'ventes-exonerees',
        libelle: 'Ventes exonérées (anciens sans option)',
        aide: 'Attention aux régularisations par vingtièmes (ann. II, art. 207).',
        classement: 'exoneree',
      },
      {
        id: 'produits-financiers',
        libelle: 'Produits financiers',
        aide: 'Exclus du coefficient de taxation s’ils sont accessoires.',
        classement: 'exoneree',
        accessoirePossible: 'Produits accessoires : exclus du coefficient de taxation',
      },
    ],
  },
  {
    id: 'finance',
    titre: 'Banque & assurance',
    lignes: [
      {
        id: 'taxes',
        libelle: 'Produits taxés (garde et gestion, recouvrement, crédit-bail)',
        aide: 'Taxés de plein droit, sans exonération applicable.',
        classement: 'taxee',
      },
      {
        id: 'optes',
        libelle: 'Produits exonérés couverts par l’option 260 B',
        aide: "Depuis 2022, l'option s'exerce opération par opération.",
        classement: 'exoneree',
        optionable: 'Option 260 B exercée sur ces produits',
      },
      {
        id: 'hors-ue',
        libelle: 'Produits exonérés — clients établis hors UE',
        aide: 'Assimilés à des opérations taxées : droit à déduction préservé (art. 271, V, b).',
        classement: 'assimilee',
      },
      {
        id: 'exoneres-ue',
        libelle: 'Produits exonérés — clients France et UE',
        aide: 'Intérêts, primes, commissions exonérés sans droit à déduction (art. 261 C).',
        classement: 'exoneree',
      },
      {
        id: 'dividendes',
        libelle: 'Dividendes et produits de titres',
        aide: 'Hors prorata TVA (CJUE, Satam) ; au rapport TS, sauf produits de titres immobilisés ≤ 5 % des recettes.',
        classement: 'hors-champ',
      },
    ],
  },
  {
    id: 'sante',
    titre: 'Santé',
    lignes: [
      {
        id: 'taxees',
        libelle: 'Recettes taxées (parapharmacie, actes non thérapeutiques…)',
        aide: 'Esthétique de convenance, expertises, ventes annexes : taxées.',
        classement: 'taxee',
      },
      {
        id: 'soins',
        libelle: "Soins et frais d'hospitalisation exonérés",
        aide: 'Art. 261, 4, 1° et 1° bis : exonérés sans droit à déduction.',
        classement: 'exoneree',
      },
      {
        id: 'dotations',
        libelle: 'Dotations, forfaits et subventions',
        aide: 'Hors champ : au rapport taxe sur les salaires, sauf subventions exceptionnelles ou d’équipement.',
        classement: 'hors-champ',
      },
      {
        id: 'exceptionnel',
        libelle: "Subventions d'équipement, LASM",
        aide: 'Exclues des deux calculs.',
        classement: 'exclue',
      },
    ],
  },
];
