---
name: rdv-cadrage
description: >
  Organise un rendez-vous de cadrage stratégique (2 400 € HT) pour un prospect ou client.
  Couvre tout le déroulé : proposition de dates par mail, confirmation du RDV (visio
  Google Meet ou présentiel au cabinet de Paris), création de l'événement Google Agenda
  avec lien visio, et préparation de l'envoi de la facture Sellsy avant le rendez-vous.
  Déclencher quand l'utilisateur veut organiser / proposer des dates pour un RDV de cadrage,
  un "rendez-vous stratégique", un "RDV à 2400", ou tape "/rdv-cadrage <nom du client>".
  L'argument est le nom du client (le dossier interne est récupéré automatiquement s'il existe).
---

# RDV de cadrage stratégique - déroulé type

## Ce qu'est ce rendez-vous
Rendez-vous de cadrage stratégique, environ 1h30 à 2h, **facturé 2 400 € HT** (TVA en sus selon
le régime applicable au client). François y remet un **support de présentation** : il présente
les options qui s'offrent au client, propose des chiffres et un comparatif, puis on propose les
**next steps avec un devis** (établi dans Sellsy). Le présent skill orchestre la logistique
autour de ce RDV ; le contenu de fond (analyse fiscale, comparatifs) s'appuie sur les skills
métier (fiscaliste, notaire, comptable) selon le sujet.

## Règles d'or (à respecter à chaque étape)
- **Ne jamais envoyer de mail automatiquement.** On prépare toujours le texte. Les mails de RDV
  (proposition de dates, confirmation) sont **adressés par le secrétariat**, et donc rédigés
  **au nom du secrétariat** : tournure « À la demande de Maître François Ouairy, nous vous
  proposons… », « nous » au lieu de « je », signature « Secrétariat - BENSAID AVOCATS ».
  cf mémoire [[envoi-mails-clients]].
- **Valider les dates avec François AVANT de rédiger le mail.** Proposer d'abord la liste des
  4 créneaux candidats, attendre son choix ou ses ajustements, puis seulement rédiger le mail.
- **Livrer tout mail en format copier-coller simple.** Texte brut (objet + destinataire + corps),
  sans mise en forme markdown, enregistré en `.txt` dans le dossier perso ET ouvert
  (`open <fichier>`) pour copie immédiate dans Outlook.
- **Toujours raisonner dans le fuseau horaire du client** pour proposer des créneaux
  (ex. Martinique UTC-4, Île Maurice UTC+4, Paris UTC+1/+2). Indiquer l'heure dans les deux
  fuseaux (client + Paris) dans le mail.
- **La facture part avant le RDV**, systématiquement.
- Tout sauvegarder dans le dossier perso du client : `~/Desktop/Dossiers prospects/<Nom>/`.
- Pas de tiret cadratin / demi-cadratin ni de couleur signature Claude. cf [[no-ai-style-markers]].

## Phase 0 - Contexte
1. Identifier le client (nom, email) et l'objet du RDV.
2. Récupérer le dossier existant : fiche mémoire `~/.claude/projects/<projet>/memory/dossier-<nom>.md`
   et/ou dossier perso `~/Desktop/Dossiers prospects/<Nom>/`. Reprendre le contexte, le fuseau
   horaire du client, les enjeux.
3. Si pas de dossier, lancer d'abord le skill `fiche-prospect`.

## Phase 1 - Proposer des dates (mail)
1. Lire les disponibilités de François via Outlook : `outlook_find_available_time`
   (ou `outlook_calendar_search`) sur les ~2 prochaines semaines, créneaux d'environ 2h.
2. Choisir **4 créneaux de 2h** réalistes, compatibles avec le fuseau du client et, en général,
   l'après-midi de Paris quand le client est dans les DOM ou en Amérique. **Toujours proposer
   4 créneaux de 2h**, sauf demande contraire explicite.
3. **Soumettre d'abord ces 4 créneaux à François pour validation** (liste simple). Attendre
   qu'il confirme ou ajuste les dates. Ne pas rédiger le mail avant cet accord.
4. Une fois les dates validées, **rédiger le mail de proposition** (texte seulement) :
   - propose les **4 créneaux de 2h** retenus (date + heure en fuseau client ET Paris) ;
   - demande au client de choisir un créneau **et** le format : **visio** ou **présentiel
     au cabinet de Paris** ;
   - rappelle brièvement l'objet et la durée (~1h30 à 2h).
