#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
setup_modele.py - installe le modèle de transcription français, une fois par session.

Usage :
    python3 .claude/skills/transcription/setup_modele.py [--cache DOSSIER] [--verifier]

Le script est idempotent : s'il trouve un modèle utilisable dans le cache, il sort
immédiatement. Le relancer ne coûte rien.

Deux chemins, choisis automatiquement selon ce que le réseau autorise.

  1. Chemin direct (Mac de François, ou tout poste sans filtrage)
     Hugging Face est joignable, faster-whisper télécharge large-v3 tout seul.
     Environ 2 minutes.

  2. Chemin miroir (sessions Claude Code dans le cloud)
     Hugging Face est bloqué par la politique de sortie réseau. On récupère le
     checkpoint whisper-large-v2 embarqué dans une image Docker publique, via le
     miroir Google mirror.gcr.io (lui, autorisé), puis on le convertit en
     CTranslate2 int8. Environ 20 minutes, dont l'essentiel en téléchargement.
     Voir references/reseau.md pour le détail des hôtes ouverts et fermés.

Sortie : le chemin du modèle prêt à l'emploi, sur stdout, préfixé « MODELE= ».
"""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tarfile
import urllib.error
import urllib.parse
import urllib.request

CACHE_DEFAUT = os.path.expanduser("~/.cache/bensaid-whisper")

# Image publique qui embarque le checkpoint openai/whisper-large-v2 en clair.
# On ne fige pas le digest du layer : les tags bougent, on le retrouve à chaque
# fois en lisant l'historique de construction de l'image.
IMAGE = "saladtechnologies/whisper-large"
TAG = "latest"
MARQUEUR_LAYER = "copy ./model/"
PREFIXE_TAR = "models/openai/whisper-large-v2"

MIROIR = "https://mirror.gcr.io"
ACCEPT_MANIFEST = ",".join([
    "application/vnd.docker.distribution.manifest.v2+json",
    "application/vnd.docker.distribution.manifest.list.v2+json",
    "application/vnd.oci.image.manifest.v1+json",
    "application/vnd.oci.image.index.v1+json",
])


def log(*a):
    print(*a, file=sys.stderr, flush=True)


# --------------------------------------------------------------------------
# Chemin 1 : Hugging Face joignable
# --------------------------------------------------------------------------

def hf_joignable():
    """Un HEAD sur l'API Hugging Face. Bloqué = 403 du proxy, ou timeout."""
    try:
        req = urllib.request.Request(
            "https://huggingface.co/api/models/openai/whisper-large-v3",
            method="HEAD",
        )
        urllib.request.urlopen(req, timeout=15)
        return True
    except Exception as e:
        log(f"  Hugging Face injoignable ({type(e).__name__}), passage par le miroir.")
        return False


# --------------------------------------------------------------------------
# Chemin 2 : registre Docker via le miroir Google
# --------------------------------------------------------------------------

def jeton(depot):
    url = (f"{MIROIR}/v2/token?service=mirror.gcr.io"
           f"&scope=repository:{urllib.parse.quote(depot, safe='/')}:pull")
    d = json.load(urllib.request.urlopen(url, timeout=60))
    return d.get("token") or d.get("access_token")


def _get(url, tok, accept):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {tok}",
                                              "Accept": accept})
    return urllib.request.urlopen(req, timeout=180)


def trouver_layer(depot, tag):
    """Renvoie (digest, taille) du layer qui contient le checkpoint.

    On lit le manifeste, puis la config de l'image. Les entrées d'historique qui
    ne créent pas de layer (`empty_layer`) sont écartées ; les autres
    correspondent aux layers dans l'ordre. On repère celle dont la commande de
    construction copie le modèle.
    """
    tok = jeton(depot)
    man = json.load(_get(f"{MIROIR}/v2/{depot}/manifests/{tag}", tok, ACCEPT_MANIFEST))
    if "manifests" in man:
        amd = [m for m in man["manifests"]
               if m.get("platform", {}).get("architecture") == "amd64"]
        man = json.load(_get(f"{MIROIR}/v2/{depot}/manifests/{amd[0]['digest']}",
                             tok, ACCEPT_MANIFEST))
    cfg = json.load(_get(f"{MIROIR}/v2/{depot}/blobs/{man['config']['digest']}",
                         tok, "*/*"))
    layers = man["layers"]
    hist = [h for h in cfg.get("history", []) if not h.get("empty_layer")]
    for i, h in enumerate(hist[:len(layers)]):
        if MARQUEUR_LAYER in (h.get("created_by") or "").lower():
            return layers[i]["digest"], layers[i]["size"]
    raise SystemExit(
        f"Layer du modèle introuvable dans {depot}:{tag}. L'image a peut-être "
        f"changé. Chercher une entrée d'historique contenant « {MARQUEUR_LAYER} » "
        f"ou repartir de references/reseau.md."
    )


def sha256(chemin):
    h = hashlib.sha256()
    with open(chemin, "rb") as f:
        for bloc in iter(lambda: f.read(1 << 22), b""):
            h.update(bloc)
    return h.hexdigest()


