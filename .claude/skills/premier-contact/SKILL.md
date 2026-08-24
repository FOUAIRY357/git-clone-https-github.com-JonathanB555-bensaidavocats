---
name: premier-contact
description: >
  Rédige le tout premier mail de réponse à un prospect ou apporteur entrant, au nom de
  BENSAID AVOCATS. But : prouver notre maîtrise du sujet, donner envie de nous confier le
  dossier, et caler un premier échange téléphonique. On vend la valeur, mais on ne chiffre
  pas encore (ni honoraires, ni montant, ni facture : cela vient via [[rdv-cadrage]]). Ton
  assuré et business, jamais scolaire. Déclencher quand l'utilisateur veut "répondre au
  prospect", "un premier message", "caler le call", "caler le call de 10 min", "proposer un
  premier échange", ou tape "/premier-contact <nom du prospect>". En amont du skill
  [[rdv-cadrage]], qui gère ensuite le RDV de cadrage payant.
---

# Premier contact - accrocher et caler l'échange

## Objectif

Un seul mail, un seul but : donner envie de nous confier le dossier et obtenir un premier
échange téléphonique. **On vend, mais on ne chiffre pas encore.** On ne déroule pas l'analyse
juridique (on ne donne pas l'étude gratuitement) : on montre qu'on a déjà vu le nœud du
dossier et l'enjeu, on nomme ce qu'on livre, on propose une date.

Dans ce premier mail : **pas d'honoraires, pas de montant, pas de facture.** Le prix se cadre
au call ou via [[rdv-cadrage]].

**On n'annonce pas qu'on accepte le dossier.** Bannir « Nous acceptons volontiers votre dossier »
et ses variantes. L'entree en relation se decide apres examen des pieces, et se formalise par le
devis puis la lettre de mission. Dire qu'on traite ce type de dossier regulierement suffit a
rassurer, sans nous engager.

**On ne demande aucune piece d'identite dans ce premier mail** (passeport, titre de sejour,
justificatif de domicile). Ces pieces relevent de l'entree en relation et se demandent au stade
de la [[lettre-mission]]. Un premier mail ne reclame que ce qui sert a mesurer le dossier.

## Règle d'or du style

**Ton assuré, business, jamais scolaire.** On écrit d'égal à égal, en professionnel qui
connaît son sujet et va droit au but.

Phrases courtes. Une idée par phrase. Mots simples. Si une phrase fait plus de deux lignes,
la couper.

