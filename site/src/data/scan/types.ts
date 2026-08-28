/**
 * Modèle de données des scanners (TVA, taxe sur les salaires).
 *
 * Les arbres de décision sont entièrement pilotés par la donnée : les
 * questions, réponses, renvois doctrine et écrans de résultat vivent ici,
 * séparés du moteur d'affichage (ScanEngine.tsx). L'expert peut donc
 * enrichir ou corriger un arbre sans toucher au code.
 */

export interface ReferenceLegale {
  /** Ex. « CGI, art. 256 A » ou « BOI-TVA-CHAMP-10-10-20 » */
  libelle: string;
  /** Lien optionnel (Légifrance, BOFiP) — à valider avant publication. */
  url?: string;
}

export interface LienDoctrine {
  libelle: string;
  /** URL interne d'une page doctrine du site. */
  url: string;
}

export interface OptionScan {
  libelle: string;
  /** Précision affichée sous le libellé. */
  detail?: string;
  /** Nom d'icône Material Symbols. */
  icone?: string;
  /** Identifiant de la question suivante… */
  versQuestion?: string;
  /** …ou de l'écran de résultat. */
  versResultat?: string;
}

export interface QuestionScan {
  id: string;
  /** Intitulé court affiché dans le dossier en cours. */
  intitule: string;
  titre: string;
  /** Image d'ambiance affichée en bannière de la question. */
  image?: string;
  /** Encadré « Pourquoi cette question ? ». */
  aide: string;
  references: ReferenceLegale[];
  /** Renvoi proposé quand l'utilisateur répond « Je ne sais pas ». */
  doctrine: LienDoctrine;
  options: OptionScan[];
}

export type TonResultat = 'positif' | 'negatif' | 'mixte' | 'attention';

/** Teintes des nœuds de la cartographie. */
export type TeinteCarto = 'marine' | 'or' | 'vert' | 'ardoise' | 'gris';

export interface CartoResultat {
  /** Libellé court affiché dans la cartographie et le rapport (ex. « Taxée »). */
  libelle: string;
  teinte: TeinteCarto;
  /** Sort du droit à déduction pour cette qualification. */
  deduction: 'oui' | 'non' | 'a-analyser';
}

/** Une opération scannée de bout en bout, telle que conservée dans le dossier. */
export interface OperationScannee {
  libelle: string;
  /** Montant annuel de recettes (euros), facultatif — sert aux estimations du rapport. */
  montant?: number;
  resultatId: string;
  reponses: { questionId: string; libelle: string }[];
}

export interface ResultatScan {
  id: string;
  /** Ex. « Opération taxée ». */
  qualification: string;
  ton: TonResultat;
  /** Représentation dans la cartographie du dossier (mode multi-opérations). */
  carto?: CartoResultat;
  resume: string;
  consequences: string[];
  references: ReferenceLegale[];
  doctrine?: LienDoctrine;
  /** CTA optionnel vers l'étape suivante (ex. scan taxe sur les salaires). */
  etapeSuivante?: { libelle: string; url: string };
}

export interface ArbreScan {
  id: string;
  titre: string;
  sousTitre: string;
  /** Mention affichée tant que l'arbre n'est pas validé par le cabinet. */
  avertissement?: string;
  /** Identifiant de la première question. */
  entree: string;
  /** Profondeur indicative pour la barre de progression. */
  profondeurEstimee: number;
  questions: Record<string, QuestionScan>;
  resultats: Record<string, ResultatScan>;
}

/** Vérification de cohérence exécutée au build : détecte les renvois cassés. */
export function verifierArbre(arbre: ArbreScan): string[] {
  const erreurs: string[] = [];
  if (!arbre.questions[arbre.entree]) {
    erreurs.push(`Entrée introuvable : ${arbre.entree}`);
  }
  for (const question of Object.values(arbre.questions)) {
    for (const option of question.options) {
      if (option.versQuestion && !arbre.questions[option.versQuestion]) {
        erreurs.push(`${question.id} → question inconnue : ${option.versQuestion}`);
      }
      if (option.versResultat && !arbre.resultats[option.versResultat]) {
        erreurs.push(`${question.id} → résultat inconnu : ${option.versResultat}`);
      }
      if (!option.versQuestion && !option.versResultat) {
        erreurs.push(`${question.id} → option sans destination : ${option.libelle}`);
      }
    }
  }
  return erreurs;
}
