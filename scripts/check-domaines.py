#!/usr/bin/env python3
"""Disponibilité de noms de domaine, établie par délégation DNS.

Pourquoi ce script existe
-------------------------
Les services whois et RDAP, qui sont la source normale pour savoir si un nom de
domaine est enregistré, sont bloqués par la politique réseau des environnements
cloud du cabinet. Reste une voie indirecte : demander à un résolveur récursif si
le nom est *délégué*, c'est-à-dire s'il existe des serveurs de noms pour lui dans
la zone de son TLD.

Méthode
-------
Pour chaque domaine, trois types d'enregistrement sont interrogés — NS, SOA et A
— avec trois essais chacun, et le code de retour DNS est lu :

    NXDOMAIN   le nom n'existe pas dans la zone du TLD        -> libre
    NOERROR    le nom est délégué et répond                   -> pris
    SERVFAIL   le nom existe probablement mais ses serveurs
               de noms ne répondent plus                      -> pris, dormant

Un SERVFAIL est réinterrogé avec le bit CD (Checking Disabled) armé, ce qui
écarte la validation DNSSEC. Si le SERVFAIL persiste, ce n'est pas un échec de
validation : ce sont les serveurs de noms qui sont hors service.

Calibrage
---------
La méthode ne vaut que si le résolveur se comporte comme attendu. Le script se
calibre donc avant tout verdict, sur quatre témoins : deux domaines connus pour
être délégués, qui doivent ressortir PRIS, et deux noms tirés au hasard, qui
doivent ressortir LIBRE. **Si le calibrage échoue, le script refuse de rendre un
verdict et sort en erreur**, plutôt que de produire un résultat faussement
rassurant.

Limite à connaître
------------------
Un domaine peut être enregistré sans être délégué — cas des réservations
purement défensives, qui n'ont aucun serveur de noms. Un tel domaine répond
NXDOMAIN et serait donc compté à tort comme libre. La mention « libre » est donc
*très probable, pas certaine*. La confirmation définitive prend trente secondes
chez un registrar au moment de la réservation ; c'est ce test-là qui fait foi.

L'interrogation directe des serveurs de TLD, qui lèverait cette limite, n'est pas
possible : le réseau n'autorise que les requêtes vers le résolveur récursif
configuré.

Usage
-----
    python3 scripts/check-domaines.py                      # liste par défaut
    python3 scripts/check-domaines.py exemple.fr autre.com  # domaines donnés
    python3 scripts/check-domaines.py --fichier domaines.txt
    python3 scripts/check-domaines.py --json
    python3 scripts/check-domaines.py --resolveur 1.1.1.1

Aucune dépendance : bibliothèque standard seulement.
"""

from __future__ import annotations

import argparse
import json
import random
import re
import secrets
import socket
import struct
import sys

# --- Constantes DNS -------------------------------------------------------

QTYPES = {"NS": 2, "SOA": 6, "A": 1}

RCODE_NOERROR = 0
RCODE_SERVFAIL = 2
RCODE_NXDOMAIN = 3

RCODE_NOMS = {
    0: "NOERROR",
    1: "FORMERR",
    2: "SERVFAIL",
    3: "NXDOMAIN",
    4: "NOTIMP",
    5: "REFUSED",
}

# Verdicts
LIBRE = "LIBRE"
PRIS = "PRIS"
DORMANT = "DORMANT"
INDETERMINE = "INDÉTERMINÉ"

ESSAIS = 3
TIMEOUT = 3.0

# Liste par défaut : dossier de reprise de la marque LA VIE FINANCIÈRE.
DOMAINES_DEFAUT = [
    "laviefinanciere.fr",
    "lavie-financiere.fr",
    "lavie-financiere.com",
    "laviefinanciere.com",
    "laviefinanciere.net",
    "laviefinanciere.eu",
    "viefinanciere.fr",
    "viefinanciere.com",
    "laviefrancaise.fr",
    "laviefrancaise.com",
    "lesetoilesdelassurancevie.fr",
    "lesetoilesdelassurancevie.com",
    "lesetoilesdupatrimoine.fr",
    "lesetoilesdupatrimoine.com",
    "etoilesdupatrimoine.fr",
    "etoiles-assurance-vie.fr",
]

# Témoins de calibrage : délégués d'un côté, inexistants de l'autre.
TEMOINS_DELEGUES = ["bensaid-avocats.fr", "google.com"]


# --- Couche DNS -----------------------------------------------------------


def encode_nom(domaine: str) -> bytes:
    """Encode un nom de domaine au format DNS (labels préfixés de leur longueur)."""
    parties = []
    for label in domaine.rstrip(".").split("."):
        if not label:
            raise ValueError(f"label vide dans « {domaine} »")
        octets = label.encode("idna") if not label.isascii() else label.encode("ascii")
        if len(octets) > 63:
            raise ValueError(f"label trop long dans « {domaine} »")
        parties.append(bytes([len(octets)]) + octets)
    return b"".join(parties) + b"\x00"


