import { useEffect, useState } from 'react';
import type { ArbreScan, OperationScannee } from '@/data/scan/types';
import CartographieScan from './CartographieScan';

interface Props {
  arbre: ArbreScan;
  operations: OperationScannee[];
  onAjouterOperation: () => void;
  onNouveauDossier: () => void;
}

const LIBELLE_DEDUCTION = {
  oui: 'Ouvre droit à déduction',
  non: "N'ouvre pas droit à déduction",
  'a-analyser': 'À analyser (hors France)',
} as const;

export default function RapportScan({ arbre, operations, onAjouterOperation, onNouveauDossier }: Props) {
  const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date());
  const resultats = operations.map((op) => ({ op, resultat: arbre.resultats[op.resultatId]! }));
  const avecDroit = resultats.filter(({ resultat }) => resultat.carto?.deduction === 'oui').length;
  const sansDroit = resultats.filter(({ resultat }) => resultat.carto?.deduction === 'non').length;
  const aAnalyser = resultats.filter(({ resultat }) => resultat.carto?.deduction === 'a-analyser').length;

  // Questions dont un « Non » à l'option rend l'opération candidate à une option de taxation.
  const QUESTIONS_OPTION = ['option', 'fin-option', 'immo-option-bail', 'immo-option-vente'];
  const estOptable = (op: OperationScannee) =>
    arbre.resultats[op.resultatId]?.carto?.deduction === 'non' &&
    op.reponses.some((r) => QUESTIONS_OPTION.includes(r.questionId) && r.libelle.toLowerCase().startsWith('non'));
  const optables = operations.filter(estOptable);

  // Estimations chiffrées, si un montant de recettes est renseigné pour chaque opération.
  const montantsComplets = operations.length > 0 && operations.every((op) => (op.montant ?? 0) > 0);
  let estimation:
    | { coefTaxation: number | null; coefSimule: number | null; rapportTs: number | null; horsEstimation: number }
    | null = null;
  if (montantsComplets) {
    let ouvrant = 0;
    let exonere = 0;
    let horsChamp = 0;
    let horsEstimation = 0;
    let exonereOptable = 0;
    for (const { op, resultat: res } of resultats) {
      const montant = op.montant ?? 0;
      if (res.carto?.deduction === 'oui') ouvrant += montant;
      else if (res.id === 'hors-champ') horsChamp += montant;
      else if (res.carto?.deduction === 'a-analyser') horsEstimation += montant;
      else {
        exonere += montant;
        if (estOptable(op)) exonereOptable += montant;
      }
    }
    const champ = ouvrant + exonere;
    const total = champ + horsChamp;
    estimation = {
      coefTaxation: champ > 0 ? ouvrant / champ : null,
      coefSimule: champ > 0 && exonereOptable > 0 ? (ouvrant + exonereOptable) / champ : null,
      rapportTs: total > 0 ? (exonere + horsChamp) / total : null,
      horsEstimation,
    };
  }
  const pourcent = (valeur: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(valeur);
  const euros = (valeur: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(valeur);

  // TVA d'amont annuelle déclarée par le visiteur (reste dans son navigateur).
  const [depensesSaisie, setDepensesSaisie] = useState('');
  useEffect(() => {
    try {
      const memo = window.localStorage.getItem('scan-tva-depenses');
      if (memo) setDepensesSaisie(memo);
    } catch {
      /* stockage indisponible */
    }
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem('scan-tva-depenses', depensesSaisie);
    } catch {
      /* stockage indisponible */
    }
  }, [depensesSaisie]);
  const tvaAmont = Number.parseFloat(depensesSaisie.replace(/[\s €]/g, '').replace(',', '.'));
  const tvaAmontValide = Number.isFinite(tvaAmont) && tvaAmont > 0 ? tvaAmont : null;

  // Niveau d'enjeu global du dossier.
  const ratioSansDroit = resultats.length > 0 ? sansDroit / resultats.length : 0;
  const enjeu =
    ratioSansDroit === 0 && aAnalyser === 0
      ? { libelle: 'Faible', teinte: '#4cc27e', texte: 'Vos opérations qualifiées ouvrent droit à déduction : le dossier est sain, sous réserve des coefficients d’assujettissement et d’admission.' }
      : ratioSansDroit < 0.5
        ? { libelle: 'Modéré', teinte: '#d8ab4a', texte: 'Une partie de vos recettes ferme le droit à déduction : prorata et taxe sur les salaires méritent un examen.' }
        : { libelle: 'Élevé', teinte: '#e2695f', texte: 'La majorité de vos recettes n’ouvre pas droit à déduction : enjeu fort de prorata, d’options et de taxe sur les salaires.' };

  const syntheses: string[] = [];
  if (sansDroit === 0 && aAnalyser === 0 && avecDroit > 0) {
    syntheses.push(
      "Toutes les opérations qualifiées ouvrent droit à déduction : votre coefficient de taxation devrait être égal à l'unité, sous réserve des coefficients d'assujettissement et d'admission."
    );
  }
  if (avecDroit > 0 && sansDroit > 0) {
    syntheses.push(
      'Votre dossier mêle des opérations ouvrant droit à déduction et des opérations qui le ferment : la TVA sur vos dépenses mixtes ne sera que partiellement récupérable (coefficient de taxation forfaitaire, dit prorata) et son calcul mérite d’être sécurisé.'
    );
  }
  if (sansDroit > 0) {
    syntheses.push(
      'La présence de recettes n’ouvrant pas droit à déduction vous expose en principe à la taxe sur les salaires : poursuivez avec le scan dédié pour mesurer votre situation.'
    );
  }
  if (aAnalyser > 0) {
    syntheses.push(
      'Certaines opérations sont situées hors de France : leur droit à déduction en France dépend du régime qui leur serait appliqué si elles y étaient situées, et des obligations peuvent exister à l’étranger.'
    );
  }

  return (
    <section className="apparition" aria-live="polite">
      {/* En-tête du rapport */}
      <div className="rounded border border-bordure bg-carte p-6 shadow-ambiante-2 md:p-8" id="rapport-scan">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-bordure pb-6">
          <div>
            <p className="etiquette text-or">Rapport de scan TVA</p>
            <h2 className="mt-2 font-titres text-2xl font-bold text-encre md:text-3xl">
              Cartographie de vos opérations
            </h2>
            <p className="mt-1 text-sm text-texte-2">
              {operations.length} opération{operations.length > 1 ? 's' : ''} qualifiée
              {operations.length > 1 ? 's' : ''} — établi le {date}
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="no-print flex items-center gap-2 rounded border border-marine px-4 py-2.5 font-texte text-sm font-semibold text-marine transition-colors hover:bg-marine hover:text-white"
          >
            <span className="ms text-lg" aria-hidden="true">print</span>
            Imprimer / PDF
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 rounded border border-bordure bg-fond-2 p-4">
          <span className="etiquette" style={{ color: enjeu.teinte }}>
            Niveau d'enjeu : {enjeu.libelle}
          </span>
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-8 rounded-full"
                style={{
                  backgroundColor:
                    i <= (enjeu.libelle === 'Faible' ? 0 : enjeu.libelle === 'Modéré' ? 1 : 2)
                      ? enjeu.teinte
                      : '#e5e1d8',
                }}
              />
            ))}
          </span>
          <span className="text-sm leading-5 text-texte-2">{enjeu.texte}</span>
        </div>

        <div className="mt-6">
          <CartographieScan
            arbre={arbre}
            operations={operations}
            interactive
            onChoisir={(indice) =>
              document.getElementById(`op-detail-${indice}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          />
          <p className="no-print mt-2 text-center text-xs text-texte-3">
            Survolez une opération pour sa fiche, cliquez pour rejoindre son détail.
          </p>
        </div>

        {/* Tableau récapitulatif */}
        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-marine text-left">
                <th className="py-2.5 pr-4 font-titres font-semibold text-encre">Opération</th>
                <th className="py-2.5 pr-4 font-titres font-semibold text-encre">Qualification</th>
                <th className="py-2.5 pr-4 font-titres font-semibold text-encre">Droit à déduction</th>
                <th className="py-2.5 font-titres font-semibold text-encre">Références</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map(({ op, resultat }, i) => (
                <tr key={i} className="border-b border-bordure align-top">
                  <td className="py-3 pr-4 font-semibold text-encre">{op.libelle}</td>
                  <td className="py-3 pr-4">{resultat.qualification}</td>
                  <td className="py-3 pr-4">
                    {LIBELLE_DEDUCTION[resultat.carto?.deduction ?? 'a-analyser']}
                  </td>
                  <td className="py-3 text-texte-2">
                    {resultat.references.map((r) => r.libelle).join(' ; ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estimation des coefficients */}
        <div className="mt-8">
          <h3 className="font-titres text-sm font-semibold uppercase tracking-wide text-or">
            Votre droit à déduction, en chiffres
          </h3>
          {estimation ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {estimation.coefTaxation !== null && (
                <div className="rounded border border-bordure bg-fond-2 p-5">
                  <p className="text-sm font-semibold text-encre">
                    Coefficient de taxation forfaitaire estimé
                  </p>
                  <p className="mt-2 font-titres text-3xl font-bold text-marine">
                    {pourcent(estimation.coefTaxation)}
                  </p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-fond-3">
                    <div
                      className="h-full rounded-full bg-marine transition-all duration-700"
                      style={{ width: `${Math.round(estimation.coefTaxation * 100)}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-texte-2">
                    Part de vos recettes situées dans le champ de la TVA qui ouvrent droit à
                    déduction : c'est, en première approche, la fraction de TVA récupérable sur vos
                    dépenses mixtes.
                  </p>
                </div>
              )}
              {estimation.rapportTs !== null && (
                <div className="rounded border border-bordure bg-fond-2 p-5">
                  <p className="text-sm font-semibold text-encre">
                    Rapport d'assujettissement à la taxe sur les salaires estimé
                  </p>
                  <p className="mt-2 font-titres text-3xl font-bold text-or-fonce">
                    {pourcent(estimation.rapportTs)}
                  </p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-fond-3">
                    <div
                      className="h-full rounded-full bg-or transition-all duration-700"
                      style={{ width: `${Math.round(estimation.rapportTs * 100)}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-texte-2">
                    Part de vos recettes n'ayant pas ouvert droit à déduction : c'est la fraction
                    de vos rémunérations en principe soumise à la taxe sur les salaires.
                  </p>
                </div>
              )}
              <div className="rounded border border-bordure bg-fond-2 p-5 md:col-span-2">
                <p className="text-sm font-semibold text-encre">Traduire en euros</p>
                <p className="mt-1 text-sm leading-6 text-texte-2">
                  Indiquez la TVA supportée sur vos dépenses annuelles (achats, charges, investissements) :
                  le rapport estime ce que votre prorata vous fait récupérer, et perdre.
                </p>
                <input
                  type="text"
                  inputMode="decimal"
                  value={depensesSaisie}
                  onChange={(evenement) => setDepensesSaisie(evenement.target.value)}
                  placeholder="ex. 250 000"
                  aria-label="TVA supportée sur les dépenses annuelles, en euros"
                  className="no-print mt-3 w-full max-w-xs rounded border border-bordure bg-fond px-4 py-2.5 text-sm text-encre outline-none transition-colors focus:border-marine"
                />
                {tvaAmontValide !== null && estimation.coefTaxation !== null && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="texte-affiche text-3xl text-positif">{euros(tvaAmontValide * estimation.coefTaxation)}</p>
                      <p className="mt-1 text-xs leading-5 text-texte-2">de TVA récupérable par an, en première approche</p>
                    </div>
                    <div>
                      <p className="texte-affiche text-3xl text-alerte">{euros(tvaAmontValide * (1 - estimation.coefTaxation))}</p>
                      <p className="mt-1 text-xs leading-5 text-texte-2">de TVA non récupérée par an : c'est le coût de vos exonérations</p>
                    </div>
                  </div>
                )}
                {estimation.coefSimule !== null && estimation.coefTaxation !== null && estimation.coefSimule > estimation.coefTaxation && (
                  <div className="mt-5 rounded border border-or/40 bg-attention-fond p-4">
                    <p className="etiquette text-or-fonce">Et si vous optiez ?</p>
                    <p className="mt-2 text-sm leading-6 text-texte">
                      {optables.length} de vos opérations exonérées {optables.length > 1 ? 'semblent éligibles' : 'semble éligible'} à
                      une option pour la taxation (art. 260 ou 260 B). En l'exerçant, votre coefficient de taxation
                      passerait d'environ {pourcent(estimation.coefTaxation)} à {pourcent(estimation.coefSimule)}
                      {tvaAmontValide !== null && (
                        <>
                          , soit <strong>{euros(tvaAmontValide * (estimation.coefSimule - estimation.coefTaxation))} de TVA récupérée en plus chaque année</strong>
                        </>
                      )}
                      . L'option a des contreparties (TVA facturée aux preneurs, formalisme) : c'est un arbitrage à mener avec un avocat.
                    </p>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <ul className="space-y-1.5 text-xs leading-5 text-texte-3">
                  <li>
                    Estimation indicative, fondée sur les seules opérations scannées et leurs
                    recettes annuelles déclarées. Le coefficient d'assujettissement s'apprécie
                    dépense par dépense, et l'année de référence de la taxe sur les salaires est
                    l'année précédant le versement des rémunérations.
                  </li>
                  {estimation.horsEstimation > 0 && (
                    <li>
                      Les opérations situées hors de France ont été écartées du calcul : leur sort
                      dépend du régime qui leur serait appliqué en France.
                    </li>
                  )}
                  <li>
                    Sectorisation, produits accessoires et régularisations peuvent modifier
                    sensiblement ces ratios : faites-les valider avant toute déclaration.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <p className="mt-3 rounded border border-dashed border-bordure-2 bg-fond-2 p-4 text-sm leading-6 text-texte-2">
              Renseignez les recettes annuelles de chaque opération (au moment de l'ajouter au
              dossier) pour obtenir une estimation de votre coefficient de taxation et de votre
              rapport d'assujettissement à la taxe sur les salaires.
            </p>
          )}
        </div>

        {/* Synthèse */}
        {syntheses.length > 0 && (
          <div className="mt-8">
            <h3 className="font-titres text-sm font-semibold uppercase tracking-wide text-or">
              Ce que votre dossier révèle
            </h3>
            <ul className="mt-3 space-y-2.5">
              {syntheses.map((phrase) => (
                <li key={phrase} className="flex gap-3 text-sm leading-6 text-texte">
                  <span className="mt-3 h-px w-3.5 shrink-0 bg-or" aria-hidden="true" />
                  {phrase}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Détail par opération */}
        <div className="mt-8 border-t border-bordure pt-6">
          <h3 className="font-titres text-sm font-semibold uppercase tracking-wide text-or">
            Le détail, opération par opération
          </h3>
          <div className="mt-4 space-y-5">
            {resultats.map(({ op, resultat }, i) => (
              <article key={i} id={`op-detail-${i}`} className="rounded border border-bordure bg-fond-2 p-5">
                <p className="font-titres text-base font-semibold text-encre">
                  {op.libelle} — {resultat.qualification}
                </p>
                <p className="mt-2 text-sm leading-6 text-texte-2">{resultat.resume}</p>
                <ul className="mt-3 space-y-1.5">
                  {resultat.consequences.map((c) => (
                    <li key={c} className="flex gap-3 text-sm leading-6 text-texte">
                      <span className="mt-3 h-px w-3 shrink-0 bg-or" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <p className="mt-8 border-t border-bordure pt-5 text-xs leading-5 text-texte-3">
          Ce rapport est généré à partir de vos réponses et fourni à titre d'information générale ;
          il ne constitue pas une consultation juridique ou fiscale. Arbre de décision en version de
          travail, en cours de validation par le cabinet BENSAID AVOCATS.
        </p>
      </div>

      {/* Actions */}
      <div className="no-print mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onAjouterOperation}
          className="flex items-center justify-center gap-2 rounded bg-marine px-5 py-3 font-texte text-sm font-semibold text-white transition-colors hover:bg-marine-2"
        >
          <span className="ms text-lg" aria-hidden="true">add_circle</span>
          Scanner une autre opération
        </button>
        <a
          href="/scan-taxe-salaires/"
          className="flex items-center justify-center gap-2 rounded border border-marine px-5 py-3 font-texte text-sm font-semibold text-marine transition-colors hover:bg-marine hover:text-white"
        >
          Mesurer la taxe sur les salaires
        </a>
        <a
          href="/expert/"
          className="flex items-center justify-center gap-2 rounded border border-or px-5 py-3 font-texte text-sm font-semibold text-or-fonce transition-colors hover:bg-attention-fond"
        >
          <span className="ms text-lg" aria-hidden="true">support_agent</span>
          Faire relire par un expert
        </a>
        <button
          type="button"
          onClick={onNouveauDossier}
          className="flex items-center justify-center gap-2 rounded border border-bordure px-5 py-3 font-texte text-sm font-semibold text-texte-2 transition-colors hover:border-marine hover:text-encre"
        >
          <span className="ms text-lg" aria-hidden="true">restart_alt</span>
          Nouveau dossier
        </button>
      </div>
    </section>
  );
}
