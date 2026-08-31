import { useEffect, useMemo, useState, type MouseEvent as EvenementSouris } from 'react';
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

const stylesTon: Record<TonResultat, { badge: string; icone: string; halo: string }> = {
  positif: { badge: 'bg-positif/20 text-[#7fd39a] border border-positif/40', icone: 'check_circle', halo: '#3f9d63' },
  negatif: { badge: 'bg-alerte/15 text-[#ff9d94] border border-alerte/40', icone: 'cancel', halo: '#c0392b' },
  mixte: { badge: 'bg-white/10 text-white/80 border border-white/20', icone: 'altitude', halo: '#7d92b5' },
  attention: { badge: 'bg-or-vif/15 text-or-pale border border-or-vif/40', icone: 'error', halo: '#d8ab4a' },
};

/** Verdict « droit à déduction » affiché en tête de l'écran de résultat. */
const verdictDeduction: Record<'oui' | 'non' | 'a-analyser', { texte: string; classe: string; icone: string }> = {
  oui: { texte: 'Droit à déduction préservé', classe: 'bg-positif/15 text-[#7fd39a] border border-positif/40', icone: 'trending_up' },
  non: { texte: 'Droit à déduction fermé', classe: 'bg-alerte/10 text-[#ff9d94] border border-alerte/40', icone: 'trending_down' },
  'a-analyser': { texte: 'Droit à déduction : à analyser', classe: 'bg-or-vif/10 text-or-pale border border-or-vif/40', icone: 'query_stats' },
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
  const [vue, setVue] = useState<'briefing' | 'scan' | 'rapport'>(arbre.univers?.length ? 'briefing' : 'scan');
  const [reponses, setReponses] = useState<ReponseDonnee[]>([]);
  const [courant, setCourant] = useState<{ type: 'question' | 'resultat'; id: string }>({
    type: 'question',
    id: arbre.entree,
  });
  const [libelleOperation, setLibelleOperation] = useState('');
  const [montantOperation, setMontantOperation] = useState('');
  const [immersif, setImmersif] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('mode-immersif', immersif);
    return () => document.documentElement.classList.remove('mode-immersif');
  }, [immersif]);

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
  const segments = useMemo(() => {
    const total = arbre.profondeurEstimee;
    const remplis = courant.type === 'resultat' ? total : Math.min(reponses.length, total - 1);
    return Array.from({ length: total }, (_, i) => i < remplis);
  }, [courant, reponses.length, arbre.profondeurEstimee]);

  const libelleParDefaut = `Opération ${operations.length + 1}`;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    function auClavier(e: KeyboardEvent) {
      const cible = e.target as HTMLElement | null;
      if (cible && (cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA')) return;
      if (vue !== 'scan' || !question) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        retour();
        return;
      }
      const n = Number.parseInt(e.key, 10);
      if (!Number.isInteger(n) || n < 1 || n > question.options.length) return;
      const option = question.options[n - 1]!;
      const bouton = document.querySelector(`[data-indice="${n}"]`);
      const rect = bouton?.getBoundingClientRect();
      const faux = {
        clientX: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
        clientY: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
      } as EvenementSouris<HTMLButtonElement>;
      repondre(faux, option.libelle, option.versQuestion, option.versResultat);
    }
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  });

  /** Petit point doré qui vole de la réponse cliquée vers la mini-carte. */
  function voyagerNoeud(evenement: EvenementSouris<HTMLButtonElement>) {
    if (typeof document === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cible = document.getElementById('carte-mini');
    if (!cible || !('animate' in Element.prototype)) return;
    const arrivee = cible.getBoundingClientRect();
    if (arrivee.width === 0) return;
    const point = document.createElement('span');
    point.style.cssText = `position:fixed;left:${evenement.clientX - 6}px;top:${evenement.clientY - 6}px;width:12px;height:12px;border-radius:9999px;background:#d8ab4a;box-shadow:0 0 14px 4px rgba(216,171,74,.55);z-index:60;pointer-events:none;`;
    document.body.appendChild(point);
    const dx = arrivee.left + arrivee.width / 2 - evenement.clientX;
    const dy = arrivee.top + arrivee.height / 2 - evenement.clientY;
    point
      .animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${dx}px,${dy}px) scale(0.45)`, opacity: 0.15 },
        ],
        { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      )
      .addEventListener('finish', () => point.remove());
  }

  function repondre(
    evenement: EvenementSouris<HTMLButtonElement>,
    libelle: string,
    versQuestion?: string,
    versResultat?: string
  ) {
    if (!question) return;
    voyagerNoeud(evenement);
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
    setVue(arbre.univers?.length ? 'briefing' : 'scan');
  }

  /** Démarre une partie sur l'univers choisi. */
  function demarrer(entreeId: string) {
    setReponses([]);
    setLibelleOperation('');
    setCourant({ type: 'question', id: entreeId });
    setVue('scan');
  }

  /** Mode dossier : enregistre l'opération qualifiée puis enchaîne. */
  function validerOperation(destination: 'scan' | 'rapport') {
    if (!resultat) return;
    const montant = Number.parseFloat(montantOperation.replace(/[\s €]/g, '').replace(',', '.'));
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
    setVue(destination === 'scan' ? 'briefing' : destination);
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

  const operationEnCours = dossier ? libelleOperation.trim() || libelleParDefaut : undefined;


  if (arbre.univers?.length && vue === 'briefing') {
    const univers = arbre.univers.filter((u) => u.entree === arbre.entree || arbre.questions[u.entree]);
    return (
      <section className="apparition" aria-live="polite">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="etiquette text-or-vif">Briefing</p>
            <h2 className="texte-affiche mt-2 text-3xl text-white md:text-5xl">Choisissez votre univers</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
              Chaque univers ouvre le sous-parcours adapté à vos opérations. Vous pourrez enchaîner
              plusieurs opérations dans le même dossier : la cartographie se construit au fil des scans.
            </p>
          </div>
          {dossier && operations.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setVue('rapport')}
                className="flex items-center gap-2 rounded bg-or-vif px-5 py-3 font-texte text-sm font-bold text-nuit transition-all hover:-translate-y-0.5 hover:bg-or-pale"
              >
                <span className="ms text-lg" aria-hidden="true">print</span>
                Reprendre mon dossier ({operations.length})
              </button>
              <button
                type="button"
                onClick={nouveauDossier}
                className="flex items-center gap-2 rounded border border-white/25 px-5 py-3 font-texte text-sm font-semibold text-white/70 transition-colors hover:border-white/60 hover:text-white"
              >
                <span className="ms text-lg" aria-hidden="true">restart_alt</span>
                Nouveau dossier
              </button>
            </div>
          )}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {univers.map((u, indice) => (
            <button
              key={u.titre}
              type="button"
              onClick={() => demarrer(u.entree)}
              style={{ animationDelay: `${indice * 80}ms` }}
              className="group apparition relative h-52 overflow-hidden rounded-lg border border-white/12 text-left transition-all hover:-translate-y-1 hover:border-or-vif hover:shadow-[0_0_32px_rgba(216,171,74,0.25)]"
            >
              <img src={u.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" aria-hidden="true" />
              <span className="absolute inset-0 bg-gradient-to-t from-nuit via-nuit/45 to-transparent" aria-hidden="true"></span>
              <span className="absolute left-5 top-4 font-titres text-xs font-bold tracking-[0.3em] text-white/45 transition-colors group-hover:text-or-pale" aria-hidden="true">
                {String(indice + 1).padStart(2, '0')}
              </span>
              <span
                className="ms absolute right-4 top-4 -translate-x-1 text-2xl text-or-pale opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                aria-hidden="true"
              >
                arrow_forward
              </span>
              <span className="absolute inset-x-0 bottom-0 p-5">
                <span className="texte-affiche block text-2xl text-white group-hover:text-or-pale">{u.titre}</span>
                <span className="mt-1 block text-xs leading-5 text-white/65">{u.detail}</span>
              </span>
            </button>
          ))}
        </div>
        {arbre.avertissement && (
          <p className="mt-6 text-xs leading-5 text-white/35">{arbre.avertissement}</p>
        )}
      </section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        {/* HUD de progression */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="etiquette text-or-vif">
              {courant.type === 'resultat' ? 'Scan terminé' : `Scan en cours · Étape ${etape}`}
            </p>
            <button
              type="button"
              onClick={() => setImmersif(!immersif)}
              className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                immersif
                  ? 'border-or-vif text-or-pale hover:bg-white/10'
                  : 'border-white/25 text-white/70 hover:border-white/60 hover:text-white'
              }`}
              title={immersif ? 'Quitter le mode immersif' : 'Passer en mode immersif'}
            >
              <span className="ms text-base" aria-hidden="true">
                {immersif ? 'fullscreen_exit' : 'fullscreen'}
              </span>
              {immersif ? 'Quitter' : 'Immersif'}
            </button>
          </div>
          <div className="flex gap-1.5" role="progressbar" aria-label="Progression du scan">
            {segments.map((rempli, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                  rempli ? 'bg-or-vif shadow-[0_0_8px_rgba(216,171,74,0.55)]' : 'bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>

        {question && (
          <section key={question.id} className="apparition" aria-live="polite">
            {/* Carte question, façon écran de jeu */}
            <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0a1526] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              {question.image && (
                <div className="relative h-40 md:h-48">
                  <img src={question.image} alt="" className="kenburns h-full w-full object-cover" aria-hidden="true" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1526] via-[#0a1526]/40 to-transparent" aria-hidden="true"></div>
                  <span className="etiquette absolute left-6 top-5 rounded bg-nuit/70 px-2.5 py-1 text-or-pale backdrop-blur">
                    {question.intitule}
                  </span>
                </div>
              )}
              <div className="p-6 md:p-8 md:pt-5">
                <h2 className="texte-affiche text-2xl leading-tight text-white md:text-4xl">
                  {question.titre}
                </h2>
                <div className="mt-5 rounded border border-white/10 bg-white/5 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-or-pale">
                    <span className="ms text-lg" aria-hidden="true">
                      info
                    </span>
                    Pourquoi cette question ?
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-white/75">{question.aide}</p>
                </div>
                {question.references.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {question.references.map((ref) => (
                      <span key={ref.libelle} className="etiquette rounded bg-white/10 px-2 py-1 text-or-pale">
                        {ref.libelle}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Choix de réponse, façon dialogue de jeu */}
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {question.options.map((option, indice) => (
                <button
                  key={option.libelle}
                  type="button"
                  data-indice={indice + 1}
                  onClick={(evenement) => repondre(evenement, option.libelle, option.versQuestion, option.versResultat)}
                  style={{ animationDelay: `${120 + indice * 60}ms` }}
                  className="group apparition relative overflow-hidden rounded-lg border border-white/12 bg-white/5 p-5 text-left backdrop-blur transition-all hover:-translate-y-0.5 hover:border-or-vif hover:bg-white/10 hover:shadow-[0_0_24px_rgba(216,171,74,0.18)]"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-or-pale to-or-vif opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-titres text-base font-semibold text-white">
                      <kbd className="mr-2 hidden rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-texte text-[10px] font-bold text-white/50 md:inline-block">
                        {indice + 1}
                      </kbd>
                      {option.libelle}
                    </span>
                    {option.icone && (
                      <span
                        className="ms rounded bg-white/10 p-1.5 text-xl text-white/60 transition-colors group-hover:bg-or-vif/20 group-hover:text-or-pale"
                        aria-hidden="true"
                      >
                        {option.icone}
                      </span>
                    )}
                  </span>
                  {option.detail && <span className="mt-1.5 block text-sm leading-5 text-white/60">{option.detail}</span>}
                </button>
              ))}

              <a
                href={question.doctrine.url}
                style={{ animationDelay: `${120 + question.options.length * 60}ms` }}
                className="group apparition rounded-lg border border-dashed border-white/25 bg-transparent p-5 transition-colors hover:border-white/60"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-titres text-base font-semibold text-white/70 group-hover:text-white">
                    Je ne sais pas
                  </span>
                  <span className="ms text-2xl text-white/40" aria-hidden="true">
                    help
                  </span>
                </span>
                <span className="mt-1.5 block text-sm leading-5 text-white/50">
                  Consultez notre page dédiée : {question.doctrine.libelle.replace('Doctrine : ', '')}.
                </span>
              </a>

              <a
                href="/expert/"
                style={{ animationDelay: `${180 + question.options.length * 60}ms` }}
                className="group apparition rounded-lg border border-dashed border-or-vif/60 bg-or-vif/5 p-5 transition-colors hover:bg-or-vif/15"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-titres text-base font-semibold text-or-pale">Consulter un expert</span>
                  <span className="ms text-2xl text-or-vif" aria-hidden="true">
                    support_agent
                  </span>
                </span>
                <span className="mt-1.5 block text-sm leading-5 text-white/60">
                  Posez la question à un avocat fiscaliste dédié à la TVA et à la taxe sur les salaires.
                </span>
              </a>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={retour}
                disabled={reponses.length === 0}
                className="flex items-center gap-2 text-sm font-semibold text-white/60 transition-colors enabled:hover:text-white disabled:opacity-30"
              >
                <span className="ms text-lg" aria-hidden="true">
                  arrow_back
                </span>
                Retour
              </button>
              <a
                href={question.doctrine.url}
                className="flex items-center gap-2 text-sm text-or-pale underline underline-offset-4"
              >
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
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#0a1526] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:p-8">
              <div
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
                style={{ background: stylesTon[resultat.ton].halo }}
                aria-hidden="true"
              />
              <div className="relative flex flex-wrap items-center gap-2">
                <span className={`etiquette inline-flex items-center gap-1.5 rounded px-2.5 py-1 ${stylesTon[resultat.ton].badge}`}>
                  <span className="ms text-base" aria-hidden="true">
                    {stylesTon[resultat.ton].icone}
                  </span>
                  Qualification
                </span>
                {resultat.carto && (
                  <span
                    className={`etiquette inline-flex items-center gap-1.5 rounded px-2.5 py-1 ${verdictDeduction[resultat.carto.deduction].classe}`}
                  >
                    <span className="ms text-base" aria-hidden="true">
                      {verdictDeduction[resultat.carto.deduction].icone}
                    </span>
                    {verdictDeduction[resultat.carto.deduction].texte}
                  </span>
                )}
              </div>
              <h2 className="texte-affiche relative mt-4 text-3xl leading-tight text-white md:text-5xl">
                {resultat.qualification}
              </h2>
              <p className="relative mt-4 max-w-2xl text-base leading-7 text-white/75">{resultat.resume}</p>

              <h3 className="etiquette relative mt-7 text-or-vif">Ce que cela implique</h3>
              <ul className="relative mt-3 space-y-2.5">
                {resultat.consequences.map((consequence, indice) => (
                  <li
                    key={consequence}
                    style={{ animationDelay: `${250 + indice * 130}ms` }}
                    className="apparition flex gap-3 text-sm leading-6 text-white/80"
                  >
                    <span className="mt-3 h-px w-3.5 shrink-0 bg-or-vif" aria-hidden="true" />
                    {consequence}
                  </li>
                ))}
              </ul>

              {resultat.references.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {resultat.references.map((ref) => (
                    <span key={ref.libelle} className="etiquette rounded bg-white/10 px-2 py-1 text-or-pale">
                      {ref.libelle}
                    </span>
                  ))}
                </div>
              )}

              {dossier && resultat.etapeSuivante && (
                <a
                  href={resultat.etapeSuivante.url}
                  className="relative mt-6 inline-flex items-center gap-2 rounded border border-or-vif/60 bg-or-vif/10 px-5 py-3 font-texte text-sm font-bold text-or-pale transition-colors hover:bg-or-vif/20"
                >
                  <span className="ms text-lg" aria-hidden="true">calculate</span>
                  {resultat.etapeSuivante.libelle}
                </a>
              )}
              {dossier ? (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <label htmlFor="nom-operation" className="block text-sm font-semibold text-white">
                    Ajouter cette opération à votre cartographie
                  </label>
                  <p className="mt-1 text-sm text-white/60">
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
                      className="w-full rounded border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-or-vif"
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={montantOperation}
                      onChange={(evenement) => setMontantOperation(evenement.target.value)}
                      placeholder="Recettes annuelles en € (facultatif)"
                      aria-label="Recettes annuelles en euros (facultatif)"
                      className="w-full rounded border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-or-vif"
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/40">
                    Le montant reste dans votre navigateur ; s'il est renseigné pour toutes les opérations, le rapport
                    estime vos coefficients.
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => validerOperation('scan')}
                      className="flex items-center justify-center gap-2 rounded bg-or-vif px-5 py-3 font-texte text-sm font-bold text-nuit transition-all hover:-translate-y-0.5 hover:bg-or-pale"
                    >
                      <span className="ms text-lg" aria-hidden="true">
                        add_circle
                      </span>
                      Ajouter et scanner une autre opération
                    </button>
                    <button
                      type="button"
                      onClick={() => validerOperation('rapport')}
                      className="flex items-center justify-center gap-2 rounded border border-white/30 px-5 py-3 font-texte text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                    >
                      <span className="ms text-lg" aria-hidden="true">
                        print
                      </span>
                      Ajouter et voir le rapport
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
                  {resultat.etapeSuivante && (
                    <a
                      href={resultat.etapeSuivante.url}
                      className="rounded bg-or-vif px-5 py-3 text-center font-texte text-sm font-bold text-nuit transition-all hover:-translate-y-0.5 hover:bg-or-pale"
                    >
                      {resultat.etapeSuivante.libelle}
                    </a>
                  )}
                  <a
                    href="/expert/"
                    className="rounded border border-white/30 px-5 py-3 text-center font-texte text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                  >
                    Consulter un expert
                  </a>
                  {resultat.doctrine && (
                    <a
                      href={resultat.doctrine.url}
                      className="rounded border border-white/15 px-5 py-3 text-center font-texte text-sm font-semibold text-white/70 transition-colors hover:border-white/50 hover:text-white"
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
              className="mt-6 flex items-center gap-2 text-sm font-semibold text-white/60 transition-colors hover:text-white"
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
          <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <p className="flex items-center gap-2 font-titres text-sm font-bold uppercase tracking-wide text-white">
                <span className="ms text-xl text-or-vif" aria-hidden="true">
                  radar
                </span>
                Cartographie
              </p>
              {operations.length > 0 && (
                <button
                  type="button"
                  onClick={() => setVue('rapport')}
                  className="text-xs font-semibold text-or-pale underline underline-offset-4"
                >
                  Voir le rapport
                </button>
              )}
            </div>
            <div className="pt-2" id="carte-mini">
              <CartographieScan arbre={arbre} operations={operations} operationEnCours={operationEnCours} compacte sombre />
            </div>
            <p className="border-t border-white/10 pt-3 text-xs leading-5 text-white/45">
              {operations.length === 0
                ? 'Votre carte se construit à mesure que vous qualifiez des opérations.'
                : `${operations.length} opération${operations.length > 1 ? 's' : ''} qualifiée${operations.length > 1 ? 's' : ''} dans ce dossier.`}
            </p>
          </div>
        )}

        <div className="rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur">
          <p className="flex items-center gap-2 border-b border-white/10 pb-3 font-titres text-sm font-bold uppercase tracking-wide text-white">
            <span className="ms text-xl text-or-vif" aria-hidden="true">
              folder_open
            </span>
            {dossier ? 'Opération en cours' : 'Dossier en cours'}
          </p>
          {reponses.length === 0 ? (
            <p className="pt-4 text-sm leading-6 text-white/55">
              Vos réponses s'affichent ici au fil du scan. Vous pouvez revenir sur chacune d'elles à tout moment.
            </p>
          ) : (
            <ol className="divide-y divide-white/10">
              {reponses.map((reponse, index) => {
                const questionSource = arbre.questions[reponse.questionId];
                return (
                  <li key={`${reponse.questionId}-${index}`}>
                    <button type="button" onClick={() => revenirA(index)} className="group w-full py-3 text-left" title="Modifier cette réponse">
                      <span className="block text-xs text-white/40">{questionSource?.intitule ?? reponse.questionId}</span>
                      <span className="mt-0.5 flex items-center justify-between gap-2 text-sm font-semibold text-white">
                        {reponse.libelle}
                        <span className="ms text-base text-white/40 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">
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
          <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 text-xs leading-5 text-white/40">
            {arbre.avertissement}
          </p>
        )}
      </aside>
    </div>
  );
}
