import type { ArbreScan } from './types';

/**
 * Arbre de décision du Scan Taxe sur les salaires — VERSION PROVISOIRE (squelette).
 *
 * Logique : employeur établi en France (CGI, art. 231) → assujettissement à la
 * TVA sur au moins 90 % du chiffre d'affaires l'année précédente → rapport
 * d'assujettissement et liquidation.
 *
 * ⚠ Chaque nœud doit être validé par le cabinet avant mise en ligne, puis
 * enrichi (secteurs distincts, décote et franchise, barème, cas particuliers).
 */
export const arbreTaxeSalaires: ArbreScan = {
  id: 'taxe-salaires',
  titre: 'Scanner taxe sur les salaires',
  sousTitre:
    "Déterminez si vos rémunérations sont soumises à la taxe sur les salaires et sur quelle assiette.",
  avertissement:
    "Version de travail : l'arbre de décision est en cours de validation par le cabinet.",
  entree: 'employeur',
  profondeurEstimee: 3,
  questions: {
    employeur: {
      id: 'employeur',
      intitule: 'Employeur en France',
      titre: 'Êtes-vous un employeur établi ou domicilié en France ?',
      aide: "La taxe sur les salaires est due par les employeurs établis ou domiciliés en France qui versent des rémunérations, lorsqu'ils ne sont pas soumis à la TVA sur la totalité de leur chiffre d'affaires.",
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: {
        libelle: 'Doctrine : les principes de la taxe sur les salaires',
        url: '/doctrine/taxe-sur-les-salaires/',
      },
      options: [
        {
          libelle: 'Oui',
          detail: 'Siège, établissement ou domiciliation en France, avec versement de rémunérations',
          icone: 'domain',
          versQuestion: 'seuil-90',
        },
        {
          libelle: 'Non',
          detail: 'Aucun établissement ni domiciliation en France',
          icone: 'public_off',
          versResultat: 'non-assujetti-etranger',
        },
      ],
    },
    'seuil-90': {
      id: 'seuil-90',
      intitule: 'Seuil de 90 %',
      titre:
        "L'année civile précédant le versement des rémunérations, étiez-vous soumis à la TVA sur au moins 90 % de votre chiffre d'affaires ?",
      aide: "Les employeurs assujettis à la TVA sur 90 % au moins de leur chiffre d'affaires au titre de l'année civile précédant celle du paiement des rémunérations ne sont pas redevables de la taxe sur les salaires.",
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: {
        libelle: 'Doctrine : les principes de la taxe sur les salaires',
        url: '/doctrine/taxe-sur-les-salaires/',
      },
      options: [
        {
          libelle: 'Oui, 90 % ou plus',
          detail: 'La quasi-totalité du chiffre d’affaires a été soumise à la TVA',
          icone: 'percent',
          versResultat: 'non-assujetti-90',
        },
        {
          libelle: 'Non, moins de 90 %',
          detail: 'Recettes exonérées ou hors champ significatives : holdings, finance, assurance, santé, OSBL…',
          icone: 'stacked_bar_chart',
          versQuestion: 'rapport',
        },
      ],
    },
    rapport: {
      id: 'rapport',
      intitule: "Rapport d'assujettissement",
      titre: "Connaissez-vous votre rapport d'assujettissement à la taxe sur les salaires ?",
      aide: "L'assiette de la taxe est obtenue en multipliant le total des rémunérations par le rapport existant, l'année précédant celle du paiement, entre les recettes n'ayant pas ouvert droit à déduction de la TVA et le total des recettes.",
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: {
        libelle: "Doctrine : le rapport d'assujettissement",
        url: '/doctrine/taxe-sur-les-salaires/',
      },
      options: [
        {
          libelle: 'Oui, je le connais',
          detail: 'Le rapport recettes sans droit à déduction / recettes totales est déjà déterminé',
          icone: 'calculate',
          versResultat: 'assujetti-partiel',
        },
        {
          libelle: 'Non, pas encore',
          detail: 'Le rapport reste à calculer ou à sécuriser (sectorisation, produits financiers accessoires…)',
          icone: 'help_center',
          versResultat: 'rapport-a-calculer',
        },
      ],
    },
  },
  resultats: {
    'non-assujetti-etranger': {
      id: 'non-assujetti-etranger',
      qualification: 'Hors du champ de la taxe sur les salaires',
      ton: 'positif',
      resume:
        "Sans établissement ni domiciliation en France, vous n'êtes en principe pas redevable de la taxe sur les salaires française.",
      consequences: [
        "Vérifiez toutefois l'existence éventuelle d'un établissement en France au sens de la jurisprudence.",
        'Des obligations sociales et fiscales distinctes peuvent exister par ailleurs.',
      ],
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: {
        libelle: 'Doctrine : les principes de la taxe sur les salaires',
        url: '/doctrine/taxe-sur-les-salaires/',
      },
    },
    'non-assujetti-90': {
      id: 'non-assujetti-90',
      qualification: 'Non redevable de la taxe sur les salaires',
      ton: 'positif',
      resume:
        "Assujetti à la TVA sur au moins 90 % de votre chiffre d'affaires l'année précédente, vous n'êtes pas redevable de la taxe sur les salaires au titre des rémunérations versées cette année.",
      consequences: [
        'Surveillez le rapport chaque année : le franchissement du seuil se mesure année civile par année civile.',
        "Une évolution de l'activité (produits financiers, subventions, dividendes…) peut faire basculer le rapport sous 90 %.",
      ],
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: {
        libelle: 'Doctrine : les principes de la taxe sur les salaires',
        url: '/doctrine/taxe-sur-les-salaires/',
      },
    },
    'assujetti-partiel': {
      id: 'assujetti-partiel',
      qualification: 'Redevable de la taxe sur les salaires',
      ton: 'attention',
      resume:
        "Vous êtes redevable de la taxe sur les salaires sur une assiette égale aux rémunérations multipliées par votre rapport d'assujettissement.",
      consequences: [
        "Assiette = rémunérations imposables × rapport d'assujettissement de l'année précédente.",
        'La taxe est calculée selon un barème progressif par salarié ; franchise et décote peuvent atténuer la charge.',
        "La sectorisation de l'activité et l'affectation des personnels peuvent réduire sensiblement la taxe : un audit est souvent rentable.",
      ],
      references: [{ libelle: 'CGI, art. 231' }, { libelle: 'CGI, art. 1679 et 1679 A' }],
      doctrine: {
        libelle: 'Doctrine : les principes de la taxe sur les salaires',
        url: '/doctrine/taxe-sur-les-salaires/',
      },
      etapeSuivante: {
        libelle: 'Faire auditer mon rapport par un expert',
        url: '/expert/',
      },
    },
    'rapport-a-calculer': {
      id: 'rapport-a-calculer',
      qualification: "Rapport d'assujettissement à déterminer",
      ton: 'mixte',
      resume:
        "Votre situation exige de calculer le rapport d'assujettissement : recettes n'ayant pas ouvert droit à déduction rapportées au total des recettes de l'année précédant le versement.",
      consequences: [
        'Le classement de chaque catégorie de recettes (taxées, exonérées, hors champ, dividendes, subventions…) détermine directement le montant de la taxe.',
        'Le Scan TVA vous aide à qualifier chaque flux avant de calculer le rapport.',
        'La constitution de secteurs distincts peut limiter la taxe aux seuls personnels des secteurs exonérés.',
      ],
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: {
        libelle: 'Doctrine : les principes de la taxe sur les salaires',
        url: '/doctrine/taxe-sur-les-salaires/',
      },
      etapeSuivante: {
        libelle: 'Qualifier mes recettes avec le Scan TVA',
        url: '/scan-tva/',
      },
    },
  },
};
