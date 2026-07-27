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
  "destinataire": "antoine.bichon.fr@gmail.com",   # module 1 (adresse)
  "objet": "Votre installation en Coree du Sud",    # module 2 (objet, sans deux-points)
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

# Cloture standard du cabinet : une phrase de disponibilite, puis la signature courte.
# Aucun nom : la signature Outlook de Francois s'en charge.
DISPO_DEF = "Je reste à votre disposition pour toute question."
SIGNOFF = "Salutations dévouées."


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
    # 3. phrases trop longues
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
        '<div style="font-family:Calibri,\'Segoe UI\',Arial,sans-serif;'
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
    # modules copier-coller
    bar = "=" * 64
    print(bar)
    print("MODULE 1 - ADRESSE")
    print(bar)
    print(spec.get("destinataire", ""))
    print()
    print(bar)
    print("MODULE 2 - OBJET")
    print(bar)
    print(spec.get("objet", ""))
    print()
    print(bar)
    print("MODULE 3 - CORPS (texte brut ; version mise en forme dans le .html)")
    print(bar)
    print(_plain(spec))
    print(bar)
    print("HTML (gras conserve) a ouvrir puis copier dans Outlook :", out)
    return out


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("Usage : python3 render_mail.py <spec.json> [sortie.html]")
    with open(sys.argv[1], encoding="utf-8") as f:
        spec = json.load(f)
    render(spec, sys.argv[2] if len(sys.argv) > 2 else None)
