import { useEffect, useMemo, useState } from 'react';
import type { ArbreScan, OperationScannee, QuestionScan, ResultatScan, TonResultat } from '@/data/scan/types';
import CartographieScan from './CartographieScan';
import RapportScan from './RapportScan';

interface ReponseDonnee {
  questionId: string;
  libelle: string;
}

interface Props {
  arbre: ArbreScan;
  /** Mode dossier : plusieurs opérations, cartographie et rapport (Scan TVA). */
  dossier?: boolean;
}

const stylesTon: Record<TonResultat, { badge: string; icone: string }> = {
  positif: { badge: 'bg-positif-fond text-positif', icone: 'check_circle' },
  negatif: { badge: 'bg-alerte-fond text-alerte', icone: 'cancel' },
  mixte: { badge: 'bg-fond-3 text-texte-2', icone: 'altitude' },
  attention: { badge: 'bg-attention-fond text-or-fonce', icone: 'error' },
};

function chargerDossier(cle: string): OperationScannee[] {
  if (typeof window === 'undefined') return [];
  try {
    const brut = window.localStorage.getItem(cle);
    const donnees = brut ? JSON.parse(brut) : [];
    return Array.isArray(donnees) ? donnees : [];
  } catch {
    return [];
  }
}

export default function ScanEngine({ arbre, dossier = false }: Props) {
  const cleStockage = `scan-${arbre.id}-dossier-v1`;
  const [operations, setOperations] = useState<OperationScannee[]>(() =>
    dossier ? chargerDossier(cleStockage) : []
  );
  const [vue, setVue] = useState<'scan' | 'rapport'>('scan');
  const [reponses, setReponses] = useState<ReponseDonnee[]>([]);
  const [courant, setCourant] = useState<{ type: 'question' | 'resultat'; id: string }>({
    type: 'question',
    id: arbre.entree,
  });
  const [libelleOperation, setLibelleOperation] = useState('');
  const [montantOperation, setMontantOperation] = useState('');

  useEffect(() => {
    if (!dossier || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(cleStockage, JSON.stringify(operations));
    } catch {
      /* stockage indisponible : le dossier vit le temps de la page */
    }
  }, [operations, dossier, cleStockage]);

  const question: QuestionScan | undefined =
    courant.type === 'question' ? arbre.questions[courant.id] : undefined;
  const resultat: ResultatScan | undefined =
    courant.type === 'resultat' ? arbre.resultats[courant.id] : undefined;

  const etape = reponses.length + 1;
  const progression = useMemo(() => {
    if (courant.type === 'resultat') return 100;
    return Math.min(Math.round((reponses.length / arbre.profondeurEstimee) * 100), 90);
  }, [courant, reponses.length, arbre.profondeurEstimee]);

  const libelleParDefaut = `Opération ${operations.length + 1}`;

  function repondre(libelle: string, versQuestion?: string, versResultat?: string) {
    if (!question) return;
    setReponses([...reponses, { questionId: question.id, libelle }]);
    if (versResultat) {
      setCourant({ type: 'resultat', id: versResultat });
    } else if (versQuestion) {
      setCourant({ type: 'question', id: versQuestion });
    }
  }

  function retour() {
    if (reponses.length === 0) return;
    const precedentes = reponses.slice(0, -1);
    const derniere = reponses[reponses.length - 1]!;
    setReponses(precedentes);
    setCourant({ type: 'question', id: derniere.questionId });
  }

  function revenirA(index: number) {
    const cible = reponses[index];
    if (!cible) return;
    setReponses(reponses.slice(0, index));
    setCourant({ type: 'question', id: cible.questionId });
  }

  function relancerScan() {
    setReponses([]);
    setLibelleOperation('');
    setCourant({ type: 'question', id: arbre.entree });
    setVue('scan');
  }

  /** Mode dossier : enregistre l'opération qualifiée puis enchaîne. */
  function validerOperation(destination: 'scan' | 'rapport') {
    if (!resultat) return;
    const montant = Number.parseFloat(montantOperation.replace(/[\s €]/g, '').replace(',', '.'));
    setOperations([
      ...operations,
      {
        libelle: libelleOperation.trim() || libelleParDefaut,
        ...(Number.isFinite(montant) && montant > 0 ? { montant } : {}),
        resultatId: resultat.id,
        reponses,
      },
    ]);
    setReponses([]);
    setLibelleOperation('');
    setMontantOperation('');
    setCourant({ type: 'question', id: arbre.entree });
    setVue(destination);
  }

  function nouveauDossier() {
    setOperations([]);
    relancerScan();
  }

  if (dossier && vue === 'rapport') {
    return (
      <RapportScan
        arbre={arbre}
        operations={operations}
        onAjouterOperation={relancerScan}
        onNouveauDossier={nouveauDossier}
      />
    );
  }

  const operationEnCours = dossier
    ? libelleOperation.trim() || libelleParDefaut
    : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        {/* Barre de progression */}
        <div className="mb-8">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="etiquette text-or">
              {courant.type === 'resultat' ? 'Scan terminé' : `Scan en cours — ${progression} %`}
            </p>
            <p className="text-sm text-texte-2">
              {courant.type === 'resultat'
                ? `${reponses.length} réponse${reponses.length > 1 ? 's' : ''}`
                : `Étape ${etape} sur ~${arbre.profondeurEstimee}`}
            </p>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-fond-3"
            role="progressbar"
            aria-valuenow={progression}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progression du scan"
          >
            <div
              className="h-full rounded-full bg-or transition-all duration-500"
              style={{ width: `${progression}%` }}
            />
          </div>
        </div>

        {question && (
          <section key={question.id} className="apparition" aria-live="polite">
            <div className="rounded border border-bordure border-l-4 border-l-or bg-carte p-6 shadow-ambiante md:p-8">
              <h2 className="font-titres text-xl font-semibold leading-snug text-encre md:text-2xl">
                {question.titre}
              </h2>
              <div className="mt-5 rounded border border-bordure bg-fond-2 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-encre">
                  <span className="ms text-lg text-or" aria-hidden="true">
                    info
                  </span>
                  Pourquoi cette question ?
                </p>
                <p className="mt-1.5 text-sm leading-6 text-texte-2">{question.aide}</p>
              </div>
              {question.references.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {question.references.map((ref) => (
                    <span
                      key={ref.libelle}
                      className="etiquette rounded bg-fond-3 px-2 py-1 text-texte-2"
                    >
                      {ref.libelle}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {question.options.map((option) => (
                <button
                  key={option.libelle}
                  type="button"
                  onClick={() => repondre(option.libelle, option.versQuestion, option.versResultat)}
                  className="group rounded border border-bordure bg-carte p-5 text-left transition-all hover:-translate-y-0.5 hover:border-marine hover:shadow-ambiante-2"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-titres text-base font-semibold text-encre">
                      {option.libelle}
                    </span>
                    {option.icone && (
                      <span
                        className="ms text-2xl text-texte-3 transition-colors group-hover:text-or"
                        aria-hidden="true"
                      >
                        {option.icone}
                      </span>
                    )}
                  </span>
                  {option.detail && (
                    <span className="mt-1.5 block text-sm leading-5 text-texte-2">{option.detail}</span>
                  )}
                </button>
              ))}

              <a
                href={question.doctrine.url}
                className="group rounded border border-dashed border-bordure-2 bg-fond-2 p-5 transition-colors hover:border-marine"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-titres text-base font-semibold text-texte-2 group-hover:text-encre">
                    Je ne sais pas
                  </span>
                  <span className="ms text-2xl text-texte-3" aria-hidden="true">
                    help
                  </span>
                </span>
                <span className="mt-1.5 block text-sm leading-5 text-texte-2">
                  Consultez notre page dédiée : {question.doctrine.libelle.replace('Doctrine : ', '')}.
                </span>
              </a>

              <a
                href="/expert/"
                className="group rounded border border-dashed border-or bg-fond-2 p-5 transition-colors hover:bg-attention-fond"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-titres text-base font-semibold text-or-fonce">
                    Consulter un expert
                  </span>
                  <span className="ms text-2xl text-or" aria-hidden="true">
                    support_agent
                  </span>
                </span>
                <span className="mt-1.5 block text-sm leading-5 text-texte-2">
                  Posez la question à un avocat fiscaliste dédié à la TVA et à la taxe sur les salaires.
                </span>
              </a>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={retour}
                disabled={reponses.length === 0}
                className="flex items-center gap-2 text-sm font-semibold text-texte-2 transition-colors enabled:hover:text-encre disabled:opacity-40"
              >
                <span className="ms text-lg" aria-hidden="true">
                  arrow_back
                </span>
                Retour
              </button>
              <a href={question.doctrine.url} className="flex items-center gap-2 text-sm text-lien underline underline-offset-4">
                <span className="ms text-lg" aria-hidden="true">
                  menu_book
                </span>
                {question.doctrine.libelle}
              </a>
            </div>
          </section>
        )}

        {resultat && (
          <section key={resultat.id} className="apparition" aria-live="polite">
            <div className="rounded border border-bordure bg-carte p-6 shadow-ambiante-2 md:p-8">
              <span
                className={`etiquette inline-flex items-center gap-1.5 rounded px-2.5 py-1 ${stylesTon[resultat.ton].badge}`}
              >
                <span className="ms text-base" aria-hidden="true">
                  {stylesTon[resultat.ton].icone}
                </span>
                Qualification
              </span>
              <h2 className="mt-4 font-titres text-2xl font-bold leading-tight text-encre md:text-3xl">
                {resultat.qualification}
              </h2>
              <p className="mt-4 text-base leading-7 text-texte">{resultat.resume}</p>

              <h3 className="mt-7 font-titres text-sm font-semibold uppercase tracking-wide text-or">
                Ce que cela implique
              </h3>
              <ul className="mt-3 space-y-2.5">
                {resultat.consequences.map((consequence) => (
                  <li key={consequence} className="flex gap-3 text-sm leading-6 text-texte">
                    <span className="mt-3 h-px w-3.5 shrink-0 bg-or" aria-hidden="true" />
                    {consequence}
                  </li>
                ))}
              </ul>

              {resultat.references.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {resultat.references.map((ref) => (
                    <span key={ref.libelle} className="etiquette rounded bg-fond-3 px-2 py-1 text-texte-2">
                      {ref.libelle}
                    </span>
                  ))}
                </div>
              )}

              {dossier ? (
                <div className="mt-8 border-t border-bordure pt-6">
                  <label htmlFor="nom-operation" className="block text-sm font-semibold text-encre">
                    Ajouter cette opération à votre cartographie
                  </label>
                  <p className="mt-1 text-sm text-texte-2">
                    Donnez-lui un nom parlant : il apparaîtra sur la carte et dans le rapport.
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_220px]">
                    <input
                      id="nom-operation"
                      type="text"
                      value={libelleOperation}
                      onChange={(evenement) => setLibelleOperation(evenement.target.value)}
                      placeholder={`ex. Loyers de l'immeuble de bureaux (${libelleParDefaut})`}
                      maxLength={60}
                      className="w-full rounded border border-bordure bg-fond px-4 py-2.5 text-sm text-encre outline-none transition-colors focus:border-marine"
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={montantOperation}
                      onChange={(evenement) => setMontantOperation(evenement.target.value)}
                      placeholder="Recettes annuelles en € (facultatif)"
                      aria-label="Recettes annuelles en euros (facultatif)"
                      className="w-full rounded border border-bordure bg-fond px-4 py-2.5 text-sm text-encre outline-none transition-colors focus:border-marine"
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-texte-3">
                    Le montant reste dans votre navigateur ; s'il est renseigné pour toutes les
                    opérations, le rapport estime vos coefficients.
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => validerOperation('scan')}
                      className="flex items-center justify-center gap-2 rounded bg-marine px-5 py-3 font-texte text-sm font-semibold text-white transition-colors hover:bg-marine-2"
                    >
                      <span className="ms text-lg" aria-hidden="true">add_circle</span>
                      Ajouter et scanner une autre opération
                    </button>
                    <button
                      type="button"
                      onClick={() => validerOperation('rapport')}
                      className="flex items-center justify-center gap-2 rounded border border-or px-5 py-3 font-texte text-sm font-semibold text-or-fonce transition-colors hover:bg-attention-fond"
                    >
                      <span className="ms text-lg" aria-hidden="true">print</span>
                      Ajouter et voir le rapport
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-8 flex flex-col gap-3 border-t border-bordure pt-6 sm:flex-row">
                  {resultat.etapeSuivante && (
                    <a
                      href={resultat.etapeSuivante.url}
                      className="rounded bg-marine px-5 py-3 text-center font-texte text-sm font-semibold text-white transition-colors hover:bg-marine-2"
                    >
                      {resultat.etapeSuivante.libelle}
                    </a>
                  )}
                  <a
                    href="/expert/"
                    className="rounded border border-marine px-5 py-3 text-center font-texte text-sm font-semibold text-marine transition-colors hover:bg-marine hover:text-white"
                  >
                    Consulter un expert
                  </a>
                  {resultat.doctrine && (
                    <a
                      href={resultat.doctrine.url}
                      className="rounded border border-bordure px-5 py-3 text-center font-texte text-sm font-semibold text-texte-2 transition-colors hover:border-marine hover:text-encre"
                    >
                      {resultat.doctrine.libelle}
                    </a>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={relancerScan}
              className="mt-6 flex items-center gap-2 text-sm font-semibold text-texte-2 transition-colors hover:text-encre"
            >
              <span className="ms text-lg" aria-hidden="true">
                restart_alt
              </span>
              {dossier ? 'Refaire ce scan sans enregistrer' : 'Refaire le scan'}
            </button>
          </section>
        )}
      </div>

      {/* Colonne latérale */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        {dossier && (
          <div className="mb-4 rounded border border-bordure bg-carte p-4 shadow-ambiante">
            <div className="flex items-center justify-between border-b border-bordure pb-3">
              <p className="flex items-center gap-2 font-titres text-sm font-bold uppercase tracking-wide text-encre">
                <span className="ms text-xl text-or" aria-hidden="true">radar</span>
                Cartographie
              </p>
              {operations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setVue('rapport')}
                  className="text-xs font-semibold text-lien underline underline-offset-4"
                >
                  Voir le rapport
                </button>
              )}
            </div>
            <div className="pt-2">
              <CartographieScan
                arbre={arbre}
                operations={operations}
                operationEnCours={operationEnCours}
                compacte
              />
            </div>
            <p className="border-t border-bordure pt-3 text-xs leading-5 text-texte-3">
              {operations.length === 0
                ? 'Votre carte se construit à mesure que vous qualifiez des opérations.'
                : `${operations.length} opération${operations.length > 1 ? 's' : ''} qualifiée${operations.length > 1 ? 's' : ''} dans ce dossier.`}
            </p>
          </div>
        )}

        <div className="rounded border border-bordure bg-carte p-5 shadow-ambiante">
          <p className="flex items-center gap-2 border-b border-bordure pb-3 font-titres text-sm font-bold uppercase tracking-wide text-encre">
            <span className="ms text-xl text-or" aria-hidden="true">
              folder_open
            </span>
            {dossier ? 'Opération en cours' : 'Dossier en cours'}
          </p>
          {reponses.length === 0 ? (
            <p className="pt-4 text-sm leading-6 text-texte-2">
              Vos réponses s'affichent ici au fil du scan. Vous pouvez revenir sur chacune d'elles à
              tout moment.
            </p>
          ) : (
            <ol className="divide-y divide-bordure">
              {reponses.map((reponse, index) => {
                const questionSource = arbre.questions[reponse.questionId];
                return (
                  <li key={`${reponse.questionId}-${index}`}>
                    <button
                      type="button"
                      onClick={() => revenirA(index)}
                      className="group w-full py-3 text-left"
                      title="Modifier cette réponse"
                    >
                      <span className="block text-xs text-texte-3">
                        {questionSource?.intitule ?? reponse.questionId}
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2 text-sm font-semibold text-encre">
                        {reponse.libelle}
                        <span
                          className="ms text-base text-texte-3 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden="true"
                        >
                          edit
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
        {arbre.avertissement && (
          <p className="mt-4 rounded border border-bordure bg-fond-2 p-4 text-xs leading-5 text-texte-3">
            {arbre.avertissement}
          </p>
        )}
      </aside>
    </div>
  );
}
