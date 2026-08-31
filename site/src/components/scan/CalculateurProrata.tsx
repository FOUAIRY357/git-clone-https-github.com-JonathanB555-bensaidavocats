import { useEffect, useMemo, useState } from 'react';
import { presetsProrata, type ClassementRecette } from '@/data/prorata';

interface Props {
  /** Met en avant les coefficients TVA ('tva') ou le rapport d'assujettissement ('ts'). */
  accent: 'tva' | 'ts';
}

interface EtatCalculateur {
  presetId: string;
  montants: Record<string, string>;
  options: Record<string, boolean>;
  accessoires: Record<string, boolean>;
  tvaAmont: string;
}

const ETAT_INITIAL: EtatCalculateur = { presetId: 'holdings', montants: {}, options: {}, accessoires: {}, tvaAmont: '' };

const BADGES: Record<ClassementRecette, { texte: string; classe: string }> = {
  taxee: { texte: 'Taxée', classe: 'bg-positif/15 text-[#7fd39a]' },
  assimilee: { texte: 'Exonérée, droit préservé', classe: 'bg-positif/10 text-[#7fd39a]' },
  exoneree: { texte: 'Exonérée', classe: 'bg-white/10 text-white/60' },
  'hors-champ': { texte: 'Hors champ', classe: 'bg-white/10 text-white/60' },
  exclue: { texte: 'Hors calculs', classe: 'bg-white/5 text-white/40' },
};

