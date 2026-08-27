---
name: revue-mails
description: >
  Passe en revue la boite Outlook de Francois Ouairy pour reperer ce qui est reste sans suite :
  les mails entrants auxquels il n'a pas repondu, et les engagements qu'il a pris par mail
  (« je vous adresse la proposition », « je reviens vers vous ») restes sans envoi. Produit pour
  chaque cas un projet de reponse courte, pret a coller dans Outlook, dans la charte du cabinet.
  Ne repond jamais a la place de Francois : il relit et envoie lui-meme. Tourne automatiquement
  tous les deux jours a 15h30 via la Routine « Revue des mails en attente ». Declencher quand
  l'utilisateur demande « ma revue de mails », « a quoi je dois repondre », « qu'est-ce que j'ai
  loupe dans mes mails », « mes mails en attente », ou tape "/revue-mails".
---

# revue-mails - ce qui attend une reponse

Objectif : qu'aucun client, prospect ou confrere ne reste sans reponse, et qu'aucune proposition
promise ne soit oubliee. Le declencheur historique : la proposition promise a Kevin Merien, jamais
envoyee, decouverte trop tard.

Ce skill lit la boite mail. **Il n'envoie rien.** Conformement a [[charte-cabinet]] section 4,
on prepare, Francois relit et diffuse lui-meme.

Style des reponses proposees : [[charte-cabinet]] fait foi, [[redaction-mail]] pour le detail.

## 1. Perimetre

- Boite : `francois.ouairy@bensaid-avocats.fr`, dossier **Inbox**.
- Fenetre par defaut : **10 jours glissants**. Un fil plus ancien qu'on a deja signale et que
  Francois a laisse de cote n'a pas a revenir indefiniment.
- Pour ajouter la boite partagee `contact@bensaid-avocats.fr`, refaire les memes recherches avec
  `mailboxOwnerEmail: "contact@bensaid-avocats.fr"`. Desactive par defaut (volume de formulaires).

Appels type (`mcp__Microsoft_365__outlook_email_search`) :

```
folderName: "Inbox", afterDateTime: "<J-10>", order: "newest", limit: 25, offset: 0
```

Puis paginer avec le `nextOffset` renvoye jusqu'a epuisement. Le volume est eleve (souvent plus de
400 messages sur 10 jours) : c'est normal, la quasi-totalite est du bruit machine ecarte a l'etape 2.

## 2. Ecarter le bruit machine (avant toute lecture de corps)

Se decide sur l'expediteur et l'objet, sans ouvrir le message. Sont du bruit :

- `no-reply@`, `noreply@`, `ne-pas-repondre@`, et tout `*.sharepointonline.com` / `odspnotify`
  (« a charge de nouveaux fichiers suite a votre demande ») ;
- les newsletters et veilles : `newsletter@`, `*brevo*`, `*mailchimp*`, `*sendgrid*`, Les Echos,
  Wisetax, Doctrine, LinkedIn, alertes Google ;
- les diffusions d'association aux adherents (IACF « Aux adherents de l'IACF », comptes rendus de
  commission) : information, pas demande ;
- les notifications internes automatiques (enregistrements d'appel « Votre enregistrement d'appel
  avec ... » envoyes par Jonathan@bensaid-avocats.fr) ;
- les accuses de reception, confirmations de rendez-vous automatiques, relances de facturation
  emises par un outil.

**Exception importante : `wordpress@bensaid-avocats.fr` n'est pas du bruit.** Ce sont les
formulaires du site. Un mail « RAPPEL DEMANDE ... » est un prospect entrant qui attend un rappel :
il entre dans la revue, categorie « lead entrant ».

Un expediteur machine qui attend une action humaine (greffe, tribunal, portail fiscal, banque)
reste dans la revue.

## 3. Regrouper en fils

Normaliser l'objet : retirer les prefixes `Re:`, `RE:`, `Re :`, `TR:`, `Fwd:`, `FW:`, `Rép:`,
passer en minuscules, couper les espaces. Deux messages de meme objet normalise et de meme
interlocuteur appartiennent au meme fil.

Recuperer en parallele les envois de Francois sur la meme periode, elargie de 3 jours en amont :

```
folderName: "Sent Items", afterDateTime: "<J-13>", order: "newest", limit: 25
```

## 4. Qualifier chaque fil

Trois etats, deux seulement sont signales.

**A REPONDRE** - le dernier message du fil est entrant, et aucun envoi de Francois ne lui est
posterieur. C'est le cas classique.

**ENGAGEMENT EN SUSPENS** - le dernier message est un envoi de Francois, mais il annonce un
livrable ou un retour, et rien n'est parti depuis. Chercher dans le corps envoye :
« je vous adresse », « je vous transmets », « je vous envoie », « vous recevrez », « je reviens
vers vous », « je reviendrai vers vous », « des que possible », « d'ici la fin de semaine »,
« notre proposition », « la lettre de mission », « le devis », « la facture ». Signaler si plus de
**3 jours** se sont ecoules sans envoi. C'est le cas Kevin Merien : ne jamais le rater.

