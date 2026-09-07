#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
charte_check.py - controle de conformite a la charte BENSAID AVOCATS.

Les regles typographiques et stylistiques du cabinet valent pour TOUT ecrit
(mail, courrier, note, consultation, compte rendu, deck, copy du site), quel
que soit le gabarit d'origine, y compris un modele venu de l'exterieur. Ce
module en est le seul controleur : les renderers du cabinet l'appellent avant
de generer, et il s'utilise aussi en ligne de commande sur un document deja
produit.

Reference : .claude/skills/charte-cabinet/SKILL.md

Usage module (depuis un renderer) :
    from charte_check import check_spec
    check_spec(spec)        # leve SystemExit si manquement fatal, avertit sinon

Usage CLI :
    python3 .claude/skills/charte-cabinet/charte_check.py <fichier> [--web]
      <fichier> : .txt / .md (texte brut), .json (spec de renderer), .docx
      --web     : ajoute le controle « espace tiret espace » (contenu web)
    Code retour 1 si un manquement fatal subsiste (tiret cadratin ou
    demi-cadratin), 0 sinon. Les avertissements ne bloquent pas.

Sans dependance : stdlib seule, y compris pour lire un .docx.
"""
import sys
import os
import re
import json
import zipfile

# --------------------------------------------------------------------------
# 1. Manquements fatals : la generation est refusee
# --------------------------------------------------------------------------
FATAL_CHARS = {
    "—": "tiret cadratin (—)",
    "–": "demi-cadratin (–)",
}

# --------------------------------------------------------------------------
# 2. Avertissements : marqueurs IA et derives de style
# --------------------------------------------------------------------------
APO = r"['’]"
NEG = (r"n(?:e\s|" + APO + r")[^.!?]{0,160}?\b(?:pas|jamais|plus|aucun|aucune|rien)\b")

# Antitheses en miroir : on dit ce que la chose n'est pas, puis ce qu'elle est.
# Marqueur IA le plus reconnaissable, banni par la charte.
ANTITHESES = [
    # « Ce n'est pas X. C'est Y. » / « ... n'est pas X, c'est Y »
    (re.compile(NEG + r"[^.!?]{0,160}[.,;]\s+(?:C'est|Ce sont|C'était|Il s'agit)\b"),
     "negation puis « c'est »"),
    # « Nous ne faisons jamais X. Nous faisons Y. »
    (re.compile(r"\b(Nous|Je|Vous|Il|Elle|On)\b\s" + NEG + r"[^.!?]{0,200}[.]\s+\1\b"),
     "meme sujet nie puis affirme"),
    # « non pas X mais Y »
    (re.compile(r"\bnon pas\b[^.!?]{0,120}\bmais\b", re.I), "« non pas ... mais »"),
    # « ce n'est pas X, mais Y » : negation puis substitution dans la meme phrase.
    # Le plus lache des motifs : une concessive legitime (« nous ne conseillons pas
    # sur le droit americain, mais l'echeance doit etre tenue ») y ressemble. A lire.
    (re.compile(NEG + r"[^.!?]{0,100},\s*mais\b", re.I),
     "negation puis « mais », a arbitrer : concessive legitime possible"),
    # « il ne s'agit pas de X, mais de Y »
    (re.compile(r"\bil ne s" + APO + r"agit pas\b[^.!?]{0,120}\bmais\b", re.I),
     "« il ne s'agit pas ... mais »"),
    # « Y, et non X »
    (re.compile(r",\s*(?:mais\s+)?[^.!?]{0,80}\bet non\b(?!\s+(?:seulement|plus))", re.I),
     "« ..., et non ... »"),
]

# Phrases-chapeau qui annoncent la comprehension au lieu de la prouver.
CHAPEAUX = [
    re.compile(r"\bvotre (?:demande|question|situation) est claire\b", re.I),
    re.compile(r"\bsi je comprends bien\b", re.I),
    re.compile(r"\b(?:je comprends|nous comprenons) bien\b", re.I),
    re.compile(r"\bc" + APO + r"est bien noté\b", re.I),
    re.compile(r"\b(?:j" + APO + r"ai|nous avons) bien compris\b", re.I),
]

# Puce ronde saisie a la main : la charte prescrit le tiret simple « - ».
# Le point median « · » en est exclu : c'est le separateur de la charte graphique
# (bandeau de deck, pied de page du gabarit), pas un marqueur de liste.
PUCE_RONDE = re.compile(r"[•●▪]")

# Contenu web : « espace tiret espace » est converti en tiret long par le CMS.
TIRET_ESPACE = re.compile(r"(?<=\S) - (?=\S)")

# Densite de deux-points toleree, rapportee au nombre de phrases.
RATIO_DEUX_POINTS = 0.34
LONGUEUR_PHRASE_MAX = 240

# Cles techniques d'un spec JSON : ce ne sont pas des textes rediges.
SKIP_KEYS = {"sortie", "type", "signature", "img", "w", "entete", "sommaire",
             "confidentiel", "signature_largeur_cm", "ville", "date", "ville_date"}


# --------------------------------------------------------------------------
# Collecte des textes
# --------------------------------------------------------------------------
def iter_texts(obj):
    """Tous les fragments rediges d'un spec JSON (dict / list / str), a plat."""
    out = []
    if isinstance(obj, str):
        out.append(obj)
    elif isinstance(obj, dict):
        for cle, val in obj.items():
            if cle in SKIP_KEYS:
                continue
            out.extend(iter_texts(val))
    elif isinstance(obj, (list, tuple)):
        for val in obj:
            out.extend(iter_texts(val))
    return out


