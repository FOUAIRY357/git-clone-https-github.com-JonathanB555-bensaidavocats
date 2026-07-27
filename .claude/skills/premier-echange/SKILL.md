---
name: premier-echange
description: >
  Rédige la réponse à un prospect qui vient d'écrire au cabinet et propose un premier échange
  court d'environ 10 min (téléphone ou visio). Le mail confirme que le dossier est dans notre
  champ, montre en quelques phrases précises qu'on maîtrise la question posée, puis propose un
  call de qualification avant tout RDV de cadrage facturé. Phrases courtes et simples d'avocat,
  signé Me François Ouairy. Livré via le module copier-coller 3 blocs (destinataire / objet /
  message). Déclencher quand l'utilisateur veut répondre à un premier mail de prospect, proposer
  un "premier échange", un "premier contact", "rappeler" un prospect, ou tape "/premier-echange".
  S'enchaîne juste après le skill fiche-prospect.
---

# Premier échange - réponse au prospect + call de 10 min

## Ce qu'est ce premier échange
Un **court appel d'environ 10 min**, gratuit, de qualification. C'est l'étape qui précède le
**RDV de cadrage stratégique** (2 400 € HT, cf skill [[rdv-cadrage]]). Le mail qui propose ce call
a trois buts, dans cet ordre :
1. confirmer que la demande est **dans notre champ** ;
2. montrer en **2 ou 3 phrases précises** qu'on a saisi le point technique ;
3. proposer le **call de 10 min** pour expliquer comment on travaillerait et les honoraires.

Le mail est signé **Me François Ouairy**, à la première personne : c'est l'avocat qui accroche
le prospect, pas le secrétariat.

## Règles d'or
- **Phrases courtes et simples.** Une idée par phrase. Ton d'avocat : sobre, précis, sûr de lui.
  8 à 14 lignes maximum. Pas de jargon inutile, mais les bons termes techniques.
- **Répondre dans la langue du prospect.** Si le mail reçu est en anglais, répondre en anglais ;
  en espagnol, en espagnol. Défaut : français.
- **Montrer la maîtrise SANS faire la consultation gratuite.** On nomme les bons leviers
  (convention fiscale applicable, notion de résidence, articles ou mécanismes pertinents) et on
  formule le vrai enjeu, mais on **ne livre pas la réponse** et **on ne chiffre rien** : c'est
  l'objet du call puis du RDV de cadrage.
- **Ne jamais envoyer le mail.** On prépare le texte, François relit et envoie lui-même.
  cf mémoire [[envoi-mails-clients]].
- **Livrer le mail via le module copier-coller 3 blocs** (voir section dédiée plus bas).
- Pas de tiret cadratin / demi-cadratin ni de marqueur de style IA. cf [[no-ai-style-markers]].
- **Raisonner dans le fuseau horaire du prospect** pour proposer des créneaux ; indiquer l'heure
  dans les deux fuseaux (prospect + Paris).

## Phase 0 - Contexte (juste après fiche-prospect)
1. Ce skill **s'enchaîne après `fiche-prospect`**. Récupérer la fiche et le dossier :
   mémoire `~/.claude/projects/<projet>/memory/dossier-<nom>.md` et/ou dossier perso
   `~/Desktop/Dossiers prospects/<Nom>/`.
2. **Si aucune fiche n'existe, lancer d'abord `fiche-prospect`.** On ne répond pas à un prospect
   sans l'avoir a minima situé.
3. Identifier : le prospect (nom, email, **langue du message**), la ou les questions précises,
   l'objet fiscal / juridique, le fuseau horaire.

## Phase 1 - Cerner la demande et verrouiller la maîtrise
1. Extraire la ou les **questions précises** du prospect. Reformuler l'enjeu en une phrase.
2. Charger le **skill métier adapté** (`fiscaliste`, `notaire`, `comptable`) et, si besoin de
   références sûres, les outils Légifrance / Judilibre du MCP, pour identifier les bons leviers :
   convention fiscale applicable et son millésime, articles pertinents, mécanisme d'élimination
   des doubles impositions, notion de résidence fiscale, etc. **Objectif : écrire 2 ou 3 phrases
   justes, pas un mémo.** Vérifier les références avant de les citer.
3. Lister brièvement les **prestations concernées** qui relèvent bien du cabinet (ex. simulation
   de charge fiscale, déclarations, conseil immobilier, structuration), pour la phrase « c'est
   dans notre champ ».

## Phase 2 - Rédiger le mail (Me Ouairy, première personne)
Structure, en phrases courtes :
1. **Salutation** adaptée à la langue et au registre.
2. **Oui, c'est dans notre champ** : nommer les domaines concernés (fiscalité internationale /
   expatriation / immobilier) en une phrase.
