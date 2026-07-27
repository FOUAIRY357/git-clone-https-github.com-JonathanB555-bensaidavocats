---
name: premier-echange
description: >
  Rédige la réponse à un prospect qui vient d'écrire au cabinet et propose un premier échange
  court d'environ 10 min, toujours par téléphone. Le mail confirme que le dossier est dans notre
  champ, montre brièvement (une phrase, sans livrer le fond) qu'on maîtrise la question posée,
  puis propose un call de qualification avant tout RDV de cadrage facturé. Phrases courtes et simples d'avocat,
  au nom de Me François Ouairy, sans bloc signature (la signature Outlook s'ajoute à l'envoi).
  Livré via le module copier-coller 3 blocs (destinataire / objet / message). Déclencher quand l'utilisateur veut répondre à un premier mail de prospect, proposer
  un "premier échange", un "premier contact", "rappeler" un prospect, ou tape "/premier-echange".
  S'enchaîne juste après le skill fiche-prospect.
---

# Premier échange - réponse au prospect + call de 10 min

## Ce qu'est ce premier échange
Un **court appel d'environ 10 min**, gratuit, de qualification, **toujours par téléphone** (la
visio et le présentiel sont réservés au RDV de cadrage). C'est l'étape qui précède le
**RDV de cadrage stratégique** (2 400 € HT, cf skill [[rdv-cadrage]]). Le mail qui propose ce call
a trois buts, dans cet ordre :
1. confirmer que la demande est **dans notre champ** ;
2. montrer en **1 ou 2 phrases sobres** qu'on a identifié le point technique (sans le traiter) ;
3. proposer le **call de 10 min** pour expliquer comment on travaillerait et les honoraires.

Le mail reste **court**. On en dit le **moins possible sur le fond** : l'objectif est de donner
confiance, pas de délivrer un début d'analyse.

Le mail part **au nom de Me François Ouairy**, à la première personne : c'est l'avocat qui
accroche le prospect, pas le secrétariat. On **ne retape pas de bloc signature** (nom,
coordonnées) : la signature Outlook de François s'ajoute automatiquement à l'envoi.

## Règles d'or
- **Phrases courtes et simples.** Une idée par phrase. Ton d'avocat : sobre, précis, sûr de lui.
  **6 à 10 lignes maximum.** Un mail court vaut mieux qu'un mail complet.
- **Répondre dans la langue du prospect.** Si le mail reçu est en anglais, répondre en anglais ;
  en espagnol, en espagnol. Défaut : français.
- **Montrer la maîtrise SANS rien livrer du fond.** On nomme **seulement** la convention / le
  régime applicable et le vrai point à trancher, en une phrase. **Pas de numéros d'article, pas
  de description du mécanisme, aucun indice sur l'issue** (même au conditionnel, même « ça peut
  être favorable »). L'analyse et les chiffres sont réservés au call puis au RDV de cadrage.