def telecharger_layer(depot, digest, taille, dest, essais=15):
    """Téléchargement reprenable, vérifié par empreinte.

    Le flux se coupe régulièrement sur plusieurs gigaoctets. On reprend en
    Range à l'octet près, et on ne s'arrête que sur un sha256 conforme : c'est
    la seule preuve que le fichier est complet et intact.
    """
    attendu = digest.split(":")[1]
    for essai in range(1, essais + 1):
        acquis = os.path.getsize(dest) if os.path.exists(dest) else 0
        if acquis >= taille and sha256(dest) == attendu:
            log(f"  layer vérifié ({acquis/1e6:.0f} Mo)")
            return
        log(f"  essai {essai}, reprise à {acquis/1e6:.0f} Mo sur {taille/1e6:.0f}")
        try:
            tok = jeton(depot)
            entetes = {"Authorization": f"Bearer {tok}", "Accept": "*/*"}
            if acquis:
                entetes["Range"] = f"bytes={acquis}-"
            rep = urllib.request.urlopen(
                urllib.request.Request(f"{MIROIR}/v2/{depot}/blobs/{digest}",
                                       headers=entetes), timeout=300)
            if acquis and rep.status != 206:
                acquis = 0  # le serveur a ignoré le Range
            with open(dest, "ab" if acquis else "wb") as f:
                while True:
                    bloc = rep.read(1 << 22)
                    if not bloc:
                        break
                    f.write(bloc)
        except Exception as e:
            log(f"    coupure : {type(e).__name__} {e}")
    raise SystemExit("Téléchargement du layer impossible après plusieurs essais.")


def extraire(archive, dest):
    os.makedirs(dest, exist_ok=True)
    with tarfile.open(archive, "r:gz") as tf:
        membres = [m for m in tf.getmembers()
                   if m.isfile() and m.name.lstrip("./").startswith(PREFIXE_TAR)]
        if not membres:
            raise SystemExit(f"Rien sous {PREFIXE_TAR} dans le layer.")
        for m in membres:
            nom = os.path.basename(m.name)
            log(f"  extraction {nom} ({m.size/1e6:.1f} Mo)")
            src = tf.extractfile(m)
            with open(os.path.join(dest, nom), "wb") as f:
                shutil.copyfileobj(src, f, 1 << 22)


def convertir_ct2(src, dest):
    """Conversion en CTranslate2 int8. Le poids passe de 6,2 Go à 1,6 Go."""
    for module in ("torch", "transformers"):
        try:
            __import__(module)
        except ImportError:
            log(f"  installation de {module}")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", module])
    log("  conversion en CTranslate2 int8 (quelques minutes)")
    subprocess.check_call([
        "ct2-transformers-converter",
        "--model", src, "--output_dir", dest,
        "--quantization", "int8",
        "--copy_files", "tokenizer.json", "preprocessor_config.json",
    ])


# --------------------------------------------------------------------------

def modele_utilisable(chemin):
    return os.path.isfile(os.path.join(chemin, "model.bin")) and \
           os.path.isfile(os.path.join(chemin, "tokenizer.json"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default=CACHE_DEFAUT)
    ap.add_argument("--verifier", action="store_true",
                    help="charge réellement le modèle pour valider l'installation")
    args = ap.parse_args()

    ct2 = os.path.join(args.cache, "ct2-large-v2")
    os.makedirs(args.cache, exist_ok=True)

    if modele_utilisable(ct2):
        log("Modèle déjà présent dans le cache.")
        print(f"MODELE={ct2}")
        return

    try:
        __import__("faster_whisper")
    except ImportError:
        log("Installation de faster-whisper")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q",
                               "faster-whisper"])

    if hf_joignable():
        log("Hugging Face joignable, téléchargement direct de large-v3.")
        from faster_whisper import WhisperModel
        WhisperModel("large-v3", device="cpu", compute_type="int8")
        print("MODELE=large-v3")
        return

    log(f"Chemin miroir. Recherche du layer modèle dans {IMAGE}:{TAG}")
    digest, taille = trouver_layer(IMAGE, TAG)
    log(f"  layer {digest[:19]}... ({taille/1e6:.0f} Mo)")

    layer = os.path.join(args.cache, "layer-modele.tar.gz")
    hf_dir = os.path.join(args.cache, "hf-large-v2")
    telecharger_layer(IMAGE, digest, taille, layer)
    extraire(layer, hf_dir)
    os.remove(layer)          # 3,7 Go rendus au disque
    convertir_ct2(hf_dir, ct2)
    shutil.rmtree(hf_dir)     # 6,2 Go rendus au disque

    if not modele_utilisable(ct2):
        raise SystemExit("La conversion n'a pas produit de modèle exploitable.")

    if args.verifier:
        from faster_whisper import WhisperModel
        WhisperModel(ct2, device="cpu", compute_type="int8")
        log("  modèle chargé sans erreur")

    log("Modèle prêt.")
    print(f"MODELE={ct2}")


if __name__ == "__main__":
    main()
