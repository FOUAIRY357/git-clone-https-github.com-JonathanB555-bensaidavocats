#!/usr/bin/env python3
"""Migration du contenu de l'ancien taxesalaire.com (WordPress) vers le nouveau site.

Deux modes :
  python3 migration.py crawl                     # aspire le site en ligne via son sitemap
  python3 migration.py wxr export-wordpress.xml  # ou lit un export WordPress (Outils > Exporter)

Produit dans site/migration/ :
  - un fichier .md par page (frontmatter titre/description/url d'origine + corps en Markdown)
  - inventaire.csv : url, titre, statut de récupération
  - redirections.txt : brouillon des 301 (ancienne URL -> nouvelle URL à arbitrer)

Ces fichiers sont une zone de transit : on les relit, on les répartit ensuite dans
src/content/secteurs/ et src/content/doctrine/, puis on arbitre les redirections.
Aucune dépendance externe (stdlib uniquement).
"""

import csv
import html
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent / "migration"
SITE = "https://taxesalaire.com"
ENTETES = {"User-Agent": "Mozilla/5.0 (migration taxesalaire.com; contact: cabinet)"}


def telecharger(url: str) -> str:
    requete = urllib.request.Request(url, headers=ENTETES)
    with urllib.request.urlopen(requete, timeout=30) as reponse:
        return reponse.read().decode("utf-8", errors="replace")


