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

        <div className="mt-6">
          <CartographieScan arbre={arbre} operations={operations} />
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
              <article key={i} className="rounded border border-bordure bg-fond-2 p-5">
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