5. **Livrer le mail en format copier-coller simple** : l'enregistrer en `.txt` dans le dossier
   perso (objet + destinataire + corps en texte brut) puis l'ouvrir (`open <fichier>`) pour que
   François n'ait plus qu'à copier-coller dans Outlook.

## Phase 2 - Confirmer le RDV
Une fois le créneau et le format choisis par le client :
1. Créer l'événement **Google Agenda** (`create_event`) :
   - `summary` : "RDV de cadrage stratégique - <Client> / BENSAID AVOCATS"
   - `startTime` / `endTime` + `timeZone` corrects (caler sur l'heure de Paris, l'invitation
     gère la conversion pour le client) ;
   - `attendees` : email du client + françois.ouairy@bensaid-avocats.fr ;
   - **Si visio** : `addGoogleMeetUrl: true`, puis récupérer le lien Meet généré ;
   - **Si présentiel** : `location` = "BENSAID AVOCATS, 49 rue de Courcelles, 75008 Paris,
     1er étage (code porte 2079)" ;
   - `description` : objet du RDV + (le cas échéant) lien vers le support.
   - Par défaut `notificationLevel` raisonnable ; ne pas spammer.
2. Préparer le **mail de confirmation** (texte seulement) :
   - date et heure (fuseau client + Paris) ;
   - format : soit le **lien Google Meet**, soit l'**adresse du cabinet + code 2079 + 1er étage** ;
   - mention que la facture suit (ou est jointe) et qu'elle est réglée avant le RDV.
3. Sauvegarder le lien Meet / les détails dans le dossier perso.

## Phase 3 - Facture (avant le RDV)
La facture est établie par **François dans Sellsy** (pas de connecteur API disponible : étape
manuelle). Le skill :
1. Pose un **point de contrôle** : la facture doit être émise et envoyée AVANT le RDV.
2. Prépare le **mail d'accompagnement de la facture** (texte) que François enverra une fois le
   PDF Sellsy généré (il y attache le PDF) : montant **2 400 € HT** (+ TVA selon régime),
   rappel de l'objet et de la date du RDV, modalités de règlement.
3. Tient une **checklist avant RDV** : facture envoyée / support prêt / lien ou lieu confirmé.

## Phase 4 - Support et next steps
1. Préparer le **support de présentation** du RDV : options qui s'offrent au client, chiffres,
   comparatifs. Le fond s'appuie sur le skill métier adapté (ex. `fiscaliste` pour
   l'expatriation et l'exit tax).
2. **Générer la version PowerPoint du support** via le skill **`support-cadrage`** :
   - Copier `~/.claude/skills/support-cadrage/assets/deck_template.py` vers `/tmp/deck_<client>.py`.
   - Ajuster `RUNNING` et `FOOTER`, remplacer le bloc `CONTENU` par les archétypes du dossier.
   - Structure cible ~17-20 slides : couverture, intercalaires, KPI, pour/contre, contenu,
     tableaux, accompagnement (3 colonnes), proposition honoraires, next steps, clôture.
   - Exécuter : `python3 /tmp/deck_<client>.py "<dossier>/Support cadrage - <Client> (<date>).pptx"`.
   - Sauvegarder dans `~/Desktop/Dossiers prospects/<Nom>/` **et** dans le dossier
     Google Drive du client (`DOSSIERS PERSOS/<Nom>/`).
   - Ouvrir le fichier (`open ...`) pour que François puisse le vérifier.
   - Ne pas utiliser le MCP PowerPoint (bugs AppleScript macOS FR). cf skill [[support-cadrage]].
3. Après le RDV : proposer les **next steps assortis d'un devis** (Sellsy), et préparer le mail
   correspondant.

## Phase 5 - Persistance
- Classer dans `~/Desktop/Dossiers prospects/<Nom>/` : mails (dates, confirmation, facture),
  support, lien Meet, dates retenues.
- Mettre à jour la fiche mémoire du dossier (statut : RDV proposé / confirmé / facturé / tenu).

## Données de référence (cabinet)
- **Tarif RDV de cadrage** : 2 400 € HT.
- **Cabinet Paris** : 49 rue de Courcelles, 75008 Paris, 1er étage, code porte **2079**.
- **Visio** : lien Google Meet généré via Google Agenda (`addGoogleMeetUrl`).
- **Facturation** : Sellsy (manuel, hors connecteur).
- **Envoi des mails de RDV** : proposition de dates et confirmation sont **adressées par le
  secrétariat**, au nom du secrétariat (« nous », signature « Secrétariat - BENSAID AVOCATS »).
  Les mails de fond (analyse, devis) restent à la signature de Me Ouairy.
