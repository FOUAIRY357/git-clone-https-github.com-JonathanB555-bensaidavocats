---
name: premier-contact
description: >
  Rédige le tout premier mail de réponse à un prospect entrant, au nom de BENSAID AVOCATS.
  But unique : montrer qu'on a compris sa demande et caler un premier call téléphonique
  court de dix minutes (gratuit, de qualification), sans jamais parler de RDV payant ni
  d'honoraires. Style simple, rassurant, percutant. Déclencher quand l'utilisateur veut
  "répondre au prospect", "un premier message", "caler le call de 10 min", "proposer un
  premier échange", ou tape "/premier-contact <nom du prospect>". En amont du skill
  [[rdv-cadrage]], qui gère ensuite le RDV de cadrage payant.
---

# Premier contact - caler le call de 10 min

## Objectif

Un seul mail, un seul but : donner confiance et obtenir un premier échange téléphonique
de dix minutes. On ne vend rien, on ne chiffre rien, on ne développe pas l'analyse
juridique. On prouve qu'on a compris et on propose une date.

Ne jamais mentionner ici : honoraires, RDV de cadrage, montant, facture, mission.
Cela vient après, via [[rdv-cadrage]].

## Règle d'or du style

Phrases courtes, mots simples, une idée par phrase. Si une phrase fait plus de
deux lignes, la couper. On relit et on enlève tout ce qui n'aide pas.

Mais court ne veut pas dire haché. Aligner trois ou quatre phrases sujet-verbe-complément
donne l'impression de réciter le formulaire du prospect, c'est le vrai marqueur "robot".
Mieux vaut une phrase de synthèse qui respire que quatre phrases plates.

Faire varier les phrases réflexes (remerciement, habitude, proposition de call) d'un mail
à l'autre. Deux premiers contacts côte à côte ne doivent pas se ressembler mot pour mot.

**Toujours faire comprendre qu'on a l'habitude de ce type de dossier.** C'est ce qui
rassure. Varier la formule et, si possible, la fondre dans la phrase de synthèse plutôt
que de la coller comme une phrase à part.

Ne jamais écrire "c'est le cœur de notre pratique" ni de formule grandiloquente.
Ne pas promettre la "certitude" fiscale.

## Les 4 briques du mail (dans cet ordre)

1. **Remerciement** : une ligne.
2. **On a compris** : reprendre SA demande dans nos mots, en une phrase de synthèse plutôt
   qu'une liste de phrases plates qui récitent son message. Garder un ou deux éléments
   précis (un article, une convention, un mécanisme) pour prouver qu'on a vraiment lu.
   Entrer directement dans le sujet. Ne jamais annoncer la compréhension par une formule
   toute faite du type "Votre demande est claire" ou "Votre question est claire", on la
   prouve en reformulant. Y fondre, en la variant, l'idée qu'on a l'habitude de ce type de dossier.
3. **Notre rôle** (une phrase, facultative) : dire concrètement ce qu'on va faire pour lui.
   Éviter la formule vide "bâtir un schéma solide et défendable" resservie à l'identique sur
   tous les mails, l'ancrer sur un détail réel de son dossier (le pays, un actif, la
   transmission). Si dossier étranger, dire qu'on coordonne avec ses conseils sur place.
   Si on n'a rien de concret à dire, couper cette brique.
4. **Le call** : un échange de dix minutes, à une date précise (souvent le lendemain),
   plage souple. Demander le créneau et le numéro.

Cible : 4 paragraphes courts. Si ça dépasse, couper.

## Charte (reprise de [[redaction-mail]])

- Salutation : "Cher Monsieur," ou "Chère Madame,". Jamais "Bonjour", jamais "Madame, Monsieur,".
  Si le signataire n'est pas identifié avec certitude, le signaler à l'utilisateur après le mail.
- Clôture : "Salutations dévouées," sans signature (intégrée dans Outlook).
- Pas de formule commerciale. Seule tolérance : "Je reste à votre disposition."
- Accents obligatoires. Aucun tiret cadratin ni demi-cadratin, les remplacer par une virgule, un point ou des parenthèses.
- Pas de deux-points dans le corps du mail. C'est un réflexe qui sonne "écrit par une IA". Reformuler avec une virgule, un point, ou en coupant la phrase.
- François envoie lui-même depuis Outlook. Jamais d'envoi automatique. cf. [[envoi-mails-clients]].

## Format de sortie obligatoire

Chaque élément dans son bloc de code, pour copie en un clic :

**DESTINATAIRE**
```
<email>
```

**OBJET**
```
Votre projet <sujet> - premier échange
```

**CORPS**
```
<de "Cher Monsieur," à "Salutations dévouées,">
```

Après les blocs, une ligne sur les points à vérifier (civilité du destinataire, horaires à figer).

## Module copier-coller : banque de phrases

Briques courtes et interchangeables. Piocher, adapter le sujet, assembler.

**Ouverture**
```
Je vous remercie de votre message.
```

**On a compris (adapter la partie technique)**

Entrer directement dans le sujet, sans formule d'annonce. Reformuler sa demande dans nos mots. Exemples :
```
Vous détenez des actions gratuites et vous vous interrogez sur le sort du gain de cession en cas de donation.
```
```
Si je comprends bien, vous souhaitez investir à Dubaï depuis votre holding, arbitrer entre une filiale locale et une SCI, et sécuriser le montage au regard de l'article 209 B et de la convention franco-émirienne.
```

**Phrase habitude (obligatoire, varier d'un mail à l'autre)**
```
Nous avons l'habitude de traiter ce type de dossier.
```
```
Ce sont des sujets que nous traitons régulièrement.
```
```
Ces montages nous sont familiers.
```

**Notre rôle (ancrer sur un détail réel, ne pas resservir la même ligne)**
```
Notre travail sera de vous proposer un schéma clair et tenable dans la durée.
```
```
Nous pilotons le volet français et coordonnons avec vos conseils sur place.
```

**Proposition de call**
```
Je vous propose un premier échange de dix minutes demain, en fin de matinée ou en début d'après-midi.
```
```
Indiquez-moi le créneau et le numéro auxquels vous joindre.
```
```
Dites-moi à quel numéro et à quelle heure vous joindre, je vous rappelle.
```

**Clôture**
```
Salutations dévouées,
```

## Exemple de référence (dossier Medjebeur / Dubaï, 07/2026)

**OBJET**
```
Votre projet d'investissement immobilier à Dubaï - premier échange
```

**CORPS**
```
Cher Monsieur,

Je vous remercie de votre message.

Vous souhaitez investir à Dubaï depuis votre holding, arbitrer entre une filiale locale et une SCI, et sécuriser le tout côté fiscal (article 209 B, convention franco-émirienne, substance, remontée des revenus). Ce sont des montages qui nous sont familiers.

Notre rôle sera de vous proposer un schéma clair et défendable, en coordination avec des conseils établis aux Émirats.

Je vous propose un premier échange de dix minutes demain, vendredi 17 juillet, en fin de matinée ou en début d'après-midi. Indiquez-moi le créneau et le numéro auxquels vous joindre.

Salutations dévouées,
```
