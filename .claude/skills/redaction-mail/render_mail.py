#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
render_mail.py - prepare un mail client BENSAID AVOCATS en modules copier-coller.

Usage :
    python3 render_mail.py <spec.json> [sortie.html]

Produit :
  - un fichier .html (corps du mail, titres en gras) a ouvrir puis copier-coller
    dans Outlook en conservant la mise en forme ;
  - imprime les trois modules copier-coller sur stdout : ADRESSE, OBJET, CORPS.

Le corps NE se signe PAS au nom de Francois (la signature Outlook s'en charge).
Il se termine toujours sur la formule de politesse (salutations devouees).

Spec JSON :
{
  "destinataire": "antoine.bichon.fr@gmail.com",   # module DESTINATAIRE
  "copie": "jonathan@bensaid-avocats.fr",           # optionnel ; module COPIE (omis si absent)
  "objet": "Votre installation en Coree du Sud",    # module OBJET (sans deux-points)
  "civilite": "Cher Monsieur,",                     # defaut "Cher Monsieur,"
  "disponibilite": "Je reste à votre disposition pour toute question.",  # optionnel, "" pour retirer
  "signoff": "Salutations dévouées.",               # optionnel ; defaut identique
  "sortie": "chemin/mail.html",                     # optionnel (sinon 2e argument CLI)
  "corps": [
    {"titre": "Le transfert de votre residence"},   # titre de section, rendu en gras
    {"p": "Votre depart ne se prouve pas par un billet d'avion. Il se documente."},
    {"b": "vos deux dernieres declarations de revenus"}   # puce
  ]
}

Regles de style verifiees par le script :
  - aucun tiret cadratin (—) ni demi-cadratin (–) : generation refusee si present.
  - densite de deux-points surveillee : avertissement si les « : » sont trop nombreux.
  - phrases courtes : avertissement si une phrase depasse 240 caracteres.
"""
import sys, json, os, re, html

FATAL_CHARS = {"—": "tiret cadratin (—)", "–": "demi-cadratin (–)"}

# Antitheses en miroir : on dit ce que la chose n'est pas, puis ce qu'elle est.
# Marqueur IA le plus reconnaissable, banni par la charte du cabinet.
APO = r"['\u2019]"
NEG = (r"n(?:e\s|" + APO + r")[^.!?]{0,160}?\b(?:pas|jamais|plus|aucun|aucune|rien)\b")
ANTITHESES = [
    # « Ce n'est pas X. C'est Y. » / « ... n'est pas X, c'est Y »
    (re.compile(NEG + r"[^.!?]{0,160}[.,;]\s+(?:C'est|Ce sont|C'était|Il s'agit)\b"),
     "negation puis « c'est »"),
    # « Nous ne faisons jamais X. Nous faisons Y. »
    (re.compile(r"\b(Nous|Je|Vous|Il|Elle|On)\b\s" + NEG +
                r"[^.!?]{0,200}[.]\s+\1\b"),
     "meme sujet nie puis affirme"),
    # « non pas X mais Y »
    (re.compile(r"\bnon pas\b[^.!?]{0,120}\bmais\b"), "« non pas ... mais »"),
    # « Y, et non X »
    (re.compile(r",\s*(?:mais\s+)?[^.!?]{0,80}\bet non\b(?!\s+(?:seulement|plus))"),
     "« ..., et non ... »"),
]

# Cloture standard du cabinet : une phrase de disponibilite, puis la signature courte.
# Aucun nom : la signature Outlook de Francois s'en charge.
DISPO_DEF = "Je reste à votre disposition pour toute question."
SIGNOFF = "Salutations dévouées,"


def _texts(spec):
    """Tous les fragments de texte du corps + objet + politesse, pour les controles."""
    out = [spec.get("objet", "")]
    for blk in spec.get("corps", []):
        for k in ("titre", "p", "b", "em"):
            if k in blk:
                out.append(blk[k])
    out.append(spec.get("_dispo", ""))
    out.append(spec.get("_signoff", ""))
    return out


def _check_style(spec):
    fragments = _texts(spec)
    joined = "\n".join(fragments)
    # 1. tirets cadratins interdits
    for ch, label in FATAL_CHARS.items():
        if ch in joined:
            raise SystemExit(
                "STYLE : %s detecte dans le texte. Le remplacer par un point, "
                "une virgule ou une parenthese, puis relancer." % label)
    # 2. deux-points : on en limite l'usage
    colons = joined.count(":")
    phrases = max(1, len(re.findall(r"[.!?]", joined)))
    if colons > 0:
        ratio = colons / phrases
        if ratio > 0.34:
            sys.stderr.write(
                "STYLE (avertissement) : %d deux-points pour ~%d phrases. "
                "Le cabinet en limite l'usage, privilegier des phrases courtes.\n"
                % (colons, phrases))
    # 3. antithese en miroir : marqueur IA banni par la charte
    for motif, exemple in ANTITHESES:
        for m in motif.finditer(joined):
            sys.stderr.write(
                "STYLE (avertissement) : antithese en miroir (%s), bannie par la charte :\n"
                "  \"%s\"\n"
                "  Enoncer directement ce qui est, sans passer par ce qui n'est pas.\n"
                % (exemple, m.group(0)[:160].replace("\n", " ")))
    # 4. phrases trop longues
    for frag in fragments:
        for phrase in re.split(r"(?<=[.!?])\s+", frag):
            if len(phrase) > 240:
                sys.stderr.write(
                    "STYLE (avertissement) : phrase de %d caracteres, la scinder :\n"
                    "  \"%s...\"\n" % (len(phrase), phrase[:70]))


def _plain(spec):
    civ = spec.get("civilite", "Cher Monsieur,").strip()
    lignes = [civ, ""]
    prev_bullet = False
    for blk in spec.get("corps", []):
        if "titre" in blk:
            lignes += ["", blk["titre"], ""]
            prev_bullet = False
        elif "p" in blk:
            if prev_bullet:
                lignes.append("")
            lignes += [blk["p"], ""]
            prev_bullet = False
        elif "b" in blk:
            lignes.append("- " + blk["b"])
            prev_bullet = True
        elif "em" in blk:
            lignes += [blk["em"], ""]
            prev_bullet = False
    if prev_bullet:
        lignes.append("")
    if spec.get("_dispo"):
        lignes += ["", spec["_dispo"]]
    lignes += ["", spec["_signoff"]]
    # nettoyer les lignes vides multiples
    out, blank = [], False
    for l in lignes:
        if l == "":
            if not blank:
                out.append(l)
            blank = True
        else:
            out.append(l)
            blank = False
    return "\n".join(out).strip() + "\n"


def _html(spec):
    civ = html.escape(spec.get("civilite", "Cher Monsieur,").strip())
    parts = [
        '<div style="font-family:Aptos,\'Segoe UI\',Calibri,Arial,sans-serif;'
        'font-size:11pt;color:#000000;line-height:1.45;">',
        '<p style="margin:0 0 12px 0;">%s</p>' % civ,
    ]
    bullets = []

    def flush_bullets():
        if bullets:
            parts.append('<div style="margin:0 0 12px 0;">')
            parts.extend('<div style="margin:0 0 3px 0;">- %s</div>' % b for b in bullets)
            parts.append("</div>")
            bullets.clear()

    for blk in spec.get("corps", []):
        if "b" in blk:
            bullets.append(html.escape(blk["b"]))
            continue
        flush_bullets()
        if "titre" in blk:
            parts.append('<p style="margin:16px 0 6px 0;"><b>%s</b></p>'
                         % html.escape(blk["titre"]))
        elif "p" in blk:
            parts.append('<p style="margin:0 0 12px 0;">%s</p>'
                         % html.escape(blk["p"]))
        elif "em" in blk:
            parts.append('<p style="margin:0 0 12px 0;color:#555;"><i>%s</i></p>'
                         % html.escape(blk["em"]))
    flush_bullets()
    if spec.get("_dispo"):
        parts.append('<p style="margin:14px 0 0 0;">%s</p>'
                     % html.escape(spec["_dispo"]))
    parts.append('<p style="margin:12px 0 0 0;">%s</p>'
                 % html.escape(spec["_signoff"]))
    parts.append("</div>")
    doc = ('<!doctype html><html lang="fr"><head><meta charset="utf-8">'
           '<title>Corps du mail</title></head>'
           '<body style="margin:24px;">' + "".join(parts) + "</body></html>")
    return doc


def render(spec, out=None):
    spec["_dispo"] = spec.get("disponibilite", DISPO_DEF)
    spec["_signoff"] = spec.get("signoff", SIGNOFF)
    _check_style(spec)
    out = out or spec.get("sortie")
    if not out:
        raise SystemExit("Chemin de sortie manquant (cle 'sortie' ou 2e argument).")
    with open(out, "w", encoding="utf-8") as f:
        f.write(_html(spec))
    # modules copier-coller (un bloc par element, comme dans Outlook)
    bar = "=" * 64

    def _mod(label, content):
        print(bar)
        print(label)
        print(bar)
        print(content)
        print()

    _mod("DESTINATAIRE", spec.get("destinataire", ""))
    if spec.get("copie"):
        _mod("COPIE", spec["copie"])
    _mod("OBJET", spec.get("objet", ""))
    _mod("CORPS", _plain(spec))
    print("HTML (Aptos, titres en gras) genere pour un collage mis en forme, sur demande :", out)
    return out


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("Usage : python3 render_mail.py <spec.json> [sortie.html]")
    with open(sys.argv[1], encoding="utf-8") as f:
        spec = json.load(f)
    render(spec, sys.argv[2] if len(sys.argv) > 2 else None)
