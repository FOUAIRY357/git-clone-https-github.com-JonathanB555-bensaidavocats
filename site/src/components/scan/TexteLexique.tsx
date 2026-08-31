import { Fragment, useMemo } from 'react';
import { lexique } from '@/data/lexique';

interface Props {
  texte: string;
}

interface Morceau {
  texte: string;
  url?: string;
  definition?: string;
}

/** Formes triées de la plus longue à la plus courte, pour matcher « coefficient de taxation » avant « taxation ». */
const FORMES = lexique
  .flatMap((terme) => terme.formes.map((forme) => ({ forme, url: terme.url, definition: terme.definition })))
  .sort((a, b) => b.forme.length - a.forme.length);

/**
 * Rend un texte en liant la première occurrence de chaque terme du lexique
 * vers sa page de définition, avec une info-bulle.
 */
export default function TexteLexique({ texte }: Props) {
  const morceaux = useMemo<Morceau[]>(() => {
    let resultat: Morceau[] = [{ texte }];
    const urlsUtilisees = new Set<string>();
    for (const { forme, url, definition } of FORMES) {
      if (urlsUtilisees.has(url)) continue;
      const suivant: Morceau[] = [];
      let trouve = false;
      for (const morceau of resultat) {
        if (trouve || morceau.url) {
          suivant.push(morceau);
          continue;
        }
        const position = morceau.texte.toLowerCase().indexOf(forme.toLowerCase());
        if (position === -1) {
          suivant.push(morceau);
          continue;
        }
        trouve = true;
        urlsUtilisees.add(url);
        if (position > 0) suivant.push({ texte: morceau.texte.slice(0, position) });
        suivant.push({ texte: morceau.texte.slice(position, position + forme.length), url, definition });
        if (position + forme.length < morceau.texte.length)
          suivant.push({ texte: morceau.texte.slice(position + forme.length) });
      }
      resultat = suivant;
    }
    return resultat;
  }, [texte]);

  return (
    <>
      {morceaux.map((morceau, i) =>
        morceau.url ? (
          <a key={i} href={morceau.url} className="terme-lexique" data-def={morceau.definition}>
            {morceau.texte}
          </a>
        ) : (
          <Fragment key={i}>{morceau.texte}</Fragment>
        )
      )}
    </>
  );
}