# ---------------------------------------------------------------- HTML -> Markdown
class ConvertisseurMarkdown(HTMLParser):
    """Conversion volontairement simple, adaptée au HTML régulier de WordPress."""

    BLOCS = {"p", "h1", "h2", "h3", "h4", "li", "tr", "blockquote", "figcaption"}
    IGNORES = {"script", "style", "nav", "form", "aside", "footer", "header", "noscript", "svg", "button"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.morceaux: list[str] = []
        self.pile: list[str] = []
        self.ignore = 0
        self.href = ""

    def handle_starttag(self, balise, attributs):
        if balise in self.IGNORES:
            self.ignore += 1
            return
        if self.ignore:
            return
        self.pile.append(balise)
        attrs = dict(attributs)
        if balise in ("h1", "h2"):
            self.morceaux.append("\n\n## ")
        elif balise == "h3":
            self.morceaux.append("\n\n### ")
        elif balise == "h4":
            self.morceaux.append("\n\n#### ")
        elif balise == "p":
            self.morceaux.append("\n\n")
        elif balise == "li":
            self.morceaux.append("\n- ")
        elif balise == "blockquote":
            self.morceaux.append("\n\n> ")
        elif balise in ("strong", "b"):
            self.morceaux.append("**")
        elif balise in ("em", "i"):
            self.morceaux.append("*")
        elif balise == "a":
            self.href = attrs.get("href", "")
            self.morceaux.append("[")
        elif balise == "br":
            self.morceaux.append("\n")
        elif balise in ("tr",):
            self.morceaux.append("\n| ")
        elif balise in ("td", "th"):
            pass

    def handle_endtag(self, balise):
        if balise in self.IGNORES:
            self.ignore = max(0, self.ignore - 1)
            return
        if self.ignore:
            return
        if self.pile and self.pile[-1] == balise:
            self.pile.pop()
        if balise in ("strong", "b"):
            self.morceaux.append("**")
        elif balise in ("em", "i"):
            self.morceaux.append("*")
        elif balise == "a":
            self.morceaux.append(f"]({self.href})")
            self.href = ""
        elif balise in ("td", "th"):
            self.morceaux.append(" | ")

    def handle_data(self, donnees):
        if self.ignore:
            return
        texte = re.sub(r"\s+", " ", donnees)
        if texte.strip() or (self.morceaux and not self.morceaux[-1].endswith(" ")):
            self.morceaux.append(texte)

    def resultat(self) -> str:
        texte = "".join(self.morceaux)
        texte = re.sub(r"\n{3,}", "\n\n", texte)
        texte = re.sub(r"[ \t]+\n", "\n", texte)
        return texte.strip()


def html_vers_markdown(fragment: str) -> str:
    convertisseur = ConvertisseurMarkdown()
    convertisseur.feed(fragment)
    return convertisseur.resultat()


def extraire(page: str, motif: str) -> str:
    resultat = re.search(motif, page, re.I | re.S)
    return html.unescape(resultat.group(1)).strip() if resultat else ""


def extraire_contenu(page: str) -> str:
    """Isole la zone de contenu WordPress (entry-content), sinon <article>, sinon <main>."""
    for motif in (
        r'<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>(.*?)</div>\s*(?:<footer|<div[^>]*class="[^"]*entry-footer|<aside|</article)',
        r"<article[^>]*>(.*?)</article>",
        r"<main[^>]*>(.*?)</main>",
    ):
        zone = re.search(motif, page, re.I | re.S)
        if zone:
            return zone.group(1)
    return ""


def chemin_sortie(url: str) -> Path:
    chemin = url.replace(SITE, "").strip("/") or "accueil"
    return RACINE / (chemin.replace("/", "__") + ".md")


def sauver_page(url: str, titre: str, description: str, corps_markdown: str) -> None:
    RACINE.mkdir(parents=True, exist_ok=True)
    destination = chemin_sortie(url)
    frontmatter = (
        f'---\ntitre: "{titre.replace(chr(34), chr(39))}"\n'
        f'description: "{description.replace(chr(34), chr(39))}"\n'
        f"url_origine: {url}\n---\n\n"
    )
    destination.write_text(frontmatter + corps_markdown + "\n", encoding="utf-8")


# ---------------------------------------------------------------- mode crawl
def urls_du_sitemap() -> list[str]:
    urls: list[str] = []
    for candidat in ("/sitemap_index.xml", "/wp-sitemap.xml", "/sitemap.xml"):
        try:
            contenu = telecharger(SITE + candidat)
        except Exception:
            continue
        trouvees = re.findall(r"<loc>\s*([^<]+?)\s*</loc>", contenu)
        if not trouvees:
            continue
        for loc in trouvees:
            if loc.endswith(".xml"):
                try:
                    urls += re.findall(r"<loc>\s*([^<]+?)\s*</loc>", telecharger(loc))
                except Exception:
                    pass
            else:
                urls.append(loc)
        break
    return sorted({u for u in urls if not u.endswith(".xml") and "/wp-content/" not in u})


def mode_crawl() -> None:
    urls = urls_du_sitemap()
    if not urls:
        print("Aucune URL trouvée : le domaine est-il accessible depuis cet environnement ?")
        sys.exit(1)
    print(f"{len(urls)} URLs dans le sitemap")
    inventaire = []
    for url in urls:
        try:
            page = telecharger(url)
            titre = extraire(page, r"<title[^>]*>(.*?)</title>") or extraire(page, r"<h1[^>]*>(.*?)</h1>")
            titre = re.sub(r"\s*[-|–].*?Taxe sur les Salaires.*$", "", titre).strip()
            description = extraire(page, r'<meta\s+name="description"\s+content="([^"]*)"')
            corps = html_vers_markdown(extraire_contenu(page))
            statut = "ok" if corps else "contenu introuvable"
            if corps:
                sauver_page(url, titre, description, corps)
            print(f"  [{statut}] {url}")
        except Exception as erreur:
            statut, titre = f"erreur: {erreur}", ""
            print(f"  [erreur] {url} : {erreur}")
        inventaire.append({"url": url, "titre": titre, "statut": statut})
    finaliser(inventaire)


# ---------------------------------------------------------------- mode wxr (export WordPress)
def mode_wxr(fichier: str) -> None:
    espaces = {
        "content": "http://purl.org/rss/1.0/modules/content/",
        "wp": "http://wordpress.org/export/1.2/",
        "excerpt": "http://wordpress.org/export/1.2/excerpt/",
    }
    arbre = ET.parse(fichier)
    inventaire = []
    for element in arbre.iter("item"):
        type_contenu = element.findtext("wp:post_type", "", espaces)
        statut_wp = element.findtext("wp:status", "", espaces)
        if type_contenu not in ("post", "page") or statut_wp != "publish":
            continue
        url = element.findtext("link", "").strip()
        titre = (element.findtext("title") or "").strip()
        description = (element.findtext("excerpt:encoded", "", espaces) or "").strip()
        brut = element.findtext("content:encoded", "", espaces) or ""
        corps = html_vers_markdown(brut)
        if corps:
            sauver_page(url, titre, re.sub("<[^>]+>", "", description), corps)
        inventaire.append({"url": url, "titre": titre, "statut": "ok" if corps else "vide"})
        print(f"  [{inventaire[-1]['statut']}] {url}")
    finaliser(inventaire)


# ---------------------------------------------------------------- sorties communes
def finaliser(inventaire: list[dict]) -> None:
    RACINE.mkdir(parents=True, exist_ok=True)
    with open(RACINE / "inventaire.csv", "w", newline="", encoding="utf-8") as flux:
        champs = csv.DictWriter(flux, fieldnames=["url", "titre", "statut"])
        champs.writeheader()
        champs.writerows(inventaire)

    connues = {
        "holdings-tva", "la-tva-des-etablissements-financiers", "tva-des-assureurs-et-des-mutuelles",
        "tva-immobiliere", "contentieux-tva", "taxe-salaires-holdings",
    }
    lignes = []
    for entree in inventaire:
        chemin = entree["url"].replace(SITE, "").strip("/")
        premier_segment = chemin.split("/")[0] if chemin else ""
        if not chemin:
            continue
        if premier_segment in connues and premier_segment == chemin:
            cible = f"/{chemin}/  (déjà repris à l'identique — aucune redirection nécessaire)"
        elif premier_segment in connues:
            cible = f"/{premier_segment}/  (sous-page à réintégrer ou à recréer — À ARBITRER)"
        else:
            cible = "/secteurs/  (rubrique disparue — cible à ARBITRER)"
        lignes.append(f"/{chemin}/ -> {cible}")
    (RACINE / "redirections.txt").write_text("\n".join(lignes) + "\n", encoding="utf-8")
    print(f"\nÉcrit : {RACINE}/inventaire.csv, redirections.txt et {len(list(RACINE.glob('*.md')))} pages .md")


if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] == "crawl":
        mode_crawl()
    elif len(sys.argv) >= 3 and sys.argv[1] == "wxr":
        mode_wxr(sys.argv[2])
    else:
        print(__doc__)
        sys.exit(1)
