---
name: rdv-auto
description: >
  Robot de détection automatique des rendez-vous confirmés par mail. Surveille la boîte
  Outlook du cabinet, repère les mails où un client CONFIRME un créneau proposé par François
  ou le secrétariat, en extrait la date et l'heure, et crée le rappel correspondant dans
  Google Agenda (avec alertes la veille, 1h avant et 10 min avant), puis notifie François.
  Lecture seule sur les mails, aucun envoi, aucune invitation au client : c'est un rappel
  privé. Tourne tout seul via une routine planifiée (toutes les ~20 min, lun-ven, heures
  ouvrées, heure de Paris) ; peut aussi être lancé à la main. Déclencher avec "/rdv-auto",
  « détecte les RDV confirmés », « vérifie mes mails pour les nouveaux rendez-vous »,
  « crée les rappels des RDV confirmés ».
---

# RDV-auto — détection automatique des RDV confirmés par mail

## But
Quand François (ou le secrétariat) propose un créneau à un client par mail et que **le client
confirme**, ce robot crée tout seul le **rappel dans Google Agenda**. Objectif : ne plus jamais
oublier de reporter un RDV confirmé dans l'agenda.

Il tourne en tâche de fond via une **routine planifiée** (cf. § Installation), mais la logique
ci-dessous est aussi exécutable **à la main** en tapant `/rdv-auto`.

## Périmètre technique (cabinet)
- **Mails** : Outlook / Microsoft 365 (`outlook_email_search`, `read_resource`). Lecture seule.
- **Agenda** : Google Agenda, agenda principal (`create_event`, `list_events`).
- **Compte de référence** : `françois.ouairy@bensaid-avocats.fr` ; domaine interne `@bensaid-avocats.fr`.
- **Fuseau** : `Europe/Paris` pour tous les événements créés.

## Règles de sécurité ABSOLUES
1. **Lecture seule sur les mails.** Jamais d'envoi, jamais de réponse, jamais d'invitation.
   Ce robot ne fait rien de visible côté client. (cohérent avec la règle d'or du cabinet :
   « ne jamais envoyer de mail automatiquement ».)
2. **Rappel privé.** L'événement Google Agenda est créé **sans aucun participant**
   (`attendees` vide) et `notificationLevel: "NONE"`, afin qu'**aucune invitation ne parte
   au client**. Le nom et l'email du client vont dans le titre / la description, pas en participant.
3. **Dans le doute, s'abstenir.** Si la date ou l'heure n'est pas certaine, s'il n'y a pas de
   proposition de créneau préalable claire, ou si le RDV est déjà passé → **ne pas créer**,
   et le signaler dans le récap.
4. **Pas de rattrapage historique.** On ne regarde que les mails **reçus aujourd'hui** (le plus
   récents), jamais les jours précédents : on ne veut pas ressusciter d'anciens fils.

## Algorithme (à chaque exécution)

### 1. Récupérer les mails entrants récents
`outlook_email_search` avec `folderName: "Inbox"`, `order: "newest"`, `limit: 25`,
`afterDateTime: "today"`.