function analyser(saisie: string): number {
  const n = Number.parseFloat(saisie.replace(/[\s €]/g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function pourcent(valeur: number | null): string {
  if (valeur === null) return ', ';
  return (valeur * 100).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
}

function euros(valeur: number): string {
  return valeur.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
}

export default function CalculateurProrata({ accent }: Props) {
  const cle = `prorata-${accent}-v1`;
  const [etat, setEtat] = useState<EtatCalculateur>(() => {
    if (typeof window === 'undefined') return ETAT_INITIAL;
    try {
      const brut = window.localStorage.getItem(cle);
      return brut ? { ...ETAT_INITIAL, ...JSON.parse(brut) } : ETAT_INITIAL;
    } catch {
      return ETAT_INITIAL;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(cle, JSON.stringify(etat));
    } catch {
      /* stockage indisponible */
    }
  }, [etat, cle]);

  const preset = presetsProrata.find((p) => p.id === etat.presetId) ?? presetsProrata[0]!;

  const calcul = useMemo(() => {
    // Ventile les montants saisis selon le classement effectif de chaque ligne
    // (une ligne optionable cochée devient taxée ; une ligne accessoire cochée
    // sort du coefficient de taxation).
    let ouvrantDroit = 0; // taxées + assimilées (+ options exercées)
    let exonerees = 0; // exonérées sans droit, comptées au coefficient de taxation
    let accessoires = 0; // exonérées exclues du coefficient de taxation
    let horsChamp = 0;
    let total = 0;

    for (const ligne of preset.lignes) {
      const montant = analyser(etat.montants[`${preset.id}-${ligne.id}`] ?? '');
      if (montant === 0 || ligne.classement === 'exclue') continue;
      total += montant;
      const optee = ligne.optionable && etat.options[`${preset.id}-${ligne.id}`];
      if (ligne.classement === 'taxee' || ligne.classement === 'assimilee' || optee) {
        ouvrantDroit += montant;
      } else if (ligne.classement === 'hors-champ') {
        horsChamp += montant;
      } else if (ligne.accessoirePossible && etat.accessoires[`${preset.id}-${ligne.id}`]) {
        accessoires += montant;
      } else {
        exonerees += montant;
      }
    }

    const champ = ouvrantDroit + exonerees + accessoires;
    const coefTaxation = ouvrantDroit + exonerees > 0 ? ouvrantDroit / (ouvrantDroit + exonerees) : null;
    const coefAssujettissement = total > 0 ? champ / total : null;
    const coefDeduction =
      coefTaxation !== null && coefAssujettissement !== null ? coefTaxation * coefAssujettissement : null;
    const rapportTs = total > 0 ? (exonerees + accessoires + horsChamp) / total : null;

    // Simulation : toutes les options possibles exercées.
    let ouvrantDroitSimule = ouvrantDroit;
    let exonereesSimulees = exonerees;
    let accessoiresSimules = accessoires;
    for (const ligne of preset.lignes) {
      const montant = analyser(etat.montants[`${preset.id}-${ligne.id}`] ?? '');
      if (montant === 0 || !ligne.optionable || etat.options[`${preset.id}-${ligne.id}`]) continue;
      ouvrantDroitSimule += montant;
      if (ligne.accessoirePossible && etat.accessoires[`${preset.id}-${ligne.id}`]) accessoiresSimules -= montant;
      else exonereesSimulees -= montant;
    }
    const coefDeductionSimule =
      total > 0 && ouvrantDroitSimule + exonereesSimulees > 0
        ? ((ouvrantDroitSimule + exonereesSimulees + accessoiresSimules) / total) *
          (ouvrantDroitSimule / (ouvrantDroitSimule + exonereesSimulees))
        : null;

    return { total, ouvrantDroit, exonerees, accessoires, horsChamp, coefTaxation, coefAssujettissement, coefDeduction, rapportTs, coefDeductionSimule };
  }, [preset, etat]);

  const tvaAmont = analyser(etat.tvaAmont);
  const sousSeuil90 = calcul.rapportTs !== null && calcul.rapportTs <= 0.1;

  function majMontant(id: string, valeur: string) {
    setEtat((e) => ({ ...e, montants: { ...e.montants, [id]: valeur } }));
  }

  const barres: { libelle: string; note: string; valeur: number | null; teinte: string }[] = [
    {
      libelle: "Coefficient d'assujettissement",
      note: 'part des recettes dans le champ de la TVA',
      valeur: calcul.coefAssujettissement,
      teinte: '#7d92b5',
    },
    {
      libelle: 'Coefficient de taxation',
      note: 'part ouvrant droit à déduction, dans le champ',
      valeur: calcul.coefTaxation,
      teinte: '#d8ab4a',
    },
    {
      libelle: 'Déduction sur frais généraux',
      note: 'produit des deux coefficients (admission = 1)',
      valeur: calcul.coefDeduction,
      teinte: '#3f9d63',
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr]">
      <div>
        {/* Choix de l'univers */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Profil d'activité">
          {presetsProrata.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={p.id === preset.id}
              onClick={() => setEtat((e) => ({ ...e, presetId: p.id }))}
              className={`rounded px-3.5 py-2 font-texte text-sm font-semibold transition-colors ${
                p.id === preset.id
                  ? 'bg-or-vif text-nuit'
                  : 'border border-white/20 text-white/70 hover:border-white/50 hover:text-white'
              }`}
            >
              {p.titre}
            </button>
          ))}
        </div>

        {/* Lignes de recettes */}
        <div className="mt-6 space-y-3">
          {preset.lignes.map((ligne) => {
            const id = `${preset.id}-${ligne.id}`;
            return (
              <div key={id} className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <label htmlFor={`m-${id}`} className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-titres text-sm font-semibold text-white">{ligne.libelle}</span>
                      <span className={`etiquette rounded px-1.5 py-0.5 text-[9px] ${BADGES[ligne.classement].classe}`}>
                        {BADGES[ligne.classement].texte}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-white/50">{ligne.aide}</span>
                  </label>
                  <input
                    id={`m-${id}`}
                    type="text"
                    inputMode="decimal"
                    value={etat.montants[id] ?? ''}
                    onChange={(e) => majMontant(id, e.target.value)}
                    placeholder="€ / an"
                    className="w-32 rounded border border-white/20 bg-white/5 px-3 py-2 text-right text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-or-vif"
                  />
                </div>
                {(ligne.optionable || ligne.accessoirePossible) && (
                  <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-white/10 pt-2.5">
                    {ligne.optionable && (
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-white/65">
                        <input
                          type="checkbox"
                          checked={etat.options[id] ?? false}
                          onChange={(e) => setEtat((s) => ({ ...s, options: { ...s.options, [id]: e.target.checked } }))}
                          className="h-3.5 w-3.5 accent-[#d8ab4a]"
                        />
                        {ligne.optionable}
                      </label>
                    )}
                    {ligne.accessoirePossible && (
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-white/65">
                        <input
                          type="checkbox"
                          checked={etat.accessoires[id] ?? false}
                          onChange={(e) =>
                            setEtat((s) => ({ ...s, accessoires: { ...s.accessoires, [id]: e.target.checked } }))
                          }
                          className="h-3.5 w-3.5 accent-[#d8ab4a]"
                        />
                        {ligne.accessoirePossible}
                      </label>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
          <label htmlFor={`tva-amont-${accent}`} className="font-titres text-sm font-semibold text-white">
            TVA d'amont annuelle sur vos frais généraux (facultatif)
          </label>
          <p className="mt-1 text-xs leading-5 text-white/50">
            Loyers, honoraires, informatique, énergie… La TVA payée sur ces dépenses mixtes se récupère au
            prorata calculé ci-contre.
          </p>
          <input
            id={`tva-amont-${accent}`}
            type="text"
            inputMode="decimal"
            value={etat.tvaAmont}
            onChange={(e) => setEtat((s) => ({ ...s, tvaAmont: e.target.value }))}
            placeholder="ex. 80 000 €"
            className="mt-3 w-44 rounded border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-or-vif"
          />
        </div>
      </div>

      {/* Résultats */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-white/10 bg-[#0a1526] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          {calcul.total === 0 ? (
            <p className="text-sm leading-6 text-white/55">
              Renseignez vos recettes annuelles par catégorie : les coefficients et le rapport
              d'assujettissement se calculent instantanément, et restent dans votre navigateur.
            </p>
          ) : (
            <>
              {accent === 'ts' && (
                <div className="mb-6 border-b border-white/10 pb-5">
                  <p className="etiquette text-or-vif">Rapport d'assujettissement</p>
                  <p className="texte-affiche mt-2 text-5xl text-white">{pourcent(calcul.rapportTs)}</p>
                  <p className="mt-2 text-xs leading-5 text-white/55">
                    {sousSeuil90
                      ? 'Recettes ouvrant droit à déduction ≥ 90 % du total : vous n’êtes en principe pas redevable de la taxe sur les salaires (art. 231, 1).'
                      : 'Part des rémunérations soumise à la taxe sur les salaires, avant sectorisation éventuelle.'}
                  </p>
                </div>
              )}
              <p className="etiquette text-or-vif">Vos coefficients TVA</p>
              <div className="mt-4 space-y-4">
                {barres.map((barre) => (
                  <div key={barre.libelle}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{barre.libelle}</p>
                      <p className="font-titres text-lg font-bold" style={{ color: barre.teinte }}>
                        {pourcent(barre.valeur)}
                      </p>
                    </div>
                    <p className="text-[11px] text-white/45">{barre.note}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(barre.valeur ?? 0) * 100}%`, background: barre.teinte }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {accent === 'tva' && (
                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold text-white">Rapport taxe sur les salaires</p>
                    <p className="font-titres text-lg font-bold text-white/85">{pourcent(calcul.rapportTs)}</p>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">
                    {sousSeuil90
                      ? 'Sous les 10 % : en principe non redevable de la taxe sur les salaires (art. 231, 1).'
                      : 'Les dividendes et subventions, hors prorata TVA, y sont comptés (CE, n° 410302).'}
                  </p>
                </div>
              )}

              {tvaAmont > 0 && calcul.coefDeduction !== null && (
                <div className="mt-6 rounded border border-or-vif/30 bg-or-vif/10 p-4">
                  <p className="etiquette text-or-pale">Sur vos frais généraux</p>
                  <p className="mt-2 text-sm leading-6 text-white/85">
                    <strong className="text-[#7fd39a]">{euros(tvaAmont * calcul.coefDeduction)}</strong> de TVA
                    récupérable ; <strong className="text-[#ff9d94]">{euros(tvaAmont * (1 - calcul.coefDeduction))}</strong>{' '}
                    restent une charge définitive chaque année.
                  </p>
                  {calcul.coefDeductionSimule !== null &&
                    calcul.coefDeductionSimule > (calcul.coefDeduction ?? 0) + 0.001 && (
                      <p className="mt-2 border-t border-or-vif/20 pt-2 text-xs leading-5 text-white/70">
                        En exerçant les options disponibles, la déduction passerait à{' '}
                        {pourcent(calcul.coefDeductionSimule)} : environ{' '}
                        <strong className="text-or-pale">
                          {euros(tvaAmont * (calcul.coefDeductionSimule - calcul.coefDeduction))}
                        </strong>{' '}
                        récupérés en plus par an.
                      </p>
                    )}
                </div>
              )}

              <a
                href="/expert/"
                className="mt-6 block rounded bg-or-vif px-5 py-3 text-center font-texte text-sm font-bold text-nuit transition-all hover:-translate-y-0.5 hover:bg-or-pale"
              >
                Faire fiabiliser ce calcul par un expert
              </a>
            </>
          )}
        </div>
        <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 text-xs leading-5 text-white/40">
          Estimation indicative par les recettes : le coefficient d'assujettissement réel s'apprécie par
          l'utilisation des dépenses, les coefficients s'arrondissent au centième supérieur, et les exclusions
          (produits accessoires, titres immobilisés) obéissent à des conditions précises. Vos montants restent
          dans votre navigateur.
        </p>
      </aside>
    </div>
  );
}