**RAS** - tout le reste. Ne pas l'evoquer dans le rapport.

Nuances a respecter :

- un simple « bien recu, merci » entrant qui ne demande rien ne se signale pas ;
- une reponse partie depuis une autre boite du cabinet (Jonathan, Raphael, contact@) compte comme
  une reponse : verifier les destinataires avant de conclure a un oubli ;
- un fil ou Francois est en copie seulement, et ou un confrere du cabinet est destinataire
  principal, se signale au plus en P3.

## 5. Classer par priorite

- **P1** - client ou prospect en attente depuis plus de 3 jours ; toute echeance fiscale,
  procedurale ou contractuelle proche ; engagement en suspens sur une proposition ou une lettre
  de mission ; lead entrant du site non rappele.
- **P2** - confrere, administration, greffe, expert-comptable ; demande de piece ; relance polie.
- **P3** - courtoisie, invitation, sujet sans enjeu.

Trier P1 puis P2 puis P3, et par anciennete decroissante a l'interieur de chaque rang.

## 6. Lire les messages retenus

`mcp__Microsoft_365__read_resource` sur l'`uri` de chaque fil retenu, pour disposer du corps reel.
Plafond raisonnable : **15 fils**. Au-dela, garder les 15 plus prioritaires et indiquer le nombre
de fils ecartes, jamais tronquer en silence.

## 7. Rediger la reponse proposee

Charte du cabinet, non negociable (cf [[charte-cabinet]]) :

- ouverture « Cher Monsieur, » ou « Chere Madame, », jamais « Bonjour » ;
- **court : 3 a 6 lignes.** C'est une reponse d'attente ou de traitement simple, pas une note ;
- phrases courtes, style avocat, accents obligatoires, aucun tiret cadratin, deux-points rares ;
- cloture « Salutations devouees, », **sans signature** (la signature Outlook s'en charge) ;
- honoraires en HT si un montant apparait ;
- aucune phrase-chapeau (« Votre demande est claire », « Si je comprends bien ») ;
- ne jamais inventer un fait, une date de rendez-vous ni un montant. Si la reponse suppose un
  element que la boite ne donne pas, ecrire la reponse d'attente et signaler le point a trancher
  sous le projet, en une ligne.

Verifier toute reference d'article via le MCP `Bensaid_MCP` avant de la citer. En regle generale,
une reponse de revue ne cite pas d'article : elle accuse reception, donne un delai, ou pose la
question qui debloque.

## 8. Livrer

Deux sorties, toujours :

1. **Un Artifact HTML** (charger d'abord le skill `artifact-design`), une fiche par fil.
   Titre stable : « Revue des mails ».

   Chaque fiche porte, dans cet ordre : l'anciennete en jours, le correspondant et sa qualite,
   l'horodatage, **les champs copiables**, ce que la personne attend en une phrase, puis le projet
   de reponse.

   **Les champs copiables sont le coeur de la fiche.** Francois travaille souvent depuis son
   telephone : il doit pouvoir monter le mail dans Outlook sans jamais selectionner de texte a la
   main. Un bouton par element, chacun copiant sa seule valeur dans le presse-papier, dans l'ordre
   de [[redaction-mail]] :

   - **A** : l'adresse du destinataire, seule, sans nom ni chevrons (`micael@igeneve.com`).
   - **Copie** : uniquement si le fil d'origine portait une copie a conserver.
   - **Objet** : l'objet **de la reponse**, pas celui recu. Reprendre l'objet d'origine prefixe de
     `RE: ` pour rester dans le fil, en une seule occurrence du prefixe.
   - **Corps** : le projet de reponse, de la salutation a la formule de cloture.

   Chaque bouton affiche sa valeur en clair (police a chasse fixe, pour verifier une adresse d'un
   coup d'oeil) et confirme la copie. Prevoir le repli sur `document.execCommand("copy")` quand
   `navigator.clipboard` est indisponible, et ne jamais livrer une valeur uniquement selectionnable.
   **Republier a la meme URL** a chaque passage : appeler d'abord `Artifact` avec `action: "list"`
   pour retrouver la page qui porte ce titre, puis republier en passant son `url`. Francois garde
   ainsi un seul lien, qu'il peut mettre en favori. N'en creer une nouvelle que s'il n'en existe pas.
2. **Un recapitulatif court dans le chat** : le nombre de fils en attente, la liste P1 en une ligne
   chacune. Pas de pave.

S'il n'y a rien : le dire en une phrase, et ne pas produire d'Artifact.

## 9. Interdits

- Ne jamais envoyer, ni repondre, ni creer un brouillon dans Outlook.
- Ne jamais marquer un message comme lu ou non lu.
- Ne jamais annoncer « j'ai repondu » : le livrable est un projet a relire.