### 2. Filtrer les confirmations client
Pour chaque mail dont l'expéditeur est **externe** (hors `@bensaid-avocats.fr`), lire le corps
(`read_resource` sur l'URI `mail:///messages/{id}`). Ne retenir que ceux qui **confirment un
créneau de rendez-vous** : « oui », « parfait », « ça me va », « je confirme », « c'est noté
pour… », « je serai disponible le… », etc.

La confirmation doit répondre à une **proposition de créneau** faite par François ou le
secrétariat. Cette proposition est en général visible dans le **texte cité** du fil (la partie
« Le … a écrit : »). Si besoin, retrouver le fil via une recherche sur l'objet / l'expéditeur.

### 3. Extraire les informations
Pour chaque confirmation valable :
- **client** : nom + email de l'expéditeur ;
- **date + heure** du RDV, exprimées en **heure de Paris** (si le client est dans un autre
  fuseau, convertir vers Paris — cf. [[rdv-cadrage]]) ;
- **objet** du RDV si connu ; **format** (visio / présentiel au cabinet) si mentionné ;
- **`conversationId`** du mail (sert de clé anti-doublon) ;
- **date de la confirmation** (date de réception du mail).

Ne créer un événement que si le **RDV est dans le futur**.

### 4. Anti-doublon (impératif)
Avant de créer, vérifier qu'il n'existe pas déjà :
- `list_events` avec `fullText: "<conversationId>"`, `startTime`/`endTime` = bornes de la
  **journée du RDV** (00:00 → 23:59), `timeZone: "Europe/Paris"`.
- Si un événement contient déjà ce `conversationId` **ou** si un événement du **même client
  existe déjà à la même heure de début** → **ne pas recréer**, passer au suivant.

### 5. Créer l'événement (`create_event`, agenda principal)
- `summary` : `RDV — <Client>` (+ ` · <objet>` si connu).
- `startTime` : `AAAA-MM-JJTHH:MM:00` ; `endTime` : +1h par défaut (**+2h** si RDV de cadrage) ;
  `timeZone: "Europe/Paris"`.
- `attendees` : **aucun** ; `notificationLevel: "NONE"`.
- `location` (si présentiel) : `BENSAID AVOCATS, 49 rue de Courcelles, 75008 Paris, 1er étage, code 2079`.
- `description` :
  ```
  Confirmé par mail par <client> (<email>) le <date de confirmation>.
  Objet : <objet ou "à préciser">.

  ⟦rdv-auto⟧ ref:<conversationId>
  ```
- `overrideReminders` :
  ```
  [ {method:"popup", minutes:1440},   // la veille (24 h avant)
    {method:"popup", minutes:60},     // 1 h avant
    {method:"popup", minutes:10} ]    // 10 min avant
  ```

### 6. Récap (= contenu de la notification push)
- **Si ≥ 1 RDV créé** : une ligne par RDV — `✅ <Client> — <JJ/MM> à <HH:MM> (créé)`. Ajouter
  les cas douteux : `⚠️ <Client> — confirmation détectée mais <raison> (non créé)`.
- **Si rien de nouveau** : répondre exactement `RAS — aucun nouveau RDV confirmé.` et rien d'autre.

## Installation / exploitation (routine planifiée)
Le robot est branché sur une **routine Claude Code Remote** (trigger) qui, à chaque déclenchement,
ouvre une session neuve dans cet environnement et exécute l'algorithme ci-dessus :
- **Rythme** : toutes les 20 min, du lundi au vendredi, ~8h–20h (heure de Paris).
  *(cron `*/20 6-18 * * 1-5` en UTC ; l'écart d'1 h à l'heure d'hiver est sans conséquence.)*
- **Notification** : push sur le téléphone de François, avec le récap de l'étape 6.
- **Connecteurs** requis par la routine : Microsoft 365, Google Calendar.

### Mettre en pause / reprendre / arrêter
- **Pause** : demander « mets en pause le robot rdv-auto » (désactive le trigger, `enabled:false`).
- **Reprise** : « réactive le robot rdv-auto ».
- **Arrêt définitif** : « supprime le robot rdv-auto ».
- **Réglages** (rythme, plage horaire, rappels, périmètre) : le dire en langage naturel, la
  routine et ce fichier seront mis à jour ensemble.

## Limites connues
- Détection fondée sur la compréhension du fil de mail : un client qui confirme de façon très
  implicite, ou un créneau exprimé de façon ambiguë, peut être manqué (le robot préfère
  s'abstenir plutôt que créer un faux RDV — cf. règle 3).
- Fenêtre « reçus aujourd'hui » + anti-doublon par `conversationId` : un même RDV n'est jamais
  créé deux fois, mais un RDV confirmé un dimanche soir n'est vu qu'au 1er passage du lundi matin.
- Aucun effet côté client : si l'on veut aussi **envoyer** au client une confirmation ou une
  invitation agenda, cela reste un geste manuel (voir [[rdv-cadrage]], voix secrétariat).
