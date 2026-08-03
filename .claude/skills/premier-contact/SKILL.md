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

Phrases très courtes. Une idée par phrase. Mots simples. Si une phrase fait plus de
deux lignes, la couper. On relit et on enlève tout ce qui n'aide pas.

**Toujours dire qu'on a l'habitude de traiter ce type de dossier.** C'est ce qui rassure.
Une phrase suffit : "Nous avons l'habitude de traiter ce type de dossier."

Ne jamais écrire "c'est le cœur de notre pratique" ni de formule grandiloquente.
Ne pas promettre la "certitude" fiscale.

## Les 4 briques du mail (dans cet ordre)

1. **Remerciement** : une ligne.
2. **On a compris** : une ou deux phrases courtes qui reprennent SA demande dans nos mots,
   avec un ou deux éléments précis de son message (un article, une convention, un mécanisme).
   Entrer directement dans le sujet, de façon naturelle. Ne jamais annoncer la compréhension
   par une formule toute faite du type "Votre demande est claire" ou "Votre question est claire" :
   on le prouve en reformulant, pas en l'annonçant. Puis la phrase habitude : "Nous avons
   l'habitude de traiter ce type de dossier."
3. **Notre rôle** (une phrase) : montage solide et défendable. Si dossier étranger, ajouter
   qu'on coordonne avec des conseils sur place.
4. **Le call** : un échange de dix minutes, à une date précise (souvent le lendemain),
   plage souple. Demander le créneau et le numéro.

Cible : 4 paragraphes courts. Si ça dépasse, couper.

## Charte (reprise de [[redaction-mail]])

- Salutation : "Cher Monsieur," ou "Chère Madame,". Jamais "Bonjour", jamais "Madame, Monsieur,".
  Si le signataire n'est pas identifié avec certitude, le signaler à l'utilisateur après le mail.
- Clôture : "Salutations dévouées," sans signature (intégrée dans Outlook).
- Pas de formule commerciale. Seule tolérance : "Je reste à votre disposition."
- Accents obligatoires. Aucun tiret cadratin ni demi-cadratin : virgule, deux-points, parenthèses.
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

**Phrase habitude (obligatoire, en choisir une)**
```
Nous avons l'habitude de traiter ce type de dossier.
```
```
Ce sont des sujets que nous traitons régulièrement.
```
```
Ces montages nous sont familiers.
```

**Notre rôle**
```
Notre rôle est de bâtir un montage solide et défendable.
```
```
Nous pilotons le volet français et coordonnons avec des conseils sur place.
```

**Proposition de call**
```
Je vous propose un premier échange de dix minutes demain, en fin de matinée ou en début d'après-midi.
```
```
Indiquez-moi le créneau et le numéro auxquels vous joindre.
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

Vous souhaitez investir à Dubaï depuis votre holding, arbitrer entre une filiale locale et une SCI, et sécuriser le tout côté fiscal (article 209 B, convention franco-émirienne, substance, remontée des revenus). Nous avons l'habitude de traiter ce type de dossier.

Notre rôle est de bâtir un montage solide et défendable. Nous pilotons le volet français et coordonnons avec des conseils établis aux Émirats.

Je vous propose un premier échange de dix minutes demain, vendredi 17 juillet, en fin de matinée ou en début d'après-midi. Indiquez-moi le créneau et le numéro auxquels vous joindre.

Salutations dévouées,
```
