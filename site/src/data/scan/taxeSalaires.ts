import type { ArbreScan } from './types';

/**
 * Arbre de décision du Scan Taxe sur les salaires — VERSION DE TRAVAIL DÉTAILLÉE.
 *
 * Tronc commun : employeur en France (art. 231) → exemptions → seuil de 90 % →
 * rapport d'assujettissement → sectorisation. Sous-parcours : holdings et
 * dirigeants, secteur financier, groupe TVA, santé — nourris de la doctrine
 * du site (pages migrées).
 *
 * ⚠ Chaque nœud doit être validé par le cabinet avant mise en ligne.
 */
export const arbreTaxeSalaires: ArbreScan = {
  id: 'taxe-salaires',
  titre: 'Scanner taxe sur les salaires',
  sousTitre:
    "Déterminez si vos rémunérations sont soumises à la taxe sur les salaires, sur quelle assiette, et avec quels leviers.",
  avertissement:
    "Version de travail : l'arbre de décision est en cours de validation par le cabinet.",
  entree: 'employeur',
  profondeurEstimee: 4,
  univers: [
    { titre: 'Diagnostic général', detail: 'Redevable ou non, rapport d’assujettissement, sectorisation', image: '/images/scan-ts.jpg', entree: 'employeur' },
    { titre: 'Holdings & dirigeants', detail: 'Holding pure ou mixte, rémunération des mandataires sociaux', image: '/images/holdings.jpg', entree: 'ts-holding-activite' },
    { titre: 'Secteur financier', detail: 'Dividendes, titres immobilisés, instruments à terme, succursales', image: '/images/finance.jpg', entree: 'ts-fin-profil' },
    { titre: 'Groupe TVA', detail: "Flux internes détaxés en TVA… mais comptés en taxe sur les salaires", image: '/images/scan-ts.jpg', entree: 'ts-groupe' },
    { titre: 'Santé', detail: 'Hôpitaux, cliniques, EHPAD publics et privés', image: '/images/sante.jpg', entree: 'ts-sante' },
  ],
  questions: {
    employeur: {
      id: 'employeur',
      intitule: 'Employeur en France',
      image: '/images/scan-ts.jpg',
      titre: 'Êtes-vous un employeur établi ou domicilié en France ?',
      aide: "La taxe sur les salaires est due par les employeurs établis ou domiciliés en France (CGI, art. 231, 1). La territorialité s'apprécie côté employeur, pas côté salarié : les rémunérations versées par un employeur français à des salariés expatriés ou frontaliers restent soumises à la taxe (CE, 13 juillet 2022, n° 460386 ; CE, Assemblée plénière, 30 juin 1982, n° 22796). À l'inverse, une succursale française d'un groupe étranger est un employeur en France, même pour des salariés détachés par le siège (CE, Alitalia, 15 juillet 2004, n° 249798).",
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: { libelle: 'Doctrine : le champ de la taxe sur les salaires', url: '/champ-application-taxe-sur-les-salaires/' },
      options: [
        {
          libelle: 'Oui',
          detail: 'Siège, établissement, succursale ou domiciliation en France, avec versement de rémunérations',
          icone: 'domain',
          versQuestion: 'exemption',
        },
        {
          libelle: 'Non',
          detail: 'Aucun établissement ni domiciliation en France au sens de la jurisprudence',
          icone: 'public_off',
          versResultat: 'non-assujetti-etranger',
        },
      ],
    },
    exemption: {
      id: 'exemption',
      intitule: 'Catégories exemptées',
      image: '/images/scan-ts.jpg',
      titre: "Relevez-vous d'une catégorie d'employeurs exemptée ?",
      aide: "Certaines catégories d'employeurs sont expressément exemptées de taxe sur les salaires par le CGI : les particuliers employeurs de salariés à domicile (art. 231 bis P), les établissements d'enseignement supérieur pour certaines rémunérations, les collectivités publiques visées au dernier alinéa de l'article 231, 1, ou encore les employeurs agricoles (BOI-TPS-TS-10-20). Ces exemptions sont d'interprétation stricte : vérifiez précisément votre situation.",
      references: [{ libelle: 'CGI, art. 231 et 231 bis P' }],
      doctrine: { libelle: 'Doctrine : le champ de la taxe sur les salaires', url: '/champ-application-taxe-sur-les-salaires/' },
      options: [
        {
          libelle: 'Non, aucune exemption',
          detail: "Employeur de droit commun : le critère décisif devient votre situation TVA",
          icone: 'check_circle',
          versQuestion: 'seuil-90',
        },
        {
          libelle: 'Oui, une catégorie exemptée',
          detail: 'Particulier employeur, collectivité publique visée, employeur agricole…',
          icone: 'shield',
          versResultat: 'exempte',
        },
      ],
    },
    'seuil-90': {
      id: 'seuil-90',
      intitule: 'Seuil de 90 %',
      image: '/images/scan-ts.jpg',
      titre: "L'année précédant le versement, étiez-vous soumis à la TVA sur au moins 90 % de votre chiffre d'affaires ?",
      aide: "Sont redevables de la taxe sur les salaires les employeurs qui ne sont pas assujettis à la TVA l'année du versement, ou qui l'ont été sur moins de 90 % de leur chiffre d'affaires au titre de l'année civile précédente (CGI, art. 231, 1 ; CE, 31 mars 2023, n° 460838). Le franchissement s'apprécie année civile par année civile : une évolution de vos produits (dividendes, subventions, intérêts, loyers exonérés) peut faire basculer le rapport sous 90 % d'une année sur l'autre.",
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: { libelle: 'Doctrine : le champ de la taxe sur les salaires', url: '/champ-application-taxe-sur-les-salaires/' },
      options: [
        {
          libelle: 'Oui, 90 % ou plus',
          detail: 'La quasi-totalité du chiffre d’affaires a été soumise à la TVA',
          icone: 'percent',
          versResultat: 'non-assujetti-90',
        },
        {
          libelle: 'Non, moins de 90 %',
          detail: 'Recettes exonérées ou hors champ significatives : holdings, finance, assurance, immobilier, santé, OSBL…',
          icone: 'stacked_bar_chart',
          versQuestion: 'rapport-connu',
        },
      ],
    },
    'rapport-connu': {
      id: 'rapport-connu',
      intitule: "Rapport d'assujettissement",
      image: '/images/finance.jpg',
      titre: "Votre rapport d'assujettissement est-il déterminé et fiabilisé ?",
      aide: "L'assiette de la taxe s'obtient en multipliant les rémunérations par le rapport d'assujettissement : au numérateur, les recettes n'ayant pas ouvert droit à déduction de la TVA et les recettes hors champ ; au dénominateur, le total des recettes de l'année précédant le versement. Attention aux pièges du classement : les dividendes entrent au numérateur (CE, 14 février 2018, n° 410302) alors qu'ils sont exclus du prorata de TVA ; les subventions y entrent aussi, sauf subventions exceptionnelles ou d'équipement (BOI-TPS-TS-20-30, § 160) ; les livraisons à soi-même en sont exclues, faute de flux avec des tiers (CE, 9 novembre 2015, n° 384536-384537, Crédit agricole).",
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: { libelle: "Doctrine : le coefficient d'assujettissement des holdings", url: '/taxe-salaires-holdings/coefficient-assujettissement-holdings/' },
      options: [
        {
          libelle: 'Oui, calculé et documenté',
          detail: 'Le classement de chaque catégorie de recettes est justifié : reste à optimiser',
          icone: 'calculate',
          versQuestion: 'sectorisation',
        },
        {
          libelle: 'Non, à calculer ou à sécuriser',
          detail: 'Dividendes, subventions, produits financiers, LASM : le classement reste à fiabiliser',
          icone: 'help_center',
          versResultat: 'rapport-a-calculer',
        },
      ],
    },
    sectorisation: {
      id: 'sectorisation',
      intitule: 'Sectorisation',
      image: '/images/scan-ts.jpg',
      titre: 'Vos activités sont-elles organisées en secteurs distincts ?',
      aide: "Relèvent de secteurs distincts les activités mettant en œuvre des cycles distincts d'opérations, avec un personnel et des moyens propres et une comptabilité distincte (CE, 4 janvier 1974, n° 8755). Lorsque des secteurs existent pour la TVA, la taxe sur les salaires se calcule secteur par secteur, et non au rapport général (CE, 28 juillet 1999, Boone and Cie et SA Financière Bayard) ; seuls les personnels non affectés de manière permanente et exclusive à un secteur relèvent du rapport général. La sectorisation peut même être invoquée sans avoir été déclarée, et constituée rétroactivement dans le délai de réclamation (CAA Nantes, 25 juin 2004, n° 00-1629, Meunier Participations).",
      references: [{ libelle: 'CGI, ann. II, art. 209' }],
      doctrine: { libelle: 'Doctrine : la sectorisation en taxe sur les salaires', url: '/sectorisation-taxe-sur-les-salaires/' },
      options: [
        {
          libelle: 'Oui, des secteurs sont constitués',
          detail: 'La taxe se calcule secteur par secteur : vos salaires affectés sont cantonnés',
          icone: 'stacked_bar_chart',
          versResultat: 'assujetti-sectorise',
        },
        {
          libelle: 'Non, mais mes activités sont distinctes',
          detail: 'Cycles, personnels et comptabilités séparables : la sectorisation est possible, même rétroactivement',
          icone: 'account_tree',
          versResultat: 'sectorisation-possible',
        },
        {
          libelle: 'Non, activité unique',
          detail: 'Le rapport d’assujettissement général s’applique à l’ensemble des rémunérations',
          icone: 'domain',
          versResultat: 'assujetti-partiel',
        },
      ],
    },

    /* ---------------- Sous-parcours holdings et dirigeants ---------------- */
    'ts-holding-activite': {
      id: 'ts-holding-activite',
      intitule: 'Profil de la holding',
      image: '/images/holdings.jpg',
      titre: 'Quel est le profil de votre holding ?',
      aide: "Une holding pure, qui se borne à percevoir des dividendes, n'est pas assujettie à la TVA : si elle emploie des salariés ou rémunère des dirigeants, elle est exposée à la taxe sur les salaires sur la totalité des rémunérations. Une holding mixte, qui facture des prestations à ses filiales tout en percevant des dividendes, est redevable partielle : son rapport d'assujettissement intègre au numérateur les dividendes et les produits hors champ (CE, 14 février 2018, n° 410302), selon des règles autonomes du prorata de TVA.",
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: { libelle: 'Doctrine : la taxe sur les salaires des holdings', url: '/taxe-salaires-holdings/' },
      options: [
        {
          libelle: 'Holding pure',
          detail: 'Dividendes et produits de participations uniquement, aucune prestation facturée',
          icone: 'payments',
          versResultat: 'ts-holding-pure',
        },
        {
          libelle: 'Holding mixte ou animatrice',
          detail: 'Prestations facturées aux filiales et perception de dividendes',
          icone: 'account_tree',
          versQuestion: 'ts-holding-dirigeant',
        },
      ],
    },
    'ts-holding-dirigeant': {
      id: 'ts-holding-dirigeant',
      intitule: 'Rémunération du dirigeant',
      image: '/images/holdings.jpg',
      titre: 'La rémunération de dirigeants est-elle en jeu ?',
      aide: "Les dirigeants de holdings mixtes sont présumés affectés à la fois au secteur économique et au secteur financier : leurs rémunérations suivent alors le rapport d'assujettissement général (CE, 8 juin 2011, n° 331848 et autres ; CE, 9 décembre 2021). Cette présomption est simple : elle tombe si l'organisation démontre qu'un dirigeant est dépourvu de tout contrôle et de toute responsabilité sur le secteur financier (CE, 8 juin 2011, n° 340863, SA Balsa ; CAA Paris, 21 janvier 2015, n° 14PA02737). Les mandataires sociaux de SAS sont dans le champ de la taxe même sans contrat de travail (CE, 21 janvier 2016, n° 388989 Juliane et n° 388676 Sovaro).",
      references: [{ libelle: 'CGI, art. 231' }],
      doctrine: { libelle: "Doctrine : les règles d'affectation dans les holdings", url: '/taxe-salaires-holdings/affectation-holding/' },
      options: [
        {
          libelle: 'Oui, des dirigeants sont rémunérés par la holding',
          detail: 'Présidents, directeurs généraux, mandataires de SAS : la présomption transversale s’applique',
          icone: 'badge',
          versResultat: 'ts-dirigeant',
        },
        {
          libelle: 'Non, uniquement des salariés affectés',
          detail: 'Les équipes sont affectées à des activités identifiées : la sectorisation devient le levier',
          icone: 'verified',
          versQuestion: 'sectorisation',
        },
      ],
    },

    /* ---------------- Sous-parcours secteur financier ---------------- */
    'ts-fin-profil': {
      id: 'ts-fin-profil',
      intitule: 'Profil financier',
      image: '/images/finance.jpg',
      titre: 'Quel est votre profil ?',
      aide: "Le secteur financier est structurellement exposé : la taxe ne se déduit pas, elle pèse sur des rémunérations élevées, et elle crée une distorsion avec les banques étrangères non assujetties. Les établissements de crédit doivent porter une attention particulière au classement de leurs produits dans le rapport d'assujettissement ; les assureurs, dont le prorata de TVA est traditionnellement faible, sont parmi les plus taxés — et parmi les premiers candidats au groupe TVA.",
      references: [{ libelle: 'CGI, art. 231' }],
      doctrine: { libelle: 'Doctrine : la taxe sur les salaires du secteur financier', url: '/taxe-salaires-etablissements-financiers/' },
      options: [
        {
          libelle: "Établissement de crédit ou d'investissement",
          detail: 'Banque, société de financement, entreprise d’investissement',
          icone: 'account_balance',
          versQuestion: 'ts-fin-produits',
        },
        {
          libelle: 'Assureur, mutuelle ou courtier',
          detail: 'Opérations exonérées sans option : la sectorisation et le groupe TVA sont les leviers',
          icone: 'verified_user',
          versQuestion: 'sectorisation',
        },
      ],
    },
    'ts-fin-produits': {
      id: 'ts-fin-produits',
      intitule: 'Produits atypiques',
      image: '/images/finance.jpg',
      titre: 'Vos produits atypiques sont-ils correctement classés ?',
      aide: "Plusieurs classements sont contre-intuitifs. Les dividendes, exclus du prorata de TVA (CJUE, Satam), entrent au numérateur du rapport d'assujettissement à la taxe sur les salaires (CE, 14 février 2018, n° 410302). Les produits de titres immobilisés peuvent en être exclus s'ils n'excèdent pas 5 % des recettes. Les instruments financiers à terme suivent le chiffre d'affaires retenu pour le coefficient de taxation TVA (BOI-TVA-SECT-50-40). Les prestations internes siège-succursale sont en principe comptées, sous réserve des jurisprudences Skandia et Danske Bank et du rescrit n° 2008/13 pour les succursales ne servant que leur siège.",
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: { libelle: "Doctrine : le coefficient d'assujettissement du secteur financier", url: '/taxe-salaires-etablissements-financiers/coefficient-assujettissement-financier/' },
      options: [
        {
          libelle: 'Oui, classement documenté',
          detail: 'Dividendes, titres immobilisés, IFT et flux internes justifiés ligne à ligne',
          icone: 'check_circle',
          versQuestion: 'sectorisation',
        },
        {
          libelle: 'Non, à sécuriser',
          detail: 'Des classements incertains peuvent coûter cher dans les deux sens',
          icone: 'error',
          versResultat: 'fin-a-securiser',
        },
      ],
    },

    /* ---------------- Sous-parcours groupe TVA ---------------- */
    'ts-groupe': {
      id: 'ts-groupe',
      intitule: 'Groupe TVA',
      image: '/images/scan-ts.jpg',
      titre: "Êtes-vous membre d'un assujetti unique (groupe TVA) ?",
      aide: "Le groupe TVA détaxe les flux internes… mais pas pour la taxe sur les salaires : chaque membre reste redevable individuellement (CGI, art. 256 C, III, 7) et les livraisons et prestations internes, placées hors du champ de la TVA, sont prises en compte dans le rapport d'assujettissement de l'année où leur exigibilité serait intervenue (BOI-TVA-AU-30, § 80). Les membres constituent des secteurs de l'assujetti unique et peuvent créer des sous-secteurs (art. 256 C, III, 3), repris pour la taxe sur les salaires.",
      references: [{ libelle: 'CGI, art. 256 C' }],
      doctrine: { libelle: 'Doctrine : groupe TVA et taxe sur les salaires', url: '/impact-groupe-tva-taxe-salaires/' },
      options: [
        {
          libelle: 'Oui, avec des flux internes importants',
          detail: 'Prestations intragroupe détaxées en TVA : le surcoût de taxe sur les salaires doit être mesuré',
          icone: 'sync_alt',
          versResultat: 'ts-groupe-interne',
        },
        {
          libelle: 'Oui, sans flux internes notables',
          detail: 'Le rapport de chaque membre reste piloté par ses recettes externes',
          icone: 'check_circle',
          versQuestion: 'sectorisation',
        },
        {
          libelle: 'Non, mais le groupe TVA est en projet',
          detail: "L'arbitrage gain de TVA contre surcoût de taxe sur les salaires se calcule avant d'opter",
          icone: 'help_center',
          versResultat: 'ts-groupe-projet',
        },
      ],
    },

    /* ---------------- Sous-parcours santé ---------------- */
    'ts-sante': {
      id: 'ts-sante',
      intitule: 'Établissement de santé',
      image: '/images/sante.jpg',
      titre: "Quel type d'établissement êtes-vous ?",
      aide: "Le secteur de la santé est l'un des premiers contributeurs de la taxe sur les salaires. Les établissements publics sont hors du champ de la TVA (art. 256 B) et donc largement redevables — y compris les EHPAD publics (CE, 7 avril 2023, n° 463241 ; CAA Toulouse, 25 janvier 2024, n° 22TL20761). Les établissements privés autorisés cumulent exonérations de soins (art. 261, 4, 1° et 1° bis) et activités taxées (chambres particulières hors soins, parapharmacie…) : leur rapport se travaille. Des exonérations ciblées existent, notamment pour le personnel de cantine (BOI-TPS-TS-20-20, § 300) et les contrats aidés (art. 231 bis N).",
      references: [{ libelle: 'CGI, art. 256 B et 261, 4' }],
      doctrine: { libelle: "Doctrine : le coefficient d'assujettissement de la santé", url: '/taxe-salaires-sante/coefficient-assujettissement-sante/' },
      options: [
        {
          libelle: 'Établissement public de santé',
          detail: 'Hôpital, EHPAD public : hors du champ de la TVA, taxe sur les salaires largement due',
          icone: 'domain',
          versResultat: 'ts-sante-public',
        },
        {
          libelle: 'Clinique ou EHPAD privé',
          detail: 'Activités mixtes taxées et exonérées : rapport et sectorisation à travailler',
          icone: 'medical_services',
          versQuestion: 'sectorisation',
        },
        {
          libelle: 'Professionnel libéral exonéré',
          detail: 'Soins exonérés : la taxe sur les salaires suit les rémunérations versées',
          icone: 'person',
          versQuestion: 'sectorisation',
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
        "Vérifiez l'absence d'établissement en France au sens de la jurisprudence : la permanence d'un centre d'opérations doté d'une certaine autonomie suffit à caractériser l'établissement.",
        'Une succursale française, même au service exclusif de son siège étranger, redevient un employeur en France.',
      ],
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: { libelle: 'Doctrine : le champ de la taxe sur les salaires', url: '/champ-application-taxe-sur-les-salaires/' },
    },
    exempte: {
      id: 'exempte',
      qualification: "Employeur exempté de taxe sur les salaires",
      ton: 'positif',
      resume:
        "Votre catégorie d'employeur est expressément exemptée par le CGI : la taxe sur les salaires n'est pas due, indépendamment de votre situation TVA.",
      consequences: [
        "Les exemptions sont d'interprétation stricte : conservez la justification précise de votre rattachement à la catégorie.",
        "Un changement d'activité ou de statut peut faire perdre l'exemption : réexaminez la situation à chaque évolution.",
      ],
      references: [{ libelle: 'CGI, art. 231 et 231 bis P' }],
      doctrine: { libelle: 'Doctrine : le champ de la taxe sur les salaires', url: '/champ-application-taxe-sur-les-salaires/' },
    },
    'non-assujetti-90': {
      id: 'non-assujetti-90',
      qualification: 'Non redevable de la taxe sur les salaires',
      ton: 'positif',
      resume:
        "Assujetti à la TVA sur au moins 90 % de votre chiffre d'affaires l'année précédente, vous n'êtes pas redevable de la taxe sur les salaires au titre des rémunérations versées cette année.",
      consequences: [
        'Surveillez le rapport chaque année : le franchissement du seuil se mesure année civile par année civile.',
        "Une évolution de l'activité (produits financiers, subventions, dividendes, loyers exonérés…) peut faire basculer le rapport sous 90 %.",
        'Anticipez : une option pour la taxation (locations, opérations financières) peut maintenir le rapport au-dessus du seuil.',
      ],
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: { libelle: 'Doctrine : le champ de la taxe sur les salaires', url: '/champ-application-taxe-sur-les-salaires/' },
    },
    'assujetti-partiel': {
      id: 'assujetti-partiel',
      qualification: 'Redevable de la taxe sur les salaires',
      ton: 'attention',
      resume:
        "Vous êtes redevable de la taxe sur les salaires sur une assiette égale aux rémunérations multipliées par votre rapport d'assujettissement général.",
      consequences: [
        "Assiette = rémunérations imposables × rapport d'assujettissement de l'année précédente ; la taxe se calcule ensuite selon un barème progressif par salarié, atténué par la franchise et la décote.",
        "Sans sectorisation, le rapport général s'applique à tous les personnels, y compris ceux affectés aux seules activités taxées.",
        'La sectorisation et une affectation documentée des équipes constituent le principal levier de réduction : un audit est souvent rentable.',
      ],
      references: [{ libelle: 'CGI, art. 231' }, { libelle: 'CGI, art. 1679 et 1679 A' }],
      doctrine: { libelle: 'Doctrine : la sectorisation en taxe sur les salaires', url: '/sectorisation-taxe-sur-les-salaires/' },
      etapeSuivante: { libelle: 'Faire auditer mon rapport par un expert', url: '/expert/' },
    },
    'assujetti-sectorise': {
      id: 'assujetti-sectorise',
      qualification: 'Redevable, avec des secteurs constitués',
      ton: 'mixte',
      resume:
        "La taxe sur les salaires se détermine à l'intérieur de chaque secteur distinct, et non d'après le rapport général : vos personnels affectés aux secteurs taxés y échappent.",
      consequences: [
        'Les rémunérations des personnels affectés de manière permanente et exclusive à un secteur suivent le rapport de ce secteur (CE, 28 juillet 1999, Boone and Cie et Financière Bayard).',
        'Les personnels transversaux (direction, fonctions support) restent soumis au rapport général : leur affectation réelle mérite documentation.',
        "Vérifiez chaque année la cohérence entre secteurs TVA et secteurs retenus pour la taxe sur les salaires.",
      ],
      references: [{ libelle: 'CGI, ann. II, art. 209' }],
      doctrine: { libelle: 'Doctrine : la sectorisation en taxe sur les salaires', url: '/sectorisation-taxe-sur-les-salaires/' },
    },
    'sectorisation-possible': {
      id: 'sectorisation-possible',
      qualification: 'Redevable — une sectorisation est possible',
      ton: 'attention',
      resume:
        "Vos activités présentent des cycles, des personnels et des comptabilités séparables : la sectorisation peut cantonner la taxe aux seuls personnels des activités non taxées — y compris rétroactivement.",
      consequences: [
        "La sectorisation peut être invoquée même sans secteurs déclarés, et constituée rétroactivement dans le délai de réclamation (CAA Nantes, 25 juin 2004, Meunier Participations) : un remboursement des années non prescrites est envisageable.",
        'Elle exige de calculer un coefficient par secteur et de documenter l’affectation permanente et exclusive des personnels.',
        "C'est le chantier au meilleur rendement du dossier : faites-le chiffrer.",
      ],
      references: [{ libelle: 'CGI, ann. II, art. 209' }],
      doctrine: { libelle: 'Doctrine : la sectorisation en taxe sur les salaires', url: '/sectorisation-taxe-sur-les-salaires/' },
      etapeSuivante: { libelle: 'Chiffrer une sectorisation avec un expert', url: '/expert/' },
    },
    'rapport-a-calculer': {
      id: 'rapport-a-calculer',
      qualification: "Rapport d'assujettissement à fiabiliser",
      ton: 'mixte',
      resume:
        "Votre situation exige de calculer et de documenter le rapport d'assujettissement : chaque catégorie de recettes doit être classée, et plusieurs classements sont contre-intuitifs.",
      consequences: [
        'Au numérateur : recettes exonérées sans droit à déduction, recettes hors champ, dividendes (CE, 14 février 2018, n° 410302), subventions non exceptionnelles.',
        "Hors rapport : livraisons à soi-même (CE, 9 novembre 2015, Crédit agricole), subventions exceptionnelles et d'équipement (BOI-TPS-TS-20-30, § 160).",
        'Le Scan TVA vous aide à qualifier chaque flux avant de poser le calcul.',
      ],
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: { libelle: "Doctrine : le coefficient d'assujettissement des holdings", url: '/taxe-salaires-holdings/coefficient-assujettissement-holdings/' },
      etapeSuivante: { libelle: 'Qualifier mes recettes avec le Scan TVA', url: '/scan-tva/' },
    },
    'ts-holding-pure': {
      id: 'ts-holding-pure',
      qualification: 'Holding pure : taxe sur les salaires intégrale',
      ton: 'negatif',
      resume:
        "Non assujettie à la TVA, la holding pure est redevable de la taxe sur les salaires sur la totalité des rémunérations qu'elle verse, dirigeants compris.",
      consequences: [
        'Les rémunérations des mandataires sociaux entrent dans l’assiette même sans contrat de travail (CE, 21 janvier 2016, Juliane et Sovaro).',
        'Pistes de structuration : facturer des prestations aux filiales pour devenir redevable partiel, faire porter les rémunérations par les filiales opérationnelles, ou étudier le groupe TVA.',
        "Chaque piste a des contreparties (TVA, social, gouvernance) : l'arbitrage se chiffre.",
      ],
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: { libelle: 'Doctrine : la taxe sur les salaires des holdings', url: '/taxe-salaires-holdings/' },
      etapeSuivante: { libelle: 'Étudier une restructuration avec un expert', url: '/expert/' },
    },
    'ts-dirigeant': {
      id: 'ts-dirigeant',
      qualification: 'Dirigeants présumés transversaux',
      ton: 'attention',
      resume:
        "Les dirigeants de votre holding mixte sont présumés affectés au secteur financier comme au secteur économique : leurs rémunérations suivent le rapport d'assujettissement général.",
      consequences: [
        'La présomption est simple : elle tombe en démontrant qu’un dirigeant est dépourvu de tout contrôle et responsabilité sur le secteur financier (CE, 8 juin 2011, SA Balsa ; CAA Paris, 21 janvier 2015).',
        "Les délégations de pouvoirs, l'organisation des comités et la documentation des fonctions réelles font la preuve.",
        "L'enjeu est souvent élevé : les rémunérations de dirigeants concentrent l'essentiel de la taxe des holdings.",
      ],
      references: [{ libelle: 'CGI, art. 231' }],
      doctrine: { libelle: "Doctrine : les règles d'affectation dans les holdings", url: '/taxe-salaires-holdings/affectation-holding/' },
      etapeSuivante: { libelle: "Organiser l'affectation des dirigeants avec un expert", url: '/expert/' },
    },
    'fin-a-securiser': {
      id: 'fin-a-securiser',
      qualification: 'Classements financiers à sécuriser',
      ton: 'attention',
      resume:
        "Dividendes, titres immobilisés, instruments à terme, flux internes : plusieurs postes de votre rapport d'assujettissement reposent sur des règles autonomes de la TVA et méritent d'être documentés.",
      consequences: [
        'Dividendes au numérateur (CE, 14 février 2018, n° 410302) ; produits de titres immobilisés exclus s’ils restent sous 5 % des recettes.',
        'Instruments financiers à terme : reprendre le chiffre d’affaires retenu pour le coefficient de taxation TVA (BOI-TVA-SECT-50-40).',
        'Succursales : prestations internes en principe comptées, sauf jurisprudences Skandia et Danske Bank et rescrit n° 2008/13 pour les succursales servant exclusivement leur siège.',
      ],
      references: [{ libelle: 'CGI, art. 231, 1' }],
      doctrine: { libelle: "Doctrine : le coefficient d'assujettissement du secteur financier", url: '/taxe-salaires-etablissements-financiers/coefficient-assujettissement-financier/' },
      etapeSuivante: { libelle: 'Faire sécuriser ces classements', url: '/expert/' },
    },
    'ts-groupe-interne': {
      id: 'ts-groupe-interne',
      qualification: 'Groupe TVA : flux internes comptés',
      ton: 'attention',
      resume:
        "Vos flux internes, détaxés en TVA par l'assujetti unique, restent pris en compte dans le rapport d'assujettissement à la taxe sur les salaires de chaque membre.",
      consequences: [
        "Chaque membre demeure redevable individuellement et calcule son propre rapport, sous-secteurs compris (CGI, art. 256 C, III, 7 ; BOI-TVA-AU-30, § 80).",
        'Exceptions : les flux couverts par les jurisprudences Skandia et Danske Bank restent taxés à la TVA et échappent à la taxe sur les salaires.',
        'Le surcoût de taxe sur les salaires doit être mis en regard du gain de TVA sur les flux internes : cet arbitrage se recalcule à chaque évolution du groupe.',
      ],
      references: [{ libelle: 'CGI, art. 256 C' }],
      doctrine: { libelle: 'Doctrine : groupe TVA et taxe sur les salaires', url: '/impact-groupe-tva-taxe-salaires/coefficient-assujettissement-groupe-tva-taxe-salaires-operations-internes/' },
      etapeSuivante: { libelle: 'Faire chiffrer l’arbitrage groupe TVA', url: '/expert/' },
    },
    'ts-groupe-projet': {
      id: 'ts-groupe-projet',
      qualification: 'Projet de groupe TVA : arbitrage à chiffrer',
      ton: 'mixte',
      resume:
        "Le groupe TVA détaxe les flux internes mais alourdit en contrepartie la taxe sur les salaires des membres prestataires : l'option ne se prend qu'après chiffrage.",
      consequences: [
        'Gains : plus de TVA sur les prestations intragroupe, trésorerie et prorata améliorés pour les membres preneurs.',
        'Coûts : flux internes comptés au rapport d’assujettissement des membres prestataires, sectorisations à reconstruire par membre.',
        "Les assureurs, au prorata déjà faible, y trouvent souvent un intérêt net ; pour les banques, l'équation est plus fine.",
      ],
      references: [{ libelle: 'CGI, art. 256 C' }],
      doctrine: { libelle: 'Doctrine : groupe TVA et taxe sur les salaires', url: '/impact-groupe-tva-taxe-salaires/' },
      etapeSuivante: { libelle: 'Étudier l’option avec un expert', url: '/expert/' },
    },
    'ts-sante-public': {
      id: 'ts-sante-public',
      qualification: 'Établissement public : taxe largement due',
      ton: 'negatif',
      resume:
        "Hors du champ de la TVA pour leurs activités de service public (art. 256 B), les établissements publics de santé sont redevables de la taxe sur les salaires — y compris les EHPAD publics.",
      consequences: [
        "L'activité d'hébergement de personnes âgées par un établissement public reste hors du champ de la TVA sans distorsion de concurrence (CE, 7 avril 2023, n° 463241 ; CAA Toulouse, 25 janvier 2024).",
        'Des exonérations ciblées subsistent : personnel de cantine sous conditions (BOI-TPS-TS-20-20, § 300), contrats d’accompagnement et d’avenir (art. 231 bis N).',
        'Les subventions exceptionnelles et d’équipement restent hors du rapport d’assujettissement (BOI-TPS-TS-20-30, § 160).',
      ],
      references: [{ libelle: 'CGI, art. 256 B' }, { libelle: 'CGI, art. 231 bis N' }],
      doctrine: { libelle: "Doctrine : le coefficient d'assujettissement de la santé", url: '/taxe-salaires-sante/coefficient-assujettissement-sante/' },
      etapeSuivante: { libelle: 'Passer en revue les exonérations mobilisables', url: '/expert/' },
    },
  },
};