def construire_requete(domaine: str, qtype: int, cd: bool = False) -> tuple[int, bytes]:
    """Construit un paquet de requête DNS. Renvoie (identifiant, paquet)."""
    ident = secrets.randbelow(0xFFFF) if hasattr(secrets, "randbelow") else random.getrandbits(16)
    # Octet de flags haut : QR=0, Opcode=0, AA=0, TC=0, RD=1 -> 0x01
    # Octet de flags bas  : RA=0, Z=0, AD=0, CD=? , RCODE=0 -> 0x10 si CD armé
    flags_bas = 0x10 if cd else 0x00
    entete = struct.pack(">HBBHHHH", ident, 0x01, flags_bas, 1, 0, 0, 0)
    question = encode_nom(domaine) + struct.pack(">HH", qtype, 1)  # classe IN
    return ident, entete + question


def interroger(
    resolveur: str, domaine: str, qtype: int, cd: bool = False, timeout: float = TIMEOUT
) -> dict | None:
    """Envoie une requête DNS. Renvoie l'en-tête lu, ou None si pas de réponse."""
    ident, paquet = construire_requete(domaine, qtype, cd=cd)
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(timeout)
        try:
            sock.sendto(paquet, (resolveur, 53))
            while True:
                reponse, _ = sock.recvfrom(4096)
                if len(reponse) < 12:
                    continue
                r_ident, f_haut, f_bas, _qd, an, ns, ar = struct.unpack(
                    ">HBBHHHH", reponse[:12]
                )
                if r_ident != ident or not (f_haut & 0x80):
                    continue  # réponse qui ne correspond pas à notre requête
                return {
                    "rcode": f_bas & 0x0F,
                    "reponses": an,
                    "autorite": ns,
                    "additionnel": ar,
                    "tronquee": bool(f_haut & 0x02),
                }
        except (socket.timeout, OSError):
            return None


# --- Sondage et verdict ---------------------------------------------------


def sonder(resolveur: str, domaine: str) -> dict:
    """Interroge NS, SOA et A, trois essais chacun, et en tire un verdict."""
    releve: dict[str, list[str]] = {}
    for nom_qtype, qtype in QTYPES.items():
        codes = []
        for _ in range(ESSAIS):
            entete = interroger(resolveur, domaine, qtype)
            if entete is None:
                codes.append("TIMEOUT")
            else:
                rcode = entete["rcode"]
                nom = RCODE_NOMS.get(rcode, f"RCODE{rcode}")
                if rcode == RCODE_NOERROR and entete["reponses"] == 0 and entete["autorite"] == 0:
                    nom = "NOERROR_VIDE"
                codes.append(nom)
        releve[nom_qtype] = codes

    tous = [code for codes in releve.values() for code in codes]
    verdict, detail = juger(tous)

    # Un SERVFAIL constant se réinterroge avec le bit CD armé : si le SERVFAIL
    # persiste, ce n'est pas la validation DNSSEC qui échoue, ce sont les
    # serveurs de noms du domaine qui sont hors service.
    cd_teste = None
    if verdict == DORMANT:
        codes_cd = []
        for nom_qtype, qtype in QTYPES.items():
            entete = interroger(resolveur, domaine, qtype, cd=True)
            codes_cd.append(
                RCODE_NOMS.get(entete["rcode"], "?") if entete else "TIMEOUT"
            )
        cd_teste = codes_cd
        if not all(code == "SERVFAIL" for code in codes_cd):
            verdict, detail = INDETERMINE, (
                "SERVFAIL sans le bit CD, autre chose avec : échec de validation "
                "DNSSEC probable, à vérifier à la main"
            )

    return {
        "domaine": domaine,
        "verdict": verdict,
        "detail": detail,
        "releve": releve,
        "releve_cd": cd_teste,
    }


def juger(codes: list[str]) -> tuple[str, str]:
    """Tire un verdict de l'ensemble des codes de retour observés."""
    if all(code == "NXDOMAIN" for code in codes):
        return LIBRE, "aucun enregistrement dans la zone du TLD"
    if any(code in ("NOERROR", "NOERROR_VIDE") for code in codes):
        return PRIS, "le nom est délégué et répond"
    if all(code == "SERVFAIL" for code in codes):
        return DORMANT, "serveurs de noms hors service"
    if any(code == "TIMEOUT" for code in codes):
        return INDETERMINE, "le résolveur ne répond pas de façon fiable"
    return INDETERMINE, "codes de retour hétérogènes : " + ", ".join(sorted(set(codes)))


# --- Calibrage ------------------------------------------------------------


def noms_fantaisistes(nombre: int = 2) -> list[str]:
    """Noms tirés au hasard, qui ne doivent exister dans aucun registre."""
    return [f"z{secrets.token_hex(9)}q.com" for _ in range(nombre)]


