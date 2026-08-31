import { useEffect, useMemo, useRef, useState } from 'react';

interface PageIndexee {
  t: string; // titre
  d: string; // description
  u: string; // url
  c: string; // catégorie
}

/** Ordre d'affichage des groupes dans la palette. */
const ORDRE_CATEGORIES = ['Outils', 'Secteurs', 'Guides TVA', 'Notions clés', 'Définitions', 'Actualités', 'Rubriques', 'Contact'];

/** Suggestions affichées avant toute saisie. */
const URLS_SUGGEREES = ['/scan-tva/', '/scan-taxe-salaires/', '/holdings-tva/', '/champ-application-taxe-sur-les-salaires/', '/doctrine/droit-a-deduction/', '/expert/'];

let cacheIndex: PageIndexee[] | null = null;

function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Score de pertinence d'une page pour une requête (0 = non retenue). */
function scorer(page: PageIndexee, termes: string[]): number {
  const titre = normaliser(page.t);
  const description = normaliser(page.d);
  let score = 0;
  for (const terme of termes) {
    if (titre.startsWith(terme)) score += 40;
    else if (titre.includes(terme)) score += 24;
    else if (description.includes(terme)) score += 8;
    else return 0; // tous les termes doivent matcher quelque part
  }
  return score;
}