- **Proposer soi-même les créneaux, ne pas faire choisir François.** Sélectionner directement
  **2 ou 3 créneaux** pertinents (dont un **le jour même** si l'heure le permet encore) et les
  insérer dans le mail. François valide et ajuste le mail complet avant envoi.
- **Pas de bloc signature dans le mail.** Terminer sur une **formule de politesse seule**
  (ex. « Kind regards, » / « Bien à vous, »). La signature Outlook de François (nom, coordonnées)
  s'ajoute automatiquement à l'envoi : ne pas la retaper.
- **Ne jamais envoyer le mail.** On prépare le texte, François relit et envoie lui-même.
  cf mémoire [[envoi-mails-clients]].
- **Livrer le mail via le module copier-coller 3 blocs** (voir section dédiée plus bas).
- Pas de tiret cadratin / demi-cadratin ni de marqueur de style IA. cf [[no-ai-style-markers]].
- **Raisonner dans le fuseau horaire du prospect** pour proposer des créneaux ; indiquer l'heure
  dans les deux fuseaux (prospect + Paris) — sauf même fuseau, où on le précise.

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
3. **1 phrase de maîtrise** : nommer la convention / le régime applicable et le vrai point à
   trancher. Pas de numéros d'article, pas de mécanisme, aucun indice sur l'issue.
4. **Proposer le call téléphonique de 10 min** pour cadrer la mission, la méthode et les
   honoraires. Présenter ce call comme une première étape, pas comme la consultation. Préciser
   qu'on **appellera** le prospect et lui demander le **meilleur numéro** pour le joindre.
5. **Créneaux** : insérer **2-3 créneaux** choisis par Claude (heure prospect + Paris).
6. **Formule de politesse seule** (ex. « Kind regards, »). Pas de bloc signature : la signature
   Outlook s'ajoute automatiquement.

Garde-fous :
- Ne pas trancher la question de fond ni donner de chiffre dans le mail.
- Rester bref. La densité de fond va au call puis au RDV de cadrage.

## Phase 3 - Planifier le call de 10 min
1. Lire les disponibilités de François (Outlook `outlook_find_available_time` ou
   `outlook_calendar_search`) sur les prochains jours, créneaux de **15 min**.
2. **Choisir soi-même 2 ou 3 créneaux** pertinents (dont un du jour même si l'heure le permet), en
   heure prospect + Paris, et les insérer directement dans le mail. François valide/ajuste le mail
   complet avant envoi ; ne pas lui faire choisir dans une liste.
3. Une fois le créneau choisi par le prospect, créer l'événement **Google Agenda**
   (`create_event`), 10 à 15 min :
   - `summary` : "Premier échange - <Prospect> / BENSAID AVOCATS" ;
   - `startTime` / `endTime` + `timeZone` (caler sur Paris, l'invitation convertit) ;
   - `attendees` : email du prospect + françois.ouairy@bensaid-avocats.fr ;
   - **pas de visio** : appel téléphonique, donc **pas de lien Meet** ;
   - `description` : rappel de l'objet + le **numéro de téléphone** du prospect (François appelle).
4. Préparer le **mail de confirmation** (même module 3 blocs) avec l'heure (prospect + Paris) et
   la confirmation qu'on l'appellera au numéro indiqué.

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
```
(Le corps s'arrête sur la formule de politesse : **pas de bloc signature**, la signature Outlook
s'ajoute à l'envoi.)

Cette convention **s'applique à tous les mails produits par les skills du cabinet** (cf
[[rdv-cadrage]]). Sur poste macOS on peut, en plus, sauvegarder le texte en `.txt` dans le dossier
perso ; mais le module 3 blocs dans le chat reste la **livraison par défaut**.

## Phase 4 - Persistance et suite
- Classer le mail et les créneaux dans le dossier perso / la fiche mémoire du dossier.
- Mettre à jour le statut : « premier échange proposé » puis « call fixé ».
- **Next step naturel** : si le prospect confirme son intérêt au call, enchaîner sur le skill
  `rdv-cadrage` (RDV de cadrage stratégique à 2 400 € HT).

## Données de référence (cabinet)
- **Call de premier échange** : environ 10 min, gratuit, **par téléphone**, qualification avant
  le RDV de cadrage. François appelle le prospect au numéro qu'il a communiqué.
- **RDV de cadrage** : 2 400 € HT, visio ou présentiel (cf [[rdv-cadrage]]).
- **Cabinet Paris** : 49 rue de Courcelles, 75008 Paris, 1er étage, code porte 2079.
- **Email François** : françois.ouairy@bensaid-avocats.fr.

## Exemple d'usage
Prospect anglophone (couple hispano-américain, revenus de retraite US 401(k)/RMD, projet
d'installation en France) : la fiche-prospect a situé le couple, puis premier-echange rédige une
réponse **courte en anglais**, confirme le champ (fiscalité internationale + immobilier), montre
la maîtrise en une phrase en nommant la **convention fiscale franco-américaine** et le point à
trancher (traitement des plans de retraite US une fois résidents français) **sans citer d'article,
sans décrire le mécanisme et sans chiffrer**. Claude choisit lui-même 2-3 créneaux (dont un le jour
même) et les insère ; François valide le mail complet. Pas de bloc signature. Livraison en 3 blocs.