3. **2 ou 3 phrases de maîtrise** : nommer la convention applicable et son millésime, la notion
   clé et le vrai point à trancher, sans livrer la réponse ni chiffrer.
4. **Proposer le call de 10 min** (téléphone ou visio) pour cadrer la mission, la méthode et les
   honoraires. Présenter ce call comme une première étape, pas comme la consultation.
5. **Créneaux** : proposer 2 ou 3 créneaux (heure prospect + Paris) ou demander ses
   disponibilités.
6. **Signature Me François Ouairy** + coordonnées cabinet.

Garde-fous :
- Ne pas trancher la question de fond ni donner de chiffre dans le mail.
- Rester bref. La densité de fond va au call puis au RDV de cadrage.

## Phase 3 - Planifier le call de 10 min
1. Lire les disponibilités de François (Outlook `outlook_find_available_time` ou
   `outlook_calendar_search`) sur les prochains jours, créneaux de **15 min**.
2. Si François veut valider les créneaux avant, lui soumettre la liste d'abord ; sinon proposer
   directement 2 ou 3 créneaux dans le mail.
3. Une fois le créneau choisi par le prospect, créer l'événement **Google Agenda**
   (`create_event`), 10 à 15 min :
   - `summary` : "Premier échange - <Prospect> / BENSAID AVOCATS" ;
   - `startTime` / `endTime` + `timeZone` (caler sur Paris, l'invitation convertit) ;
   - `attendees` : email du prospect + françois.ouairy@bensaid-avocats.fr ;
   - **si visio** : `addGoogleMeetUrl: true`, récupérer le lien Meet ;
   - `description` : rappel de l'objet.
4. Préparer le **mail de confirmation** (même module 3 blocs) avec l'heure (prospect + Paris) et
   le lien Meet ou le numéro d'appel.

## Module copier-coller (3 blocs) - CONVENTION MAILS DU CABINET
Tout mail livré dans le chat l'est en **trois blocs de code distincts** (chaque bloc a son propre
bouton « copier »), pour que François copie séparément l'adresse, l'objet et le corps :
- **bloc 1** : l'adresse du destinataire, seule ;
- **bloc 2** : l'objet, seul ;
- **bloc 3** : le corps du message, seul, en **texte brut** (pas de markdown), signature comprise.

Rendu attendu dans le chat :

**Destinataire**
```
prospect@example.com
```
**Objet**
```
Votre projet d'installation en France
```
**Message**
```
Bonjour ...,

...

Bien à vous,
François Ouairy
Avocat - BENSAID AVOCATS
49 rue de Courcelles, 75008 Paris
françois.ouairy@bensaid-avocats.fr
```

Cette convention **s'applique à tous les mails produits par les skills du cabinet** (cf
[[rdv-cadrage]]). Sur poste macOS on peut, en plus, sauvegarder le texte en `.txt` dans le dossier
perso ; mais le module 3 blocs dans le chat reste la **livraison par défaut**.

## Phase 4 - Persistance et suite
- Classer le mail et les créneaux dans le dossier perso / la fiche mémoire du dossier.
- Mettre à jour le statut : « premier échange proposé » puis « call fixé ».
- **Next step naturel** : si le prospect confirme son intérêt au call, enchaîner sur le skill
  `rdv-cadrage` (RDV de cadrage stratégique à 2 400 € HT).

## Données de référence (cabinet)
- **Call de premier échange** : environ 10 min, gratuit, qualification avant le RDV de cadrage.
- **RDV de cadrage** : 2 400 € HT (cf [[rdv-cadrage]]).
- **Cabinet Paris** : 49 rue de Courcelles, 75008 Paris, 1er étage, code porte 2079.
- **Email François** : françois.ouairy@bensaid-avocats.fr.
- **Visio** : lien Google Meet généré via Google Agenda (`addGoogleMeetUrl`).

## Exemple d'usage
Prospect anglophone (couple hispano-américain, revenus de retraite US 401(k)/RMD, projet
d'installation en France) : la fiche-prospect a situé le couple, puis premier-echange rédige une
réponse **en anglais**, confirme le champ (fiscalité internationale + immobilier), montre la
maîtrise en nommant la **convention fiscale franco-américaine** et le point à trancher (traitement
des distributions de plans de retraite US et mécanisme d'élimination de la double imposition, au
regard de la résidence), **sans chiffrer**, puis propose un call de 10 min avec 2 ou 3 créneaux
(heure prospect + Paris). Livraison en 3 blocs.