# Marqueur de liste pose par nos renderers .docx dans le gabarit du cabinet :
# on ne le compte pas comme une puce ronde saisie dans le texte.
PUCE_GABARIT = re.compile(r"^\s*[•●▪]\s*")


def docx_text(chemin):
    """Corps redige d'un .docx, sans dependance : on lit word/document.xml.

    Utilisable sur un document produit hors de nos renderers (gabarit client,
    modele externe) pour en controler la conformite. On ne lit ni l'en-tete ni
    le pied de page : ils appartiennent au gabarit du cabinet, pas au texte
    redige. Le marqueur de liste du gabarit (« • ») est retire en tete de
    ligne ; un tiret cadratin ou demi-cadratin reste fatal ou qu'il se trouve.
    """
    with zipfile.ZipFile(chemin) as zf:
        noms = [n for n in zf.namelist()
                if n == "word/document.xml"
                or (n.startswith("word/") and n.endswith(".xml")
                    and os.path.basename(n).startswith(("footnotes", "endnotes")))]
        if "word/document.xml" not in noms:
            raise SystemExit("Ce .docx ne contient pas word/document.xml.")
        brut = []
        for nom in noms:
            xml = zf.read(nom).decode("utf-8", "replace")
            # fin de paragraphe et saut de ligne -> retour a la ligne
            xml = re.sub(r"</w:p>", "\n", xml)
            xml = re.sub(r"<w:br\b[^>]*/?>", "\n", xml)
            xml = re.sub(r"<[^>]+>", "", xml)
            brut.append(xml)
    texte = "\n".join(brut)
    texte = (texte.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
                  .replace("&quot;", '"').replace("&apos;", "'"))
    return [PUCE_GABARIT.sub("", ligne) for ligne in texte.split("\n") if ligne.strip()]


def fragments_de_fichier(chemin):
    ext = os.path.splitext(chemin)[1].lower()
    if ext == ".docx":
        return docx_text(chemin)
    if ext == ".json":
        with open(chemin, encoding="utf-8") as f:
            return iter_texts(json.load(f))
    with open(chemin, encoding="utf-8") as f:
        return [ligne for ligne in f.read().split("\n") if ligne.strip()]