def calibrer(resolveur: str) -> tuple[bool, list[str]]:
    """Vérifie que le résolveur se comporte comme la méthode le suppose."""
    journal = []
    ok = True

    for temoin in TEMOINS_DELEGUES:
        resultat = sonder(resolveur, temoin)
        attendu = resultat["verdict"] == PRIS
        journal.append(
            f"  {'OK  ' if attendu else 'ÉCHEC'} {temoin} : {resultat['verdict']}"
            f" (attendu {PRIS})"
        )
        ok &= attendu

    for temoin in noms_fantaisistes():
        resultat = sonder(resolveur, temoin)
        attendu = resultat["verdict"] == LIBRE
        journal.append(
            f"  {'OK  ' if attendu else 'ÉCHEC'} {temoin} : {resultat['verdict']}"
            f" (attendu {LIBRE})"
        )
        ok &= attendu

    return ok, journal


# --- Restitution ----------------------------------------------------------

LECTURE = {
    LIBRE: "**Libre**",
    PRIS: "Pris et résolu",
    DORMANT: "**Pris, serveurs de noms hors service**",
    INDETERMINE: "À vérifier à la main",
}


def rendre_markdown(resultats: list[dict]) -> str:
    lignes = [
        "| Domaine | Statut DNS | Lecture |",
        "|---|---|---|",
    ]
    for resultat in resultats:
        codes = {
            code
            for codes in resultat["releve"].values()
            for code in codes
        }
        statut = "/".join(sorted(codes))
        lignes.append(
            f"| `{resultat['domaine']}` | {statut} | {LECTURE[resultat['verdict']]} |"
        )
    return "\n".join(lignes)


def lire_fichier(chemin: str) -> list[str]:
    domaines = []
    with open(chemin, encoding="utf-8") as fichier:
        for ligne in fichier:
            ligne = ligne.split("#", 1)[0].strip()
            if ligne:
                domaines.append(ligne)
    return domaines


MOTIF_DOMAINE = re.compile(r"^(?=.{1,253}$)[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$")


def main() -> int:
    analyseur = argparse.ArgumentParser(
        description="Disponibilité de noms de domaine, par délégation DNS.",
        epilog="Sans argument, la liste du dossier LA VIE FINANCIÈRE est utilisée.",
    )
    analyseur.add_argument("domaines", nargs="*", help="domaines à tester")
    analyseur.add_argument("--fichier", help="fichier de domaines, un par ligne")
    analyseur.add_argument(
        "--resolveur", default=None, help="résolveur à interroger (défaut : /etc/resolv.conf, sinon 8.8.8.8)"
    )
    analyseur.add_argument("--json", action="store_true", help="sortie JSON brute")
    analyseur.add_argument(
        "--sans-calibrage",
        action="store_true",
        help="passer le calibrage — à n'utiliser que pour déboguer le script",
    )
    arguments = analyseur.parse_args()

    resolveur = arguments.resolveur or resolveur_systeme()

    domaines = list(arguments.domaines)
    if arguments.fichier:
        domaines += lire_fichier(arguments.fichier)
    if not domaines:
        domaines = list(DOMAINES_DEFAUT)

    invalides = [d for d in domaines if not MOTIF_DOMAINE.match(d.lower())]
    if invalides:
        print(f"Domaines mal formés : {', '.join(invalides)}", file=sys.stderr)
        return 2

    print(f"Résolveur interrogé : {resolveur}", file=sys.stderr)

    if not arguments.sans_calibrage:
        print("Calibrage sur témoins :", file=sys.stderr)
        ok, journal = calibrer(resolveur)
        for ligne in journal:
            print(ligne, file=sys.stderr)
        if not ok:
            print(
                "\nCALIBRAGE EN ÉCHEC — aucun verdict rendu.\n"
                "Le résolveur ne se comporte pas comme la méthode le suppose : "
                "ses réponses ne permettent pas de conclure sur la disponibilité. "
                "Vérifier l'accès réseau au port 53, ou interroger un autre "
                "résolveur avec --resolveur.",
                file=sys.stderr,
            )
            return 1
        print("Calibrage validé.\n", file=sys.stderr)

    resultats = [sonder(resolveur, domaine.lower()) for domaine in domaines]

    if arguments.json:
        print(json.dumps(resultats, ensure_ascii=False, indent=2))
    else:
        print(rendre_markdown(resultats))
        print()
        print(
            "Rappel : « Libre » signifie non délégué, donc très probablement non "
            "enregistré — mais un domaine réservé sans serveurs de noms répond de "
            "la même façon. Confirmation chez un registrar avant de conclure."
        )

    indetermines = [r for r in resultats if r["verdict"] == INDETERMINE]
    return 3 if indetermines else 0


def resolveur_systeme() -> str:
    """Premier résolveur de /etc/resolv.conf, à défaut 8.8.8.8."""
    try:
        with open("/etc/resolv.conf", encoding="utf-8") as fichier:
            for ligne in fichier:
                if ligne.startswith("nameserver"):
                    parties = ligne.split()
                    if len(parties) > 1:
                        return parties[1]
    except OSError:
        pass
    return "8.8.8.8"


if __name__ == "__main__":
    sys.exit(main())
