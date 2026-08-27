import type { ArbreScan } from './types';

/**
 * Arbre de décision du Scan TVA — VERSION PROVISOIRE (squelette).
 *
 * Logique : champ d'application (CGI, art. 256 et 256 A) → territorialité →
 * exonérations (art. 261 et s.) → option pour la taxation (art. 260 et s.) →
 * opérations exonérées ouvrant néanmoins droit à déduction (art. 271 V).
 *
 * ⚠ Chaque nœud doit être validé par le cabinet avant mise en ligne, puis
 * enrichi (sous-arbres par nature d'opération, coefficients, prorata).
 */
export const arbreTva: ArbreScan = {
  id: 'tva',
  titre: 'Scanner de taxabilité TVA',
  sousTitre:
    "Qualifiez une opération au regard de la TVA et mesurez son incidence sur votre droit à déduction.",
  avertissement:
    "Version de travail : l'arbre de décision est en cours de validation par le cabinet.",
  entree: 'assujetti',
  profondeurEstimee: 5,
  questions: {
    assujetti: {
      id: 'assujetti',
      intitule: 'Qualité d’assujetti',
      titre: "Qui réalise l'opération ?",
      aide: "La TVA ne s'applique qu'aux opérations réalisées par un assujetti agissant en tant que tel, c'est-à-dire une personne qui exerce de manière indépendante une activité économique, quels qu'en soient le statut, la forme ou le but.",
      references: [{ libelle: 'CGI, art. 256 A' }],
      doctrine: {
        libelle: "Doctrine : le champ d'application de la TVA",
        url: '/doctrine/champ-application-tva/',
      },
      options: [
        {
          libelle: 'Un assujetti agissant en tant que tel',
          detail: "Entreprise, professionnel ou entité exerçant une activité économique indépendante",
          icone: 'verified',
          versQuestion: 'onereux',
        },
        {
          libelle: "Une personne n'agissant pas en tant qu'assujetti",
          detail: 'Particulier, personne publique dans le cadre de ses prérogatives, gestion patrimoniale privée',
          icone: 'person_off',
          versResultat: 'hors-champ',
        },
      ],
    },
    onereux: {
      id: 'onereux',
      intitule: 'Opération à titre onéreux',
      titre: "L'opération comporte-t-elle une contrepartie directe ?",
      aide: "Seules les livraisons de biens et prestations de services effectuées à titre onéreux entrent dans le champ de la TVA : il faut un lien direct entre le service rendu ou le bien livré et la contre-valeur reçue.",
      references: [{ libelle: 'CGI, art. 256, I' }],
      doctrine: {
        libelle: "Doctrine : le champ d'application de la TVA",
        url: '/doctrine/champ-application-tva/',
      },
      options: [
        {
          libelle: 'Oui, une contrepartie directe existe',
          detail: 'Prix, redevance, commission ou avantage convenu en échange de la prestation ou du bien',
          icone: 'sync_alt',
          versQuestion: 'territorialite',
        },
        {
          libelle: 'Non, aucune contrepartie directe',
          detail: 'Dividendes, subventions sans lien avec le prix, indemnités purement réparatrices',
          icone: 'block',
          versResultat: 'hors-champ',
        },
      ],
    },
    territorialite: {
      id: 'territorialite',
      intitule: 'Territorialité',
      titre: "L'opération est-elle située en France au sens des règles de territorialité ?",
      aide: "Le lieu d'imposition dépend de la nature de l'opération (livraison de biens ou prestation de services) et de la qualité du preneur. Une opération située hors de France n'est pas imposable en France, mais peut néanmoins y ouvrir droit à déduction.",
      references: [{ libelle: 'CGI, art. 258 à 259 D' }],
      doctrine: {
        libelle: 'Doctrine : la territorialité de la TVA',
        url: '/doctrine/territorialite-tva/',
      },
      options: [
        {
          libelle: 'Oui, en France',
          detail: "Le lieu de l'opération se situe en France en application des règles de territorialité",
          icone: 'location_on',
          versQuestion: 'exoneration',
        },
        {
          libelle: 'Non, hors de France',
          detail: 'Preneur assujetti établi à l’étranger, bien situé ou livré hors de France…',
          icone: 'public',
          versResultat: 'hors-territoire',
        },
      ],
    },
    exoneration: {
      id: 'exoneration',
      intitule: 'Exonération',
      titre: "L'opération bénéficie-t-elle d'une exonération ?",
      aide: "Certaines opérations situées dans le champ de la TVA en sont exonérées par la loi : opérations bancaires et financières, assurance, santé, enseignement, locations nues, etc. L'exonération fait en principe perdre le droit à déduction en amont.",
      references: [{ libelle: 'CGI, art. 261 à 261 E' }],
      doctrine: {
        libelle: 'Doctrine : les exonérations de TVA',
        url: '/doctrine/exonerations-tva/',
      },
      options: [
        {
          libelle: "Oui, une exonération s'applique",
          detail: 'Opérations financières, assurance, santé, enseignement, locations exonérées…',
          icone: 'shield',
          versQuestion: 'option',
        },
        {
          libelle: 'Non, aucune exonération',
          detail: "L'opération relève du régime de droit commun",
          icone: 'check_circle',
          versResultat: 'taxee',
        },
      ],
    },
    option: {
      id: 'option',
      intitule: 'Option pour la taxation',
      titre: 'Une option pour la taxation a-t-elle été exercée ?',
      aide: "Pour certaines opérations exonérées, la loi permet d'opter pour la taxation : locations de locaux nus à usage professionnel, certaines opérations bancaires et financières… L'option restaure le droit à déduction correspondant.",
      references: [{ libelle: 'CGI, art. 260 et 260 B' }],
      doctrine: {
        libelle: 'Doctrine : les exonérations de TVA et les options',
        url: '/doctrine/exonerations-tva/',
      },
      options: [
        {
          libelle: 'Oui, une option est exercée',
          detail: "L'option couvre l'opération examinée pour la période concernée",
          icone: 'toggle_on',
          versResultat: 'taxee-option',
        },
        {
          libelle: 'Non, aucune option',
          detail: "Aucune option n'a été exercée ou l'opération n'y est pas éligible",
          icone: 'toggle_off',
          versQuestion: 'assimilee',
        },
      ],
    },
    assimilee: {
      id: 'assimilee',
      intitule: 'Assimilation aux opérations taxées',
      titre: "L'opération exonérée ouvre-t-elle néanmoins droit à déduction ?",
      aide: "Par exception, certaines opérations exonérées sont assimilées à des opérations taxées pour l'exercice du droit à déduction : exportations, livraisons intracommunautaires, certaines opérations financières ou d'assurance réalisées avec des preneurs établis hors de l'Union européenne.",
      references: [{ libelle: 'CGI, art. 262, 262 ter et 271, V' }],
      doctrine: {
        libelle: 'Doctrine : le droit à déduction et les coefficients',
        url: '/doctrine/droit-a-deduction/',
      },
      options: [
        {
          libelle: 'Oui, opération assimilée à une opération taxée',
          detail: 'Exportation, livraison intracommunautaire, opération financière avec un preneur hors UE…',
          icone: 'flight_takeoff',
          versResultat: 'assimilee-taxee',
        },
        {
          libelle: 'Non, exonération sans droit à déduction',
          detail: "L'opération demeure exonérée sans être assimilée à une opération taxée",
          icone: 'do_not_disturb_on',
          versResultat: 'exoneree',
        },
      ],
    },
  },
  resultats: {
    'hors-champ': {
      id: 'hors-champ',
      carto: { libelle: 'Hors champ', teinte: 'gris', deduction: 'non' },
      qualification: "Opération hors du champ d'application de la TVA",
      ton: 'attention',
      resume:
        "L'opération n'entre pas dans le champ d'application de la TVA : elle n'est pas soumise à la taxe et ne figure pas parmi les opérations ouvrant droit à déduction.",
      consequences: [
        'Aucune TVA à collecter sur cette opération.',
        "Les dépenses engagées pour sa réalisation n'ouvrent en principe pas droit à déduction : le coefficient d'assujettissement des dépenses mixtes doit en tenir compte.",
        "La présence de recettes hors champ peut avoir une incidence sur la taxe sur les salaires : poursuivez avec le scan dédié.",
      ],
      references: [{ libelle: 'CGI, art. 256 et 256 A' }, { libelle: 'CGI, art. 271' }],
      doctrine: {
        libelle: "Doctrine : le champ d'application de la TVA",
        url: '/doctrine/champ-application-tva/',
      },
      etapeSuivante: {
        libelle: 'Mesurer l’impact sur la taxe sur les salaires',
        url: '/scan-taxe-salaires/',
      },
    },
    'hors-territoire': {
      id: 'hors-territoire',
      carto: { libelle: 'Hors France', teinte: 'ardoise', deduction: 'a-analyser' },
      qualification: 'Opération non imposable en France',
      ton: 'mixte',
      resume:
        "L'opération est située hors de France : elle n'y est pas imposable. Elle peut toutefois y ouvrir droit à déduction si elle ouvrirait droit à déduction dans le cas où son lieu d'imposition se situerait en France.",
      consequences: [
        'Aucune TVA française à collecter ; des obligations peuvent exister dans le pays d’imposition.',
        "Le droit à déduction des dépenses françaises est en principe préservé pour les opérations qui seraient taxées ou assimilées si elles étaient situées en France.",
        'Vérifiez les obligations déclaratives associées (état récapitulatif, autoliquidation chez le preneur…).',
      ],
      references: [{ libelle: 'CGI, art. 259 à 259 D' }, { libelle: 'CGI, art. 271, V, d' }],
      doctrine: {
        libelle: 'Doctrine : la territorialité de la TVA',
        url: '/doctrine/territorialite-tva/',
      },
    },
    taxee: {
      id: 'taxee',
      carto: { libelle: 'Taxée', teinte: 'marine', deduction: 'oui' },
      qualification: 'Opération taxée',
      ton: 'positif',
      resume:
        "L'opération est soumise à la TVA dans les conditions de droit commun. Elle ouvre droit à déduction de la taxe grevant les dépenses engagées pour sa réalisation.",
      consequences: [
        'TVA à collecter au taux applicable à l’opération.',
        "Droit à déduction de la TVA d'amont affectée à cette opération.",
        'Si vous réalisez aussi des opérations exonérées ou hors champ, le calcul des coefficients de déduction (assujettissement, taxation, admission) devient déterminant.',
      ],
      references: [{ libelle: 'CGI, art. 256' }, { libelle: 'CGI, art. 271' }],
      doctrine: {
        libelle: 'Doctrine : le droit à déduction et les coefficients',
        url: '/doctrine/droit-a-deduction/',
      },
    },
    'taxee-option': {
      id: 'taxee-option',
      carto: { libelle: 'Taxée sur option', teinte: 'or', deduction: 'oui' },
      qualification: 'Opération taxée sur option',
      ton: 'positif',
      resume:
        "L'option exercée soumet l'opération à la TVA. Elle ouvre droit à déduction dans les mêmes conditions qu'une opération taxée de plein droit.",
      consequences: [
        "TVA à collecter sur les opérations couvertes par l'option.",
        "Droit à déduction restauré pour les dépenses affectées aux opérations couvertes par l'option.",
        "Vérifiez le périmètre exact et la durée de l'option : elles conditionnent le traitement des opérations concernées.",
      ],
      references: [{ libelle: 'CGI, art. 260 et 260 B' }, { libelle: 'CGI, art. 271' }],
      doctrine: {
        libelle: 'Doctrine : les exonérations de TVA et les options',
        url: '/doctrine/exonerations-tva/',
      },
    },
    'assimilee-taxee': {
      id: 'assimilee-taxee',
      carto: { libelle: 'Assimilée taxée', teinte: 'vert', deduction: 'oui' },
      qualification: 'Opération exonérée ouvrant droit à déduction',
      ton: 'positif',
      resume:
        "Bien qu'exonérée, l'opération est assimilée à une opération taxée pour l'exercice du droit à déduction : la TVA d'amont correspondante demeure déductible.",
      consequences: [
        'Aucune TVA à collecter sur cette opération.',
        "Droit à déduction préservé pour les dépenses affectées à cette opération.",
        "Ces opérations s'inscrivent au numérateur comme au dénominateur du coefficient de taxation forfaitaire.",
      ],
      references: [{ libelle: 'CGI, art. 262 et 262 ter' }, { libelle: 'CGI, art. 271, V' }],
      doctrine: {
        libelle: 'Doctrine : le droit à déduction et les coefficients',
        url: '/doctrine/droit-a-deduction/',
      },
    },
    exoneree: {
      id: 'exoneree',
      carto: { libelle: 'Exonérée', teinte: 'ardoise', deduction: 'non' },
      qualification: 'Opération exonérée sans droit à déduction',
      ton: 'negatif',
      resume:
        "L'opération est exonérée de TVA et n'ouvre pas droit à déduction : la TVA grevant les dépenses affectées constitue une charge définitive.",
      consequences: [
        'Aucune TVA à collecter sur cette opération.',
        "Perte du droit à déduction sur les dépenses affectées ; pour les dépenses mixtes, le coefficient de taxation réduit le montant déductible.",
        'Un volume significatif de recettes exonérées expose en principe à la taxe sur les salaires : poursuivez avec le scan dédié.',
      ],
      references: [{ libelle: 'CGI, art. 261 à 261 E' }, { libelle: 'CGI, art. 271' }],
      doctrine: {
        libelle: 'Doctrine : les exonérations de TVA',
        url: '/doctrine/exonerations-tva/',
      },
      etapeSuivante: {
        libelle: 'Mesurer l’impact sur la taxe sur les salaires',
        url: '/scan-taxe-salaires/',
      },
    },
  },
};