# --------------------------------------------------------------------------
# Analyse
# --------------------------------------------------------------------------
def analyse(fragments, web=False, fragment=False):
    """Retourne (fatals, avertissements), deux listes de messages.

    fragment=True pour un morceau de texte isole (une zone de texte de slide,
    par exemple) : les controles de densite, qui n'ont de sens que sur un
    document entier, sont alors ecartes.
    """
    fragments = [f for f in fragments if isinstance(f, str)]
    joint = "\n".join(fragments)
    fatals, avert = [], []

    # 1. tirets cadratins et demi-cadratins : interdits partout
    for car, libelle in FATAL_CHARS.items():
        n = joint.count(car)
        if n:
            fatals.append(
                "%s : %d occurrence(s). Le remplacer par un point, une virgule, "
                "un tiret simple ou une parenthese, puis relancer." % (libelle, n))

    # 2. deux-points : usage rare (densite mesurable sur un document entier)
    deux_points = joint.count(":")
    phrases = max(1, len(re.findall(r"[.!?]", joint)))
    if not fragment and deux_points and deux_points / phrases > RATIO_DEUX_POINTS:
        avert.append(
            "%d deux-points pour ~%d phrases. La charte en limite l'usage, "
            "privilegier deux phrases courtes." % (deux_points, phrases))

    # 3. antitheses en miroir
    for motif, exemple in ANTITHESES:
        for m in motif.finditer(joint):
            avert.append(
                "antithese en miroir (%s), bannie par la charte :\n    \"%s\"\n"
                "    Enoncer directement ce qui est, sans passer par ce qui n'est pas."
                % (exemple, m.group(0)[:160].replace("\n", " ")))

    # 4. phrases-chapeau qui annoncent la comprehension
    for motif in CHAPEAUX:
        for m in motif.finditer(joint):
            avert.append(
                "phrase-chapeau annoncant la comprehension : \"%s\". Entrer "
                "directement dans les faits." % m.group(0))

    # 5. puces rondes
    n_puces = len(PUCE_RONDE.findall(joint))
    if n_puces:
        avert.append("%d puce(s) ronde(s) saisie(s) dans le texte. La charte "
                     "prescrit le tiret simple « - »." % n_puces)

    # 6. phrases trop longues
    for frag in fragments:
        for phrase in re.split(r"(?<=[.!?])\s+", frag):
            if len(phrase) > LONGUEUR_PHRASE_MAX:
                avert.append("phrase de %d caracteres, la scinder :\n    \"%s...\""
                             % (len(phrase), phrase[:70]))

    # 7. contenu web : « espace tiret espace » devient un tiret long
    if web:
        n_te = len(TIRET_ESPACE.findall(joint))
        if n_te:
            avert.append("%d occurrence(s) de « espace tiret espace » : le CMS les "
                         "convertit en tiret long. Reformuler." % n_te)

    return fatals, avert


def check(fragments, web=False, strict=True, fragment=False):
    """Avertit sur stderr ; leve SystemExit si un manquement fatal subsiste."""
    fatals, avert = analyse(fragments, web=web, fragment=fragment)
    for msg in avert:
        sys.stderr.write("STYLE (avertissement) : %s\n" % msg)
    if fatals and strict:
        raise SystemExit("STYLE : " + "\n       ".join(fatals))
    return fatals, avert


def check_spec(spec, web=False, strict=True):
    """Controle un spec JSON de renderer (mail, note, courrier)."""
    return check(iter_texts(spec), web=web, strict=strict)


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------
def main(argv):
    args = [a for a in argv[1:] if not a.startswith("--")]
    web = "--web" in argv
    if len(args) != 1:
        sys.stderr.write(__doc__)
        return 2
    fragments = fragments_de_fichier(args[0])
    fatals, avert = analyse(fragments, web=web)
    nom = os.path.basename(args[0])
    if not fatals and not avert:
        print("Charte BENSAID AVOCATS : %s est conforme." % nom)
        return 0
    print("Charte BENSAID AVOCATS - controle de %s" % nom)
    for msg in fatals:
        print("  FATAL         : %s" % msg)
    for msg in avert:
        print("  AVERTISSEMENT : %s" % msg)
    print("\n%d manquement(s) fatal(s), %d avertissement(s)." % (len(fatals), len(avert)))
    return 1 if fatals else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