export default function PaletteRecherche() {
  const [ouverte, setOuverte] = useState(false);
  const [index, setIndex] = useState<PageIndexee[]>(cacheIndex ?? []);
  const [requete, setRequete] = useState('');
  const [surligne, setSurligne] = useState(0);
  const champ = useRef<HTMLInputElement>(null);
  const liste = useRef<HTMLDivElement>(null);

  // Ouverture : clics sur [data-ouvrir-recherche] + raccourcis clavier ⌘K / Ctrl+K / « / ».
  useEffect(() => {
    function auClic(e: MouseEvent) {
      const declencheur = (e.target as HTMLElement).closest('[data-ouvrir-recherche]');
      if (declencheur) {
        e.preventDefault();
        setOuverte(true);
      }
    }
    function auClavier(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOuverte((etat) => !etat);
        return;
      }
      const cible = e.target as HTMLElement | null;
      const dansSaisie = cible && (cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA' || cible.isContentEditable);
      if (e.key === '/' && !dansSaisie) {
        e.preventDefault();
        setOuverte(true);
      }
    }
    document.addEventListener('click', auClic);
    document.addEventListener('keydown', auClavier);
    return () => {
      document.removeEventListener('click', auClic);
      document.removeEventListener('keydown', auClavier);
    };
  }, []);

  // Chargement paresseux de l'index à la première ouverture.
  useEffect(() => {
    if (!ouverte) return;
    setRequete('');
    setSurligne(0);
    requestAnimationFrame(() => champ.current?.focus());
    if (!cacheIndex) {
      fetch('/recherche-index.json')
        .then((r) => r.json())
        .then((donnees: PageIndexee[]) => {
          cacheIndex = donnees;
          setIndex(donnees);
        })
        .catch(() => {});
    }
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [ouverte]);

  const resultats = useMemo(() => {
    const termes = normaliser(requete).split(/\s+/).filter(Boolean);
    if (termes.length === 0) {
      return URLS_SUGGEREES.map((u) => index.find((p) => p.u === u)).filter(Boolean) as PageIndexee[];
    }
    return index
      .map((page) => ({ page, score: scorer(page, termes) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((r) => r.page);
  }, [index, requete]);

  // Groupes pour l'affichage (l'ordre des résultats est conservé dans chaque groupe).
  const groupes = useMemo(() => {
    const parCategorie = new Map<string, PageIndexee[]>();
    for (const page of resultats) {
      if (!parCategorie.has(page.c)) parCategorie.set(page.c, []);
      parCategorie.get(page.c)!.push(page);
    }
    return [...parCategorie.entries()].sort(
      (a, b) => ORDRE_CATEGORIES.indexOf(a[0]) - ORDRE_CATEGORIES.indexOf(b[0])
    );
  }, [resultats]);

  const plat = useMemo(() => groupes.flatMap(([, pages]) => pages), [groupes]);

  function naviguer(page: PageIndexee) {
    setOuverte(false);
    window.location.href = page.u;
  }

  function auClavierPalette(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOuverte(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSurligne((s) => Math.min(s + 1, plat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSurligne((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && plat[surligne]) {
      e.preventDefault();
      naviguer(plat[surligne]);
    }
  }

  // Garde l'élément surligné visible.
  useEffect(() => {
    liste.current
      ?.querySelector(`[data-resultat="${surligne}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [surligne]);

  if (!ouverte) return null;

  let compteur = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-nuit/70 px-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche rapide"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOuverte(false);
      }}
    >
      <div
        className="apparition w-full max-w-xl overflow-hidden rounded-lg border border-white/15 bg-[#0a1526] shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
        onKeyDown={auClavierPalette}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <span className="ms text-xl text-or-vif" aria-hidden="true">search</span>
          <input
            ref={champ}
            type="text"
            value={requete}
            onChange={(e) => {
              setRequete(e.target.value);
              setSurligne(0);
            }}
            placeholder="Rechercher une notion, un secteur, un article… (ex. holding, 257 bis, option)"
            aria-label="Rechercher dans le site"
            className="w-full bg-transparent py-3.5 text-sm text-white placeholder-white/35 outline-none"
          />
          <button
            type="button"
            onClick={() => setOuverte(false)}
            className="rounded border border-white/20 px-1.5 py-0.5 font-texte text-[10px] font-bold text-white/50 transition-colors hover:border-white/50 hover:text-white"
          >
            ESC
          </button>
        </div>

        <div ref={liste} className="max-h-[52vh] overflow-y-auto p-2">
          {plat.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-white/50">
              Aucune page ne correspond à « {requete} ».{' '}
              <a href="/expert/" className="text-or-pale underline underline-offset-4">Posez la question à l'expert</a>.
            </p>
          )}
          {groupes.map(([categorie, pages]) => (
            <div key={categorie}>
              <p className="etiquette px-3 pb-1 pt-3 text-[10px] text-white/40">
                {requete.trim() === '' && categorie === ORDRE_CATEGORIES[0] ? 'Suggestions' : categorie}
              </p>
              {pages.map((page) => {
                compteur += 1;
                const indice = compteur;
                return (
                  <button
                    key={page.u}
                    type="button"
                    data-resultat={indice}
                    onClick={() => naviguer(page)}
                    onMouseMove={() => setSurligne(indice)}
                    className={`group flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition-colors ${
                      indice === surligne ? 'bg-or-vif/15' : 'hover:bg-white/5'
                    }`}
                  >
                    <span
                      className={`h-8 w-0.5 shrink-0 rounded-full transition-colors ${
                        indice === surligne ? 'bg-or-vif' : 'bg-white/10'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className={`block truncate text-sm font-semibold ${indice === surligne ? 'text-or-pale' : 'text-white'}`}>
                        {page.t}
                      </span>
                      <span className="block truncate text-xs text-white/50">{page.d}</span>
                    </span>
                    <span
                      className={`ms ml-auto shrink-0 text-lg transition-opacity ${
                        indice === surligne ? 'text-or-vif opacity-100' : 'opacity-0'
                      }`}
                      aria-hidden="true"
                    >
                      arrow_forward
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-white/10 px-4 py-2.5 text-[11px] text-white/40">
          <span><kbd className="rounded border border-white/20 px-1 font-texte font-bold">↑↓</kbd> naviguer</span>
          <span><kbd className="rounded border border-white/20 px-1 font-texte font-bold">↵</kbd> ouvrir</span>
          <span><kbd className="rounded border border-white/20 px-1 font-texte font-bold">esc</kbd> fermer</span>
          <span className="ml-auto hidden sm:block">{index.length} pages indexées</span>
        </div>
      </div>
    </div>
  );
}