**Ne jamais réciter les questions du client en liste** (effet copie d'élève). On reformule
la situation dans nos mots et on pointe l'enjeu, une fois.

**Toujours dire qu'on a l'habitude de traiter ce type de dossier.** Une phrase suffit :
"Nous avons l'habitude de traiter ce type de dossier" ou "Ce sont des sujets que nous
traitons régulièrement".

Ne jamais écrire "c'est le cœur de notre pratique" ni de formule grandiloquente. Ne pas
promettre la "certitude" fiscale. Pas de formule commerciale ("n'hésitez pas", "au plaisir
de", "je me permets de").

**À PROSCRIRE ABSOLUMENT (marqueurs « IA »).** Ne jamais ouvrir la reprise par une
phrase-chapeau qui annonce la compréhension. Sont bannis : "Votre demande est claire",
"Si je comprends bien", "Je comprends bien", "C'est bien noté", "Nous avons bien compris
votre demande". On entre **directement dans les faits**. C'est la reprise concrète et le
pointage de l'enjeu qui prouvent qu'on a compris, pas une phrase qui l'annonce.

## Les briques du mail (dans cet ordre)

1. **Remerciement** : une ligne. ("Je vous remercie de votre message.")
2. **Le hook (la brique qui vend)** : reformuler la situation dans nos mots ET pointer le
   nœud du dossier, là où se joue la valeur ou le risque, sans dérouler l'analyse. Glisser la
   phrase habitude. C'est ici qu'on prouve qu'on a déjà identifié l'enjeu que le client n'a
   pas forcément vu.
3. **Le livrable** : nommer ce qu'on produit (une étude écrite et opposable) et ce qu'elle
   apporte (sécuriser, chiffrer le risque, permettre d'arbitrer). Concret, pas de blabla.
4. **La complémentarité** (si apporteur, confrère, ou dossier étranger) : on ne prend que le
   volet juridique, on ne marche pas sur leurs plates-bandes, on coordonne avec les conseils
   sur place. Rassure l'apporteur et ferme l'objection "concurrence". Saute si le contact est
   le client final direct.
5. **Le call** : proposer un échange court, à une date précise (souvent le lendemain), plage
   souple, dans le fuseau du destinataire s'il est à l'étranger. Demander le créneau et le
   numéro. Quand c'est utile, demander en amont LA donnée qui permettra de cadrer dès l'appel
   (un volume, une répartition, une date).

Cible : 4 à 5 paragraphes courts. Si ça dépasse, couper.

## Charte (reprise de [[charte-cabinet]] et [[redaction-mail]])

- Salutation : "Cher Monsieur," ou "Chère Madame,". Jamais "Bonjour", jamais "Madame,
  Monsieur,". Si le signataire n'est pas identifié avec certitude, le signaler à
  l'utilisateur après le mail.
- Clôture : "Salutations dévouées," sans signature (intégrée dans Outlook).
- Accents obligatoires. Aucun tiret cadratin ni demi-cadratin : virgule, deux-points,
  parenthèses.
- François envoie lui-même depuis Outlook. Jamais d'envoi automatique. cf.
  [[envoi-mails-clients]].

## Format de sortie obligatoire

Chaque élément dans son bloc de code, pour copie en un clic :

**DESTINATAIRE**
```
<email>
```

**OBJET**
```
<sujet précis, orienté enjeu ; pas de "premier échange" scolaire>
```

**CORPS**
```
<de "Cher Monsieur," à "Salutations dévouées,">
```

Après les blocs, une ligne sur les points à vérifier (civilité du destinataire, fuseau et
horaires à figer).

## Module copier-coller : banque de phrases

Briques courtes et interchangeables. Piocher, adapter le sujet, assembler.

**Ouverture**
```
Je vous remercie de votre message.
```
```
Je vous remercie pour ce message.
```

**Le hook (reformuler + pointer l'enjeu, sans phrase-chapeau)**
```
Le sujet est un classique de la TVA des acteurs étrangers qui opèrent ponctuellement en France, et nous le traitons régulièrement.
```
```
L'enjeu tient à la ventilation de la clientèle : selon que l'acheteur est un professionnel ou un particulier, le redevable et le traitement ne sont pas les mêmes. C'est là que se logent l'absence de TVA facturée et, le cas échéant, l'exposition en cas de contrôle.
```

**Phrase habitude (obligatoire, en choisir une)**
```
Nous avons l'habitude de traiter ce type de dossier.
```
```
Ce sont des sujets que nous traitons régulièrement.
```

**Le livrable (nommer + valeur)**
```
Nous livrons une étude écrite et opposable : qualification des opérations, taux, régime applicable, et surtout chiffrage du risque passé et stratégie de régularisation. De quoi sécuriser votre client et lui permettre d'arbitrer en connaissance de cause.
```

**Complémentarité (apporteur / confrère / dossier étranger)**
```
Nous n'intervenons que sur le volet juridique. La mise en conformité (immatriculation, représentation fiscale, déclarations) reste la vôtre : nos rôles sont complémentaires, pas concurrents.
```
```
Nous pilotons le volet français et coordonnons avec des conseils établis sur place.
```

**Le call**
```
Le plus efficace est d'en parler. Je vous propose un échange demain, en fin d'après-midi heure de Paris.
```
```
Indiquez-moi le créneau et le numéro auxquels vous joindre.
```
```
D'ici là, un ordre de grandeur du volume concerné et sa répartition me permettra de cadrer précisément dès l'appel.
```

**Clôture**
```
Salutations dévouées,
```

## Exemple de référence (apporteur ASD Group, TVA conférence, 08/2026)

**OBJET**
```
TVA sur les droits d'entrée de votre client (conférence en France)
```

**CORPS**
```
Cher Monsieur,

Je vous remercie de votre message.

Le sujet est un classique de la TVA des acteurs étrangers qui opèrent ponctuellement en France, et nous le traitons régulièrement. Les droits d'accès à une manifestation tenue en France y sont, en principe, taxables. L'enjeu tient à la ventilation de la clientèle : selon que l'acheteur est un professionnel identifié à la TVA ou un particulier, le redevable et le traitement ne sont pas les mêmes. C'est précisément là que se logent l'absence de TVA facturée et, le cas échéant, l'exposition en cas de contrôle.

Nous livrons une étude écrite et opposable : qualification des opérations, taux, sort du statut non lucratif au regard du droit français, et surtout chiffrage du risque passé et stratégie de régularisation. De quoi sécuriser votre client et lui permettre d'arbitrer en connaissance de cause.

Nous n'intervenons que sur le volet juridique. La mise en conformité (immatriculation, représentation fiscale, déclarations) reste la vôtre : nos rôles sont complémentaires, pas concurrents.

Le plus efficace est d'en parler. Je vous propose un échange demain mercredi 5 août en fin d'après-midi, heure de Paris (début de matinée à Montréal), ou jeudi à la même heure. Indiquez-moi le créneau et le numéro auxquels vous joindre. D'ici là, un ordre de grandeur du volume de billetterie et sa répartition entre professionnels et particuliers me permettra de cadrer précisément dès l'appel.

Salutations dévouées,
```

## Registre : adapter au destinataire

- **Apporteur / confrère / professionnel** : ton direct, d'égal à égal, on pointe l'enjeu
  technique (comme l'exemple ci-dessus). La brique complémentarité est importante.
- **Particulier en difficulté** (contrôle, redressement, litige) : même structure, ton un peu
  plus rassurant, on nomme l'enjeu sans l'alourdir. La brique complémentarité saute souvent.

Dans tous les cas : on vend la valeur, on ne chiffre pas, on cale l'échange.
