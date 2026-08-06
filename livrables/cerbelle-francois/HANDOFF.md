# HANDOFF — reprise en local (dossier François Cerbelle)

> Interne BENSAID AVOCATS. Note de passation pour continuer la session en local.
> Dernière mise à jour : 05/08/2026.

## Pourquoi ce transfert

La transcription de l'appel est **bloquée dans la session cloud** : faster-whisper
s'installe, mais le téléchargement du modèle passe par `huggingface.co`, refusé par la
politique d'egress (403 au proxy). Consigne de l'environnement : ne pas contourner, signaler.
**En local, l'accès à HuggingFace est libre** : on transcrit, on analyse, puis on envoie la
demande de pièces (déjà rédigée).

## À faire en local, dans l'ordre

1. **Synchroniser la branche** :
   `git fetch origin && git checkout claude/prospect-fiche-premier-mail-9mtcke && git pull`
2. **Placer l'enregistrement** de l'appel en local (fichier d'origine, WAV mono 8 kHz,
   ~18 min) : `2bb04b66-OUAIRY_Francois_1010603015512_20260805145634490.wav`.
   **Ne pas le committer** (donnée client sensible, binaire). Le garder hors du dépôt.
3. **Transcrire** :
   `pip install faster-whisper numpy`
   `python3 livrables/cerbelle-francois/transcribe.py <chemin-du-wav> medium`
   Sortie : `<wav>.transcript.txt` (horodatée). Passer à `large-v3` si besoin de finesse.
4. **Me relancer** : « analyse l'appel à partir de ce transcript », en pointant le fichier
   `.transcript.txt`. Sortie attendue : ce qui a été dit, ce qui est confirmé/infirmé vs la
   fiche, les points à creuser, et l'ajustement éventuel de la demande de pièces.
5. **Envoyer la demande de pièces** (voir `mails.md`, bloc 3) : prête, indépendante de
   l'appel ; à ajuster seulement si l'appel a fait ressortir un point précis.

## État du dossier (rappel express)

Salarié FR (contrat rattaché UK) d'une startup US non cotée (~2 Md$, ~1 200 pers.), 9 ans.
Options 10 000 à 1,1 $ (expirent dans ~8 mois) + 2 500 à 9 $ (2031) + 750 RSU partielles.
FMV 13-15 $. Rien exercé. Sortie (rachat ou IPO) sous quelques mois. 130 K€ salaire + 6 K€
fonciers, foyer mono-revenu. Projet immo ~250 K€ locatif saisonnier ; démembrement en cours
avec sa mère. Conformité PPE/sanctions : RAS. Identité RCS non confirmée (seul homonyme =
SCI en Sarthe, profil qui ne colle pas).

## Séquence commerciale

Call 10 min (fait, 16h46 le 05/08, objectif : vendre une consultation) → **demande de pièces**
(mail prêt) → **devis** (après réception des pièces). Pas de RDV de cadrage à 2 400 € ni de
lettre de mission à ce stade.

## Livrables déjà produits (livrables/cerbelle-francois/)

- `fiche.md` — fiche prospect complète (analyse, poids financier, verdict).
- `fiche-call.md` — brief du call 10 min (accroches, questions, objections, close).
- `fiche-rdv-cadrage.md` — déroulé de fond (sert désormais de plan de la consultation).
- `mails.md` — e-mails rédigés (premier contact, confirmation, demande de pièces).
- `transcribe.py` — script de transcription local.
- `HANDOFF.md` — le présent document.

## Points à confirmer (dossier, à recouper avec l'appel transcrit)

- Plan qualifiant au sens français ou non (surtout les RSU) ? → lecture des grants.
- Jours travaillés hors de France sur la période d'acquisition (répartition FR/UK/US).
- Situation familiale (pèse sur CEHR, protection du conjoint, succession).
- Trésorerie disponible pour lever le lot 1 (~33 500 $) + l'impôt « sec ».
- Calendrier et prix de la sortie ; existence d'un programme de liquidité.

## Aide-mémoire technique (vérifié Légifrance au 05/08/2026)

CGI 80 bis (gain de levée), 80 quaterdecies (gain d'acquisition RSU), 163-0 A (quotient
revenus exceptionnels), 150-0 A (plus-value de cession). Plan non qualifiant → traitements et
salaires de droit commun + CSG/CRDS 9,7 % ; plus-value ultérieure au PFU 30 %. Barème 41 %
(84 577-181 917 €) puis 45 %. CEHR 3 % dès 250 K€ (seul) / 500 K€ (couple), 4 % au-delà.
Enjeu latent ~150 000 $ (~135 K€) au FMV, davantage à la sortie.

## Git

Branche : `claude/prospect-fiche-premier-mail-9mtcke` (poussée sur origin). Tout est committé
sauf l'audio (volontairement hors dépôt).
