import type { ArbreScan, OperationScannee, TeinteCarto } from '@/data/scan/types';

const COULEURS: Record<TeinteCarto, string> = {
  marine: '#001b3a',
  or: '#8a6a1f',
  vert: '#1d6b3c',
  ardoise: '#44506b',
  gris: '#c4c6cf',
};

/** Texte lisible sur la pastille selon sa teinte. */
const ENCRE_PASTILLE: Record<TeinteCarto, string> = {
  marine: '#ffffff',
  or: '#ffffff',
  vert: '#ffffff',
  ardoise: '#ffffff',
  gris: '#1b1c1a',
};

interface Props {
  arbre: ArbreScan;
  operations: OperationScannee[];
  /** Libellé de l'opération en cours de scan (nœud pulsant), s'il y en a une. */
  operationEnCours?: string;
  /** Version réduite (barre latérale) : masque légende et libellés longs. */
  compacte?: boolean;
}

/** Position des nœuds : répartis autour de l'entité selon l'angle d'or. */
function position(index: number, total: number) {
  const angle = -Math.PI / 2 + index * ((2 * Math.PI) / Math.max(total, 3)) * 0.92;
  return {
    x: 300 + 205 * Math.cos(angle),
    y: 220 + 138 * Math.sin(angle),
  };
}

export default function CartographieScan({ arbre, operations, operationEnCours, compacte }: Props) {
  const total = operations.length + (operationEnCours ? 1 : 0);
  const k = compacte ? 1.7 : 1;
  const legende = new Map<string, TeinteCarto>();
  for (const op of operations) {
    const carto = arbre.resultats[op.resultatId]?.carto;
    if (carto) legende.set(carto.libelle, carto.teinte);
  }

  return (
    <figure aria-label="Cartographie des opérations du dossier" className="m-0">
      <svg
        viewBox="0 0 600 440"
        role="img"
        className="w-full"
        style={{ maxHeight: compacte ? 240 : 460 }}
      >
        {/* grille discrète */}
        <defs>
          <pattern id="grille" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e1d8" strokeWidth="0.6" />
          </pattern>
        </defs>
        {!compacte && <rect x="0" y="0" width="600" height="440" fill="url(#grille)" opacity="0.6" />}

        {/* liens */}
        {operations.map((op, i) => {
          const { x, y } = position(i, total);
          const carto = arbre.resultats[op.resultatId]?.carto;
          const pointille = carto?.deduction !== 'oui';
          return (
            <line
              key={`l-${i}`}
              x1="300"
              y1="220"
              x2={x}
              y2={y}
              stroke="#cfc9ba"
              strokeWidth="1.4"
              strokeDasharray={pointille ? '0.025 0.02' : '1'}
              pathLength={1}
              className={pointille ? 'carto-lien-pointille' : 'carto-lien'}
              style={{ animationDelay: `${i * 90}ms` }}
            />
          );
        })}
        {operationEnCours && (
          <line
            x1="300"
            y1="220"
            x2={position(total - 1, total).x}
            y2={position(total - 1, total).y}
            stroke="#8a6a1f"
            strokeWidth="1.4"
            strokeDasharray="4 5"
            className="carto-lien-pulse"
          />
        )}

        {/* entité centrale */}
        <g className="carto-noeud">
          <circle cx="300" cy="220" r={34 * k} fill="#001b3a" />
          <circle cx="300" cy="220" r={41 * k} fill="none" stroke="#001b3a" strokeOpacity="0.15" strokeWidth="2" />
          <text x="300" y={220 + 9 * k} textAnchor="middle" className="ms" fontSize={26 * k} fill="#fed488">
            domain
          </text>
          <text x="300" y={220 + 58 * k} textAnchor="middle" fontSize={12 * k} fontWeight="600" fill="#1b1c1a" fontFamily="Montserrat, sans-serif">
            Votre entité
          </text>
        </g>

        {/* opérations qualifiées */}
        {operations.map((op, i) => {
          const { x, y } = position(i, total);
          const carto = arbre.resultats[op.resultatId]?.carto;
          const fond = COULEURS[carto?.teinte ?? 'gris'];
          const encre = ENCRE_PASTILLE[carto?.teinte ?? 'gris'];
          return (
            <g key={`n-${i}`} className="carto-noeud" style={{ animationDelay: `${120 + i * 90}ms` }}>
              <rect x={x - 24 * k} y={y - 24 * k} width={48 * k} height={48 * k} rx={10 * k} fill={fond} />
              <text x={x} y={y + 8 * k} textAnchor="middle" className="ms" fontSize={24 * k} fill={encre}>
                receipt_long
              </text>
              <text x={x} y={y + 42 * k} textAnchor="middle" fontSize={11.5 * k} fontWeight="600" fill="#1b1c1a" fontFamily="Montserrat, sans-serif">
                {op.libelle.length > 22 ? op.libelle.slice(0, 21) + '…' : op.libelle}
              </text>
              <text x={x} y={y + 56 * k} textAnchor="middle" fontSize={10 * k} fill="#74777f" fontFamily="'Plus Jakarta Sans', sans-serif">
                {carto?.libelle ?? 'À qualifier'}
              </text>
            </g>
          );
        })}

        {/* opération en cours de scan */}
        {operationEnCours &&
          (() => {
            const { x, y } = position(total - 1, total);
            return (
              <g className="carto-noeud">
                <rect
                  x={x - 24 * k}
                  y={y - 24 * k}
                  width={48 * k}
                  height={48 * k}
                  rx={10 * k}
                  fill="#faf9f5"
                  stroke="#8a6a1f"
                  strokeWidth="1.6"
                  strokeDasharray="4 4"
                  className="carto-pulse"
                />
                <text x={x} y={y + 8 * k} textAnchor="middle" className="ms" fontSize={24 * k} fill="#8a6a1f">
                  radar
                </text>
                <text x={x} y={y + 42 * k} textAnchor="middle" fontSize={11.5 * k} fontWeight="600" fill="#8a6a1f" fontFamily="Montserrat, sans-serif">
                  {operationEnCours.length > 22 ? operationEnCours.slice(0, 21) + '…' : operationEnCours}
                </text>
                <text x={x} y={y + 56 * k} textAnchor="middle" fontSize={10 * k} fill="#74777f" fontFamily="'Plus Jakarta Sans', sans-serif">
                  Scan en cours
                </text>
              </g>
            );
          })()}
      </svg>

      {!compacte && legende.size > 0 && (
        <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          {[...legende.entries()].map(([libelle, teinte]) => (
            <span key={libelle} className="flex items-center gap-2 text-xs text-texte-2">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: COULEURS[teinte] }}
                aria-hidden="true"
              />
              {libelle}
            </span>
          ))}
          <span className="flex items-center gap-2 text-xs text-texte-3">
            <span className="inline-block h-px w-4 border-t border-dashed border-texte-3" aria-hidden="true" />
            lien pointillé : pas de droit à déduction
          </span>
        </figcaption>
      )}
    </figure>
  );
}
