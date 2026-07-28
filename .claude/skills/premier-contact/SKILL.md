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

## Réflexe automatique : lancer la fiche-prospect

Dès que ce skill est déclenché sur un prospect nommé, lancer AUSSI, en parallèle et en
tâche de fond, le skill [[fiche-prospect]] sur ce prospect (nom, email, téléphone, société
éventuellement citée). On prépare le dossier pendant qu'on cale le call.

- Ne pas attendre la fiche pour rédiger et livrer le mail : les deux vont en parallèle.
- La fiche n'est jamais jointe au mail ni mentionnée au prospect : elle sert à préparer
  l'échange en interne.

## Règle d'or du style

Phrases très courtes. Une idée par phrase. Mots simples. Si une phrase fait plus de
deux lignes, la couper. On relit et on enlève tout ce qui n'aide pas.

**Ne pas ouvrir par une formule méta.** Bannir "Votre demande est claire", "Votre projet
est clair", "Bien reçu", "C'est noté", "Nous avons bien compris". Ces phrases ne prouvent
rien et sonnent robotique. La preuve qu'on a compris, c'est d'**attaquer directement par la
reformulation de SA situation dans nos mots**. On entre dans le concret dès la première
phrase du paragraphe.

**Une phrase rassurante, mais qui change à chaque fois.** Toujours rassurer, jamais avec la
même formule. L'idée à faire passer : c'est un terrain que nous connaissons, et bien
anticipé, ça se sécurise. Piocher dans la banque de phrases plus bas, ne pas répéter
mécaniquement "Nous avons l'habitude de ce type de dossier".

Ne jamais écrire "c'est le cœur de notre pratique" ni de formule grandiloquente.
Ne pas promettre la "certitude" fiscale.

## Les briques du mail (dans cet ordre)

1. **Remerciement** : une ligne.
2. **On a compris + notre rôle** (un seul paragraphe court) : ouvrir DIRECTEMENT par la
   reformulation de sa situation dans nos mots, avec un ou deux éléments précis de son
   message (un article, une convention, un mécanisme) ; pas de formule méta en tête. Puis
   une phrase rassurante (variée, voir banque) et, si dossier étranger, qu'on coordonne avec
   des conseils sur place. On montre qu'on maîtrise en quelques mots, on ne déroule pas
   l'analyse.
3. **Le call** : un échange de dix minutes, avec des créneaux CONCRETS pris dans l'agenda de
   François (voir section suivante). Dire qu'on rappellera au numéro laissé.
4. **Disponibilité** : une ligne, "Je reste à votre disposition."

Cible : 3 paragraphes courts (hors salutation et clôture). Plus c'est court, mieux c'est :
le but est de rassurer et caler le call, pas d'impressionner par la longueur.

## Créneaux : vérifier l'agenda avant d'écrire

Avant de rédiger, TOUJOURS regarder l'agenda de François sur la journée visée (souvent le
lendemain), via Google Agenda (`list_events` ou `suggest_time` sur
francois.ouairy@bensaid-avocats.fr, fuseau Europe/Paris).

- Proposer deux créneaux réellement libres : un en fin de matinée, un en début d'après-midi.
- Éviter tout créneau déjà occupé (autres calls, RDV) et laisser une marge autour.
- Donner l'heure précise ("à 11 h 30 ou à 14 h 30"), jamais une simple plage floue.
- Si le prospect a laissé son numéro, dire qu'on l'appellera dessus. Sinon, le demander.
- Signaler ensuite à l'utilisateur les créneaux proposés, pour qu'il les bloque.

## Charte (reprise de [[redaction-mail]])

- Salutation : "Cher Monsieur," ou "Chère Madame,". Jamais "Bonjour", jamais "Madame, Monsieur,".
  Si le signataire n'est pas identifié avec certitude, le signaler à l'utilisateur après le mail.
- Clôture : "Salutations dévouées," sans signature (intégrée dans Outlook).
- Pas de formule commerciale. Terminer par "Je reste à votre disposition." juste avant la clôture.
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

Après les blocs, une ligne sur les points à vérifier : civilité du destinataire, créneaux
proposés (déjà croisés avec l'agenda, à bloquer par François), et rappel que la
fiche-prospect tourne en tâche de fond.

## Module copier-coller : banque de phrases

Briques courtes et interchangeables. Piocher, adapter le sujet, assembler.

**Ouverture**
```
Je vous remercie de votre message.
```

**On a compris : reformulation directe (PAS de formule méta en tête)**
Attaquer par sa situation, dans nos mots. Exemples :
```
Vous partez vous installer en Suisse en novembre, votre épouse et votre enfant restant résidents de France.
```
```
Vous souhaitez investir à Dubaï depuis votre holding et arbitrer entre une filiale locale et une SCI, en sécurisant le montage au regard de l'article 209 B et de la convention franco-émirienne.
```

**Phrase rassurante (obligatoire, en varier une à chaque fois)**
Idée : terrain connu + bien anticipé, ça se sécurise. Ne pas toujours reprendre la même.
```
Bien anticipés, ces dossiers se sécurisent sans difficulté.
```
```
C'est un schéma que nous mettons en place régulièrement.
```
```
Ce sont des situations que nous accompagnons souvent, et qui se traitent sereinement lorsqu'elles sont préparées en amont.
```
```
Ce type de dossier nous est familier.
```
```
Nous avons l'habitude de ce type de dossier.
```

**Notre rôle**
```
Notre rôle est de bâtir un montage solide et défendable.
```
```
Nous pilotons le volet français et coordonnons avec des conseils sur place.
```

**Proposition de call (créneaux concrets, vérifiés dans l'agenda)**
```
Le plus simple est d'en parler dix minutes. Seriez-vous disponible demain, mercredi 29 juillet, à 11 h 30 ou à 14 h 30 ?
```
```
Je vous appellerai au numéro que vous m'indiquez.
```

**Disponibilité (obligatoire, avant la clôture)**
```
Je reste à votre disposition.
```

**Clôture**
```
Salutations dévouées,
```

## Exemple de référence (dossier Bouaziz / Suisse, 07/2026)

Style court : ouverture DIRECTE sur sa situation (aucune formule méta), phrase rassurante
variée, "notre rôle" fondu dans le même paragraphe, créneaux concrets pris dans l'agenda de
François, disponibilité juste avant la clôture.

**OBJET**
```
Votre projet d'installation en Suisse - premier échange
```

**CORPS**
```
Cher Monsieur,

Je vous remercie de votre message.

Vous partez vous installer en Suisse en novembre, votre épouse et votre enfant restant résidents de France. L'enjeu est de faire tenir deux résidences fiscales distinctes (article 6, 4, a du CGI) et de traiter la sortie de vos titres, exit tax comprise. Bien anticipés, ces dossiers franco-suisses se sécurisent sans difficulté ; nous les accompagnons souvent et coordonnons avec une fiduciaire suisse pour le volet cantonal.

Le plus simple est d'en parler dix minutes. Seriez-vous disponible demain, mercredi 29 juillet, à 11 h 30 ou à 14 h 30 ? Je vous appellerai au 06 36 48 94 37.

Je reste à votre disposition.

Salutations dévouées,
```
