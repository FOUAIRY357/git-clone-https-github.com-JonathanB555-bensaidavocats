import type { ArbreScan } from './types';

/**
 * Arbre de décision du Scan TVA — VERSION DE TRAVAIL DÉTAILLÉE.
 *
 * Tronc commun : qualité d'assujetti → nature de l'opération → titre onéreux →
 * territorialité → exonérations → options → assimilations (art. 271, V).
 * Sous-parcours : holdings, opérations immobilières, opérations financières
 * et d'assurance, santé — nourris de la doctrine du site (pages migrées).
 *
 * ⚠ Chaque nœud doit être validé par le cabinet avant mise en ligne.
 */
export const arbreTva: ArbreScan = {
  id: 'tva',
  titre: 'Scanner de taxabilité TVA',
  sousTitre:
    "Qualifiez une opération au regard de la TVA et mesurez son incidence sur votre droit à déduction.",
  avertissement:
    "Version de travail : l'arbre de décision est en cours de validation par le cabinet.",
  entree: 'assujetti',
  profondeurEstimee: 6,
  questions: {
    assujetti: {
      id: 'assujetti',
      intitule: 'Qualité d’assujetti',
      titre: "Qui réalise l'opération ?",
      image: '/images/scan-tva.jpg',
      aide: "La TVA ne s'applique qu'aux opérations réalisées par un assujetti agissant en tant que tel : une personne qui exerce de manière indépendante une activité économique, quels qu'en soient le statut, la forme ou le but (CGI, art. 256 A). Un particulier qui gère son patrimoine privé n'agit pas en tant qu'assujetti ; il en va de même, en principe, d'une personne publique dans le cadre de ses prérogatives de puissance publique (art. 256 B). Les holdings suivent un raisonnement propre : tout dépend de leur immixtion dans la gestion des filiales.",
      references: [{ libelle: 'CGI, art. 256 A' }, { libelle: 'CGI, art. 256 B' }],
      doctrine: { libelle: "Doctrine : l'assujettissement à la TVA", url: '/assujettissement-tva/' },
      options: [
        {
          libelle: 'Une entreprise ou un professionnel',
          detail: "Société commerciale, professionnel libéral, association exerçant une activité économique : l'assujetti classique",
          icone: 'verified',
          versQuestion: 'nature',
        },
        {
          libelle: 'Une holding',
          detail: 'Société de détention de participations : le régime dépend de son immixtion dans ses filiales',
          icone: 'account_tree',
          versQuestion: 'holding-role',
        },
        {
          libelle: 'Un particulier, dans un cadre patrimonial',
          detail: 'Gestion du patrimoine privé, sans démarches actives de commercialisation',
          icone: 'person_off',
          versResultat: 'hors-champ',
        },
        {
          libelle: 'Une personne publique dans ses prérogatives',
          detail: "Service administratif, social, éducatif ou culturel d'une collectivité ou d'un établissement public",
          icone: 'domain',
          versResultat: 'hors-champ',
        },
      ],
    },
    'holding-role': {
      id: 'holding-role',
      intitule: 'Rôle de la holding',
      titre: 'Quel est le rôle de la holding dans cette opération ?',
      image: '/images/holdings.jpg',
      aide: "La simple perception de dividendes, d'intérêts occasionnels ou le produit de cessions de titres dans une gestion patrimoniale sont hors du champ de la TVA (CJUE, Sofitam, C-333/91) : c'est la situation de la holding « pure ». À l'inverse, l'immixtion dans la gestion des filiales — prestations administratives, financières, commerciales ou techniques facturées — constitue une activité économique (CJUE, Floridienne et Berginvest, C-142/99). Les refacturations à l'euro l'euro sont elles-mêmes taxables (CE, Lagardère, 13 décembre 2017).",
      references: [{ libelle: 'CGI, art. 256 A' }],
      doctrine: { libelle: 'Doctrine : le champ d’application de la TVA des holdings', url: '/holdings-tva/champ-application-tva-holding/' },
      options: [
        {
          libelle: 'Elle facture des prestations à ses filiales',
          detail: "Management fees, prestations administratives, refacturations : la holding animatrice s'immisce dans la gestion",
          icone: 'sync_alt',
          versQuestion: 'nature',
        },
        {
          libelle: 'Elle perçoit des dividendes ou cède des titres',
          detail: 'Fruits de la simple détention de participations, gestion patrimoniale des titres',
          icone: 'payments',
          versResultat: 'hors-champ-holding',
        },
        {
          libelle: 'Elle prête à ses filiales et perçoit des intérêts',
          detail: "Les intérêts d'avances en compte courant sont dans le champ, mais exonérés : direction sous-parcours financier",
          icone: 'percent',
          versQuestion: 'fin-option',
        },
      ],
    },
    nature: {
      id: 'nature',
      intitule: "Nature de l'opération",
      titre: "De quelle nature est l'opération ?",
      image: '/images/scan-tva.jpg',
      aide: "La TVA distingue les livraisons de biens (transfert du pouvoir de disposer d'un bien corporel comme un propriétaire) des prestations de services (toute autre opération, art. 256, I à IV). Certains univers obéissent à des règles spéciales qu'il faut emprunter d'emblée : les opérations immobilières (ventes, locations, travaux), les opérations bancaires, financières et d'assurance, et les prestations de soins. Choisissez le parcours qui correspond à votre opération.",
      references: [{ libelle: 'CGI, art. 256' }],
      doctrine: { libelle: "Doctrine : le champ d'application de la TVA", url: '/doctrine/champ-application-tva/' },
      options: [
        {
          libelle: 'Livraison de biens ou prestation de services',
          detail: 'Ventes de marchandises, conseil, licences, mise à disposition de personnel, management fees…',
          icone: 'receipt_long',
          versQuestion: 'onereux',
        },
        {
          libelle: 'Opération immobilière',
          detail: "Vente d'immeuble ou de terrain, location, travaux immobiliers, transmission d'un immeuble loué",
          icone: 'apartment',
          versQuestion: 'immo-type',
        },
        {
          libelle: "Opération financière ou d'assurance",
          detail: 'Crédits et intérêts, opérations sur titres, garde et gestion, assurance et courtage',
          icone: 'account_balance',
          versQuestion: 'fin-type',
        },
        {
          libelle: 'Prestation médicale ou de soins',
          detail: 'Actes des professions médicales et paramédicales, établissements de santé, EHPAD',
          icone: 'medical_services',
          versQuestion: 'sante-but',
        },
      ],
    },
    onereux: {
      id: 'onereux',
      intitule: 'Opération à titre onéreux',
      titre: "L'opération comporte-t-elle une contrepartie directe ?",
      image: '/images/scan-tva.jpg',
      aide: "Seules les opérations effectuées à titre onéreux entrent dans le champ de la TVA : il faut un lien direct entre le service rendu ou le bien livré et la contre-valeur reçue (CGI, art. 256, I). Restent donc hors champ les dividendes, les subventions qui ne rémunèrent aucune prestation et ne complètent pas un prix, ou les indemnités purement réparatrices. Cas particulier : la transmission d'une universalité totale ou partielle de biens entre redevables (fonds de commerce, immeuble loué avec poursuite des baux) est dispensée de TVA par l'article 257 bis — ni taxation, ni exonération.",
      references: [{ libelle: 'CGI, art. 256, I' }, { libelle: 'CGI, art. 257 bis' }],
      doctrine: { libelle: "Doctrine : le champ d'application de la TVA", url: '/doctrine/champ-application-tva/' },
      options: [
        {
          libelle: 'Oui, une contrepartie directe existe',
          detail: 'Prix, redevance, commission, loyer ou avantage convenu en échange de la prestation ou du bien',
          icone: 'sync_alt',
          versQuestion: 'territorialite',
        },
        {
          libelle: 'Non, aucune contrepartie directe',
          detail: 'Dividendes, subventions de fonctionnement, indemnités purement réparatrices',
          icone: 'block',
          versResultat: 'hors-champ',
        },
        {
          libelle: "Transmission d'une universalité de biens",
          detail: "Cession d'une branche complète d'activité entre redevables, avec poursuite de l'exploitation",
          icone: 'domain',
          versResultat: 'dispense-257bis',
        },
      ],
    },
    territorialite: {
      id: 'territorialite',
      intitule: 'Territorialité',
      titre: "L'opération est-elle située en France ?",
      image: '/images/scan-tva.jpg',
      aide: "Le lieu d'imposition dépend de la nature de l'opération et de la qualité du preneur. Entre assujettis (B2B), une prestation de services est en principe imposable au lieu d'établissement du preneur (art. 259) ; envers un non-assujetti (B2C), au lieu du prestataire — avec de nombreuses dérogations (immeubles, transports, services électroniques…). Pour les biens, comptent la localisation et le transport (art. 258). Une opération située hors de France n'y est pas imposable, mais peut y préserver le droit à déduction (art. 271, V, d).",
      references: [{ libelle: 'CGI, art. 258 à 259 D' }],
      doctrine: { libelle: 'Doctrine : la territorialité de la TVA', url: '/doctrine/territorialite-tva/' },
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
      titre: "L'opération relève-t-elle d'une exonération ?",
      image: '/images/scan-tva.jpg',
      aide: "Certaines opérations situées dans le champ de la TVA en sont exonérées par la loi : enseignement, organismes sans but lucratif à gestion désintéressée, locations nues… (art. 261 et suivants). Attention à une distinction décisive : les exportations et les livraisons intracommunautaires sont exonérées (art. 262 et 262 ter) mais assimilées à des opérations taxées pour le droit à déduction — elles ne coûtent rien en TVA d'amont. Les autres exonérations ferment en principe la déduction.",
      references: [{ libelle: 'CGI, art. 261' }, { libelle: 'CGI, art. 262 et 262 ter' }],
      doctrine: { libelle: 'Doctrine : les exonérations de TVA', url: '/doctrine/exonerations-tva/' },
      options: [
        {
          libelle: 'Non, aucune exonération',
          detail: "L'opération relève du régime de droit commun : TVA collectée, déduction ouverte",
          icone: 'check_circle',
          versResultat: 'taxee',
        },
        {
          libelle: 'Exportation ou livraison intracommunautaire',
          detail: 'Biens expédiés hors de France : exonération qui préserve le droit à déduction',
          icone: 'flight_takeoff',
          versResultat: 'assimilee-taxee',
        },
        {
          libelle: "Une autre exonération s'applique",
          detail: 'Enseignement, OSBL, locations exonérées, autres cas des art. 261 et suivants',
          icone: 'shield',
          versQuestion: 'option',
        },
      ],
    },
    option: {
      id: 'option',
      intitule: 'Option pour la taxation',
      titre: 'Une option pour la taxation a-t-elle été exercée ?',
      image: '/images/scan-tva.jpg',
      aide: "Pour certaines opérations exonérées, la loi permet d'opter pour la taxation : locations de locaux nus à usage professionnel (art. 260, 2°), la plupart des opérations bancaires et financières (art. 260 B, désormais exerçable opération par opération). L'option restaure le droit à déduction sur les dépenses affectées et réduit mécaniquement la taxe sur les salaires. Vérifiez qu'elle a été formalisée à temps, et son périmètre exact.",
      references: [{ libelle: 'CGI, art. 260 et 260 B' }],
      doctrine: { libelle: "Doctrine : la lettre d'option TVA", url: '/lettre-option-tva/' },
      options: [
        {
          libelle: 'Oui, une option est exercée',
          detail: "L'option couvre l'opération examinée pour la période concernée, et a été régulièrement formalisée",
          icone: 'toggle_on',
          versResultat: 'taxee-option',
        },
        {
          libelle: 'Non, aucune option',
          detail: "Aucune option n'a été exercée, ou l'opération n'y est pas éligible",
          icone: 'toggle_off',
          versQuestion: 'assimilee',
        },
      ],
    },
    assimilee: {
      id: 'assimilee',
      intitule: 'Assimilation aux opérations taxées',
      titre: "L'opération exonérée ouvre-t-elle néanmoins droit à déduction ?",
      image: '/images/scan-tva.jpg',
      aide: "Par exception, certaines opérations exonérées restent assimilées à des opérations taxées pour l'exercice du droit à déduction (art. 271, V) : c'est notamment le cas des opérations bancaires, financières ou d'assurance réalisées avec des preneurs établis hors de l'Union européenne. Ces opérations s'inscrivent au numérateur du coefficient de taxation : ne les classez pas avec les exonérations ordinaires.",
      references: [{ libelle: 'CGI, art. 271, V' }],
      doctrine: { libelle: 'Doctrine : le droit à déduction et les coefficients', url: '/doctrine/droit-a-deduction/' },
      options: [
        {
          libelle: 'Oui, opération assimilée à une opération taxée',
          detail: 'Opération financière ou d’assurance avec un preneur établi hors de l’Union européenne, notamment',
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

    /* ---------------- Sous-parcours immobilier ---------------- */
    'immo-type': {
      id: 'immo-type',
      intitule: 'Opération immobilière',
      titre: "De quel type d'opération immobilière s'agit-il ?",
      image: '/images/immobilier.jpg',
      aide: "La TVA immobilière distingue les ventes (le régime dépend de la nature du bien et de son ancienneté), les locations (exonérées ou taxées selon la nature des locaux et les options) et les travaux immobiliers, qui sont des prestations de services taxées lorsqu'ils concourent directement à l'édification d'un bâtiment ou à des équipements incorporés de façon permanente (CE, Solar Electric Martinique, 12 janvier 2018). La transmission d'un immeuble loué avec poursuite des baux peut relever de la dispense de l'article 257 bis. Ce parcours suppose une opération située en France.",
      references: [{ libelle: 'CGI, art. 256 et 257' }],
      doctrine: { libelle: 'Doctrine : la TVA immobilière', url: '/tva-immobiliere/' },
      options: [
        {
          libelle: "Vente d'un immeuble ou d'un terrain",
          detail: 'Cession, apport en société : le régime dépend de la nature et de l’ancienneté du bien',
          icone: 'receipt_long',
          versQuestion: 'immo-vente',
        },
        {
          libelle: 'Location immobilière',
          detail: 'Locaux nus, aménagés, à usage professionnel ou d’habitation, para-hôtellerie',
          icone: 'apartment',
          versQuestion: 'immo-location',
        },
        {
          libelle: 'Travaux immobiliers ou construction',
          detail: 'Travaux concourant à l’édification du bâtiment ou équipements incorporés de façon permanente',
          icone: 'calculate',
          versResultat: 'taxee',
        },
        {
          libelle: "Transmission d'un immeuble loué (universalité)",
          detail: 'Vente entre redevables avec poursuite de l’activité locative soumise à la TVA',
          icone: 'domain',
          versResultat: 'dispense-257bis',
        },
      ],
    },
    'immo-vente': {
      id: 'immo-vente',
      intitule: 'Vente immobilière',
      titre: 'Que vendez-vous ?',
      image: '/images/immobilier.jpg',
      aide: "Réalisées par un assujetti agissant en tant que tel, les livraisons de terrains à bâtir et d'immeubles achevés depuis cinq ans au plus sont taxées de plein droit. Les livraisons d'immeubles achevés depuis plus de cinq ans et de terrains qui ne sont pas à bâtir sont exonérées, avec faculté d'option pour la taxation — un choix qui commande la récupération de la TVA d'amont et les régularisations sur vingtièmes. Ce parcours suppose une opération située en France.",
      references: [{ libelle: 'CGI, art. 257 et 261, 5' }, { libelle: 'CGI, art. 260, 5° bis' }],
      doctrine: { libelle: 'Doctrine : le champ de la TVA immobilière', url: '/tva-immobiliere/champ-dapplication-tva-immobiliere/' },
      options: [
        {
          libelle: 'Un terrain à bâtir',
          detail: 'Taxé de plein droit lorsqu’il est cédé par un assujetti agissant en tant que tel',
          icone: 'crop_free',
          versResultat: 'taxee',
        },
        {
          libelle: 'Un immeuble achevé depuis 5 ans au plus',
          detail: "Immeuble neuf au sens de la TVA : taxation de plein droit",
          icone: 'apartment',
          versResultat: 'taxee',
        },
        {
          libelle: 'Un immeuble achevé depuis plus de 5 ans',
          detail: 'Exonéré, sauf option du vendeur pour la taxation',
          icone: 'domain',
          versQuestion: 'immo-option-vente',
        },
        {
          libelle: "Un terrain qui n'est pas à bâtir",
          detail: 'Exonéré, sauf option pour la taxation',
          icone: 'block',
          versQuestion: 'immo-option-vente',
        },
      ],
    },
    'immo-option-vente': {
      id: 'immo-option-vente',
      intitule: 'Option sur la vente',
      titre: 'Le vendeur opte-t-il pour la taxation de la vente ?',
      image: '/images/immobilier.jpg',
      aide: "La vente exonérée d'un immeuble ancien ou d'un terrain non à bâtir peut être volontairement soumise à la TVA sur option du cédant, généralement formalisée dans l'acte notarié. L'option préserve les droits à déduction du vendeur et évite des régularisations de la TVA antérieurement déduite (reversement calculé sur les vingtièmes restant à courir, art. 207 de l'annexe II). À défaut d'option expresse, l'exonération s'applique.",
      references: [{ libelle: 'CGI, art. 260, 5° bis' }, { libelle: 'CGI, ann. II, art. 207' }],
      doctrine: { libelle: 'Doctrine : la déduction de la TVA immobilière', url: '/tva-immobiliere/deduction-tva-immobiliere/' },
      options: [
        {
          libelle: "Oui, l'option est formalisée",
          detail: "Mention expresse dans l'acte : la vente est soumise à la TVA",
          icone: 'toggle_on',
          versResultat: 'taxee-option',
        },
        {
          libelle: 'Non, pas d’option',
          detail: "La vente reste exonérée ; attention aux régularisations de TVA antérieurement déduite",
          icone: 'toggle_off',
          versResultat: 'exoneree',
        },
      ],
    },
    'immo-location': {
      id: 'immo-location',
      intitule: 'Location immobilière',
      titre: 'Quelle est la nature de la location ?',
      image: '/images/immobilier.jpg',
      aide: "Les locations de locaux nus sont en principe exonérées, mais celles de locaux nus à usage professionnel peuvent être soumises à la TVA sur option (art. 260, 2°), désormais possible local par local (CE, SCI EMO, 9 septembre 2020). Les locations de locaux aménagés pour l'activité (bureaux équipés, salles avec sièges, terrains de sport, parkings hors accessoire) sont taxées de plein droit. Les locations à usage d'habitation, nues ou meublées, sont exonérées sans option (art. 261 D) — sauf para-hôtellerie, qui bascule dans la taxation.",
      references: [{ libelle: 'CGI, art. 261 D' }, { libelle: 'CGI, art. 260, 2°' }],
      doctrine: { libelle: 'Doctrine : SCI et TVA', url: '/sci-tva/' },
      options: [
        {
          libelle: 'Locaux nus à usage professionnel',
          detail: "Bureaux, commerces, entrepôts loués nus : exonérés sauf option pour la taxation",
          icone: 'domain',
          versQuestion: 'immo-option-bail',
        },
        {
          libelle: 'Locaux aménagés ou équipés',
          detail: 'Bureaux équipés, salles aménagées, parkings : taxés de plein droit',
          icone: 'check_circle',
          versResultat: 'taxee',
        },
        {
          libelle: "Habitation (nue ou meublée)",
          detail: "Exonérée sans possibilité d'option, y compris en sous-location",
          icone: 'do_not_disturb_on',
          versResultat: 'exoneree',
        },
        {
          libelle: 'Meublé avec services para-hôteliers',
          detail: 'Petit-déjeuner, ménage régulier, linge, réception : la location devient taxable',
          icone: 'verified',
          versResultat: 'taxee',
        },
      ],
    },
    'immo-option-bail': {
      id: 'immo-option-bail',
      intitule: 'Option sur les loyers',
      titre: "Une lettre d'option à la TVA couvre-t-elle ces locaux ?",
      image: '/images/immobilier.jpg',
      aide: "L'option de l'article 260, 2° se matérialise par une lettre d'option adressée au service des impôts ; elle produit effet dès le premier jour du mois de sa formulation (ann. II, art. 194) et peut viser des locaux déterminés, à condition de les désigner de façon expresse et non équivoque. Envers un preneur non assujetti, le bail doit mentionner l'option. Une option égarée ou mal délimitée est un terrain classique de redressement : conservez la preuve de son envoi.",
      references: [{ libelle: 'CGI, art. 260, 2°' }, { libelle: 'CGI, ann. II, art. 194' }],
      doctrine: { libelle: "Doctrine : la lettre d'option TVA", url: '/lettre-option-tva/' },
      options: [
        {
          libelle: "Oui, l'option couvre ces locaux",
          detail: 'Lettre d’option envoyée et périmètre documenté : loyers soumis à la TVA',
          icone: 'toggle_on',
          versResultat: 'taxee-option',
        },
        {
          libelle: 'Non, pas d’option',
          detail: 'Les loyers restent exonérés et la TVA sur travaux et charges est perdue',
          icone: 'toggle_off',
          versResultat: 'exoneree',
        },
      ],
    },

    /* ---------------- Sous-parcours financier et assurance ---------------- */
    'fin-type': {
      id: 'fin-type',
      intitule: 'Opération financière',
      titre: "Quelle opération financière ou d'assurance ?",
      image: '/images/finance.jpg',
      aide: "La plupart des opérations financières sont exonérées par l'article 261 C : crédits et prêts, sûretés et garanties, mouvements de fonds et créances, change, opérations sur titres, gestion de fonds (OPCVM, FCP, OPCI…). D'autres sont au contraire taxées de plein droit : garde et gestion de valeurs mobilières, recouvrement de créances, crédit-bail, locations de coffres-forts. L'assurance et la réassurance, ainsi que le courtage afférent, sont exonérés sans option possible (art. 261 C, 2°).",
      references: [{ libelle: 'CGI, art. 261 C' }],
      doctrine: { libelle: 'Doctrine : les exonérations de TVA financière', url: '/la-tva-des-etablissements-financiers/exonerations-tva-financieres/' },
      options: [
        {
          libelle: 'Crédits, intérêts, garanties, opérations sur titres',
          detail: 'Opérations exonérées de l’article 261 C, 1° : une option pour la taxation reste possible',
          icone: 'percent',
          versQuestion: 'fin-option',
        },
        {
          libelle: 'Garde ou gestion de titres, recouvrement, crédit-bail',
          detail: 'Opérations taxées de plein droit, sans exonération applicable',
          icone: 'check_circle',
          versResultat: 'taxee',
        },
        {
          libelle: "Assurance, réassurance ou courtage d'assurance",
          detail: "Exonérées sans option (art. 261 C, 2°) ; le back-office pur reste en revanche taxable",
          icone: 'verified_user',
          versQuestion: 'fin-preneur',
        },
      ],
    },
    'fin-option': {
      id: 'fin-option',
      intitule: 'Option 260 B',
      titre: "Une option pour la taxation (art. 260 B) est-elle exercée ?",
      image: '/images/finance.jpg',
      aide: "Les acteurs du secteur bancaire et financier peuvent opter pour la taxation de leurs opérations normalement exonérées, hors exclusions de l'article 260 C. Depuis la loi de finances pour 2022, l'option s'exerce opération par opération, et non plus globalement : chaque flux peut être arbitré selon la situation du client et l'effet recherché sur le droit à déduction et la taxe sur les salaires.",
      references: [{ libelle: 'CGI, art. 260 B et 260 C' }],
      doctrine: { libelle: 'Doctrine : les opérations financières taxées', url: '/la-tva-des-etablissements-financiers/operations-taxees-tva-financiere/' },
      options: [
        {
          libelle: "Oui, l'option couvre cette opération",
          detail: "Taxation choisie : droit à déduction restauré, taxe sur les salaires allégée",
          icone: 'toggle_on',
          versResultat: 'taxee-option',
        },
        {
          libelle: 'Non, pas d’option',
          detail: "L'opération reste exonérée : reste à vérifier la situation du preneur",
          icone: 'toggle_off',
          versQuestion: 'fin-preneur',
        },
      ],
    },
    'fin-preneur': {
      id: 'fin-preneur',
      intitule: 'Preneur hors UE ?',
      titre: "Le preneur est-il établi hors de l'Union européenne ?",
      image: '/images/finance.jpg',
      aide: "Les opérations bancaires, financières et d'assurance exonérées ouvrent malgré tout droit à déduction lorsqu'elles sont réalisées avec des preneurs établis en dehors de l'Union européenne, ou se rapportent à des exportations de biens (CGI, art. 271, V, b). Ces flux « assimilés » s'inscrivent au numérateur du coefficient de taxation : pour une banque ou un assureur tourné vers l'international, l'enjeu de prorata est majeur.",
      references: [{ libelle: 'CGI, art. 271, V, b' }],
      doctrine: { libelle: 'Doctrine : les déductions du secteur financier', url: '/la-tva-des-etablissements-financiers/deduction-tva-financiere/' },
      options: [
        {
          libelle: "Oui, preneur établi hors de l'UE",
          detail: 'Exonération avec droit à déduction préservé : opération assimilée à une opération taxée',
          icone: 'public',
          versResultat: 'assimilee-taxee',
        },
        {
          libelle: "Non, preneur en France ou dans l'UE",
          detail: 'Exonération ordinaire : la TVA d’amont affectée devient une charge définitive',
          icone: 'public_off',
          versResultat: 'exoneree',
        },
      ],
    },

    /* ---------------- Sous-parcours santé ---------------- */
    'sante-but': {
      id: 'sante-but',
      intitule: 'Finalité de l’acte',
      titre: "L'acte poursuit-il une finalité thérapeutique ?",
      image: '/images/sante.jpg',
      aide: "L'exonération des soins (art. 261, 4, 1°) exige deux conditions cumulatives : une finalité thérapeutique — diagnostiquer, soigner, prévenir — et la qualification du praticien (professions médicales et paramédicales réglementées). Le remboursement par l'assurance maladie est un indice fort. À l'inverse, les actes sans but thérapeutique (chirurgie esthétique de pure convenance, expertises pour des besoins juridiques, bien-être, suivi nutritionnel hors prescription) sont taxés. Les frais d'hospitalisation et de traitement des établissements autorisés sont exonérés (art. 261, 4, 1° bis).",
      references: [{ libelle: 'CGI, art. 261, 4, 1° et 1° bis' }],
      doctrine: { libelle: 'Doctrine : les exonérations médicales', url: '/tva-medicale/exoneration-tva-medicale/' },
      options: [
        {
          libelle: 'Oui, soins par un professionnel réglementé',
          detail: 'Diagnostic, traitement ou prévention, y compris la téléconsultation à finalité thérapeutique',
          icone: 'medical_services',
          versResultat: 'exoneree-sante',
        },
        {
          libelle: "Hospitalisation ou traitement en établissement autorisé",
          detail: "Frais d'hospitalisation et de traitement des établissements privés autorisés, EHPAD pour partie",
          icone: 'domain',
          versResultat: 'exoneree-sante',
        },
        {
          libelle: 'Non, acte sans finalité thérapeutique',
          detail: 'Esthétique de convenance, expertises, bien-être, prestations annexes : taxation',
          icone: 'do_not_disturb_on',
          versResultat: 'taxee',
        },
      ],
    },
  },

  resultats: {
    'hors-champ': {
      id: 'hors-champ',
      qualification: "Opération hors du champ d'application de la TVA",
      ton: 'attention',
      carto: { libelle: 'Hors champ', teinte: 'gris', deduction: 'non' },
      resume:
        "L'opération n'entre pas dans le champ d'application de la TVA : elle n'est pas soumise à la taxe et ne figure pas parmi les opérations ouvrant droit à déduction.",
      consequences: [
        'Aucune TVA à collecter sur cette opération.',
        "Les dépenses engagées pour sa réalisation n'ouvrent pas droit à déduction : le coefficient d'assujettissement des dépenses mixtes doit en tenir compte.",
        'Les recettes hors champ entrent au rapport d’assujettissement à la taxe sur les salaires : poursuivez avec le scan dédié.',
      ],
      references: [{ libelle: 'CGI, art. 256 et 256 A' }, { libelle: 'CGI, art. 271' }],
      doctrine: { libelle: "Doctrine : le champ d'application de la TVA", url: '/doctrine/champ-application-tva/' },
      etapeSuivante: { libelle: 'Mesurer l’impact sur la taxe sur les salaires', url: '/scan-taxe-salaires/' },
    },
    'hors-champ-holding': {
      id: 'hors-champ-holding',
      qualification: 'Situation hors champ — holding pure',
      ton: 'attention',
      carto: { libelle: 'Hors champ', teinte: 'gris', deduction: 'non' },
      resume:
        "Dividendes, intérêts occasionnels et produits de cession de titres relèvent de la simple détention patrimoniale : ils sont exclus du champ de la TVA (CJUE, Sofitam). Une holding qui n'a que ces revenus est une holding pure, non assujettie.",
      consequences: [
        "Aucun droit à déduction : la TVA sur les frais (conseils, acquisition de titres…) est une perte sèche.",
        'Pistes de structuration : facturer des prestations aux filiales (immixtion), rejoindre un groupe TVA, éviter de loger les dépenses taxées dans la holding.',
        'Les rémunérations versées par la holding pure sont intégralement exposées à la taxe sur les salaires.',
      ],
      references: [{ libelle: 'CGI, art. 256 A' }],
      doctrine: { libelle: 'Doctrine : la récupération de la TVA des holdings', url: '/holdings-tva/recuperation-tva-holdings/' },
      etapeSuivante: { libelle: 'Mesurer la taxe sur les salaires de la holding', url: '/scan-taxe-salaires/' },
    },
    'hors-territoire': {
      id: 'hors-territoire',
      qualification: 'Opération non imposable en France',
      ton: 'mixte',
      carto: { libelle: 'Hors France', teinte: 'ardoise', deduction: 'a-analyser' },
      resume:
        "L'opération est située hors de France : elle n'y est pas imposable. Elle peut toutefois y préserver le droit à déduction si elle y ouvrirait droit dans le cas où elle serait située en France.",
      consequences: [
        'Aucune TVA française à collecter ; des obligations peuvent exister dans le pays d’imposition (immatriculation, autoliquidation par le preneur).',
        'Droit à déduction en France en principe préservé pour les opérations qui seraient taxées ou assimilées si elles y étaient situées (art. 271, V, d).',
        'Vérifiez les obligations déclaratives associées : état récapitulatif, déclaration européenne de services…',
      ],
      references: [{ libelle: 'CGI, art. 259 à 259 D' }, { libelle: 'CGI, art. 271, V, d' }],
      doctrine: { libelle: 'Doctrine : la territorialité de la TVA', url: '/doctrine/territorialite-tva/' },
    },
    taxee: {
      id: 'taxee',
      qualification: 'Opération taxée',
      ton: 'positif',
      carto: { libelle: 'Taxée', teinte: 'marine', deduction: 'oui' },
      resume:
        "L'opération est soumise à la TVA dans les conditions de droit commun. Elle ouvre droit à déduction de la taxe grevant les dépenses engagées pour sa réalisation.",
      consequences: [
        'TVA à collecter au taux applicable à l’opération.',
        "Droit à déduction de la TVA d'amont affectée à cette opération (art. 271).",
        'Si vous réalisez aussi des opérations exonérées ou hors champ, le calcul des coefficients (assujettissement, taxation, admission) devient déterminant.',
      ],
      references: [{ libelle: 'CGI, art. 256' }, { libelle: 'CGI, art. 271' }],
      doctrine: { libelle: 'Doctrine : le droit à déduction et les coefficients', url: '/doctrine/droit-a-deduction/' },
    },
    'taxee-option': {
      id: 'taxee-option',
      qualification: 'Opération taxée sur option',
      ton: 'positif',
      carto: { libelle: 'Taxée sur option', teinte: 'or', deduction: 'oui' },
      resume:
        "L'option exercée soumet l'opération à la TVA. Elle ouvre droit à déduction dans les mêmes conditions qu'une opération taxée de plein droit.",
      consequences: [
        "TVA à collecter sur les opérations couvertes par l'option.",
        "Droit à déduction restauré pour les dépenses affectées aux opérations couvertes par l'option.",
        "Documentez le périmètre et la date d'effet de l'option : options égarées et périmètres flous sont des terrains classiques de redressement.",
      ],
      references: [{ libelle: 'CGI, art. 260, 260 B' }, { libelle: 'CGI, art. 271' }],
      doctrine: { libelle: "Doctrine : la lettre d'option TVA", url: '/lettre-option-tva/' },
    },
    'assimilee-taxee': {
      id: 'assimilee-taxee',
      qualification: 'Opération exonérée ouvrant droit à déduction',
      ton: 'positif',
      carto: { libelle: 'Assimilée taxée', teinte: 'vert', deduction: 'oui' },
      resume:
        "Bien qu'exonérée, l'opération est assimilée à une opération taxée pour l'exercice du droit à déduction : la TVA d'amont correspondante demeure déductible.",
      consequences: [
        'Aucune TVA à collecter sur cette opération.',
        'Droit à déduction préservé pour les dépenses affectées.',
        "Ces opérations s'inscrivent au numérateur du coefficient de taxation forfaitaire : elles améliorent votre prorata.",
      ],
      references: [{ libelle: 'CGI, art. 262 et 262 ter' }, { libelle: 'CGI, art. 271, V' }],
      doctrine: { libelle: 'Doctrine : le droit à déduction et les coefficients', url: '/doctrine/droit-a-deduction/' },
    },
    exoneree: {
      id: 'exoneree',
      qualification: 'Opération exonérée sans droit à déduction',
      ton: 'negatif',
      carto: { libelle: 'Exonérée', teinte: 'ardoise', deduction: 'non' },
      resume:
        "L'opération est exonérée de TVA et n'ouvre pas droit à déduction : la TVA grevant les dépenses affectées constitue une charge définitive.",
      consequences: [
        'Aucune TVA à collecter sur cette opération.',
        'Perte du droit à déduction sur les dépenses affectées ; pour les dépenses mixtes, le coefficient de taxation réduit le montant déductible.',
        'Un volume significatif de recettes exonérées expose à la taxe sur les salaires : poursuivez avec le scan dédié.',
      ],
      references: [{ libelle: 'CGI, art. 261 et s.' }, { libelle: 'CGI, art. 271' }],
      doctrine: { libelle: 'Doctrine : les exonérations de TVA', url: '/doctrine/exonerations-tva/' },
      etapeSuivante: { libelle: 'Mesurer l’impact sur la taxe sur les salaires', url: '/scan-taxe-salaires/' },
    },
    'exoneree-sante': {
      id: 'exoneree-sante',
      qualification: 'Prestation de soins exonérée',
      ton: 'negatif',
      carto: { libelle: 'Exonérée', teinte: 'ardoise', deduction: 'non' },
      resume:
        "Les soins à finalité thérapeutique dispensés par des professionnels réglementés, et les frais d'hospitalisation des établissements autorisés, sont exonérés de TVA sans droit à déduction.",
      consequences: [
        "La TVA sur les investissements et charges affectés aux soins est une charge définitive ; un prorata s'impose en présence d'activités mixtes (parapharmacie, recherche, prestations taxées).",
        'Pour les EHPAD et cliniques, les frais généraux se déduisent selon l’utilisation mixte réelle (CE, Résidence de la Forêt).',
        'Le secteur est structurellement exposé à la taxe sur les salaires : poursuivez avec le scan dédié.',
      ],
      references: [{ libelle: 'CGI, art. 261, 4, 1° et 1° bis' }],
      doctrine: { libelle: 'Doctrine : la déduction de TVA dans la santé', url: '/tva-medicale/deduction-tva-sante/' },
      etapeSuivante: { libelle: 'Mesurer la taxe sur les salaires', url: '/scan-taxe-salaires/' },
    },
    'dispense-257bis': {
      id: 'dispense-257bis',
      qualification: 'Transmission dispensée de TVA (art. 257 bis)',
      ton: 'mixte',
      carto: { libelle: 'Dispense 257 bis', teinte: 'or', deduction: 'oui' },
      resume:
        "La transmission d'une universalité totale ou partielle de biens entre redevables est dispensée de TVA : ni taxation, ni exonération — une non-opération au regard de la taxe, applicable de plein droit lorsque les conditions sont réunies.",
      consequences: [
        "Aucune TVA sur la transmission, et aucune régularisation de la TVA antérieurement déduite : l'acquéreur continue la personne du cédant sur les vingtièmes restants.",
        "Le vendeur transmet un état récapitulatif des régularisations à effectuer ; sécurisez le régime dans l'acte (mention et clauses de garantie).",
        'Conditions à vérifier : cédant et cessionnaire redevables, universalité autonome, poursuite effective de l’activité.',
      ],
      references: [{ libelle: 'CGI, art. 257 bis' }],
      doctrine: { libelle: "Doctrine : l'article 257 bis du CGI", url: '/257-bis-cgi/' },
    },
  },
};
