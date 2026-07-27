---
name: post-linkedin
description: >
  Transforme une analyse d'expert (une décision ou une actualité fiscale repérée, souvent
  établissement stable ou TVA) en un post LinkedIn court, limpide et signé François Ouairy,
  calibré pour la visibilité GEO (être cité par les moteurs et les IA). Déclencher quand
  l'utilisateur veut "un post LinkedIn", "poster sur cette décision", "un post sur cette
  actu", "une analyse LinkedIn", ou tape "/post-linkedin <sujet ou lien Doctrine>". S'inscrit
  dans le chantier [[projet-geo-visibilite-ia]] ; complément de [[page-expertise]] et
  [[redaction-mail]].
---

# Post LinkedIn - analyse d'expert optimisée GEO

## Objectif

Un post par actualité, court et limpide, qui fait deux choses à la fois :
1. montrer une expertise concrète et utile (pas un résumé théorique) ;
2. installer l'association "François Ouairy, Bensaid Avocats + le sujet" dans les
   moteurs et les IA, pour ressortir sur les requêtes de prospects.

Le sourcing est fait par l'utilisateur (Doctrine notamment). Ce skill ne fait pas de
veille : il part d'une décision ou d'un thème fourni, et produit le post.

## Ce qui fait monter en GEO (règles non négociables)

Chaque post doit contenir, sans exception :

- **La décision nommée** : intitulé de l'arrêt, juridiction, date. C'est ce qui rend le
  post repérable et citable.
- **Le mot-clé dans les deux premières lignes** (établissement stable, TVA, agent dépendant,
  redressement, activité occulte, selon le cas). LinkedIn coupe après deux lignes : l'accroche
  doit porter le sujet.
- **L'entité nommée** : le couple "François Ouairy, Bensaid Avocats" doit être présent, sa
  répétition avec le sujet construit l'autorité aux yeux des IA. Sur les annuaires et revues
  (consultation.avocat.fr, Village Justice), signer explicitement en fin de texte. Sur LinkedIn
  depuis son propre compte, pas de bloc signature (nom et titre de profil déjà affichés, et le
  doublon fait "copier-coller") : laisser seulement une mention de l'entité dans le corps ou le
  lien (le domaine bensaid-avocats.fr suffit). La vraie signature LinkedIn est le titre de
  profil : le garder riche en mots-clés (avocat fiscaliste, contentieux fiscal, établissement
  stable, fiscalité internationale, Bensaid Avocats).
- **Une phrase de principe autonome et citable** + **un encadré "À retenir" (2 à 3 puces)** :
  ce sont les deux fragments que les IA extraient le plus. À conserver même en version resserrée,
  ils font l'essentiel de l'effet GEO.
- **Une accroche sous forme de question** quand c'est possible (la question que taperait un
  prospect) : format très favorable à la reprise par les IA.
- **Un lien vers la page pilier** du site (établissement stable, TVA, contentieux) pour le
  maillage et l'association de domaine. Laisser un repère si le lien exact n'est pas connu.
- **3 à 5 hashtags ciblés** en fin de post.

## Règle d'or du style (reprise de [[redaction-mail]])

Cible : les confrères et les spécialistes de la fiscalité, pas le grand public. On resserre au
maximum et on donne l'info utile à un pair, sans expliquer les notions de base (établissement
stable, direction effective, activité occulte sont supposées connues).

- **Très concis : 600 à 900 caractères, 8 à 12 lignes.** Chaque phrase apporte une information.
- **Précision technique attendue** : nommer les articles (CGI, LPF), la convention applicable,
  les taux de pénalité, le fondement (siège de direction effective, agent dépendant...). C'est
  ce que les spécialistes lisent.
- Phrases courtes, une idée par phrase. Pas de pédagogie, pas de paraphrase de la décision.
- Pas de grandiloquence ("le cœur de notre pratique", "expertise pointue"), pas de promesse de
  certitude fiscale. On montre, on n'affirme pas.
- Accents obligatoires. Aucun tiret cadratin ni demi-cadratin : virgule, deux-points,
  parenthèses, tiret simple.
- Emojis : aucun, ou un seul, sobre. Jamais de ton "growth hacker".

## Structure du post (resserrée)

1. **Accroche technique (1 ligne)** : le point de droit et la décision nommée, avec le mot-clé.
   Seule ligne visible avant "voir plus".
2. **Fait et solution (2 à 4 lignes)** : faits utiles, principe posé, sens de la décision, et
   les références (articles, convention, taux).
3. **Point d'expert (1 à 2 lignes)** : l'angle contentieux ou de défense, la leçon pour un pair.
4. **Signature + lien pilier**.
5. **Hashtags**.

Garder, même en version resserrée, une phrase de principe citable et un court "À retenir"
(2 à 3 puces) : c'est le cœur de l'effet GEO. Seul l'appel à l'action long peut être allégé,
la signature portant alors l'appel implicite. Viser 1200 à 1600 caractères dans ce format.

## Positionnement "gros contentieux"

Quand le sujet s'y prête, employer le langage du fort enjeu, sans exagérer : montants en
millions, groupes internationaux, procédure devant le Conseil d'État, défense de sociétés
étrangères. Objectif : être perçu comme le cabinet des dossiers sérieux, pas seulement un
commentateur. cf. [[projet-geo-visibilite-ia]].

## Format de sortie obligatoire

D'abord le post complet, dans un bloc de code, prêt à copier :

**POST**
```
<de l'accroche aux hashtags>
```

Puis, sous le bloc :
- **Accroche alternative** (une variante de la première ligne, pour tester la portée) dans
  un petit bloc de code.
- **Points à vérifier** : référence et date exactes de la décision, lien vers la bonne page
  pilier, civilité des noms cités le cas échéant.

## Banque réutilisable

**Accroches types**
```
Une filiale en France ne fait pas de vous un contribuable en France.
```
```
Un redressement d'établissement stable n'est pas une fatalité.
```
```
L'administration retient un établissement stable ? La bataille se joue sur la preuve.
```

**Formule d'appel à l'action (en choisir une)**
```
Si votre société étrangère est concernée par un redressement de ce type, c'est le genre de dossier que nous défendons.
```
```
Nous accompagnons les groupes étrangers face à ces requalifications.
```

**Signature (obligatoire)**
```
François Ouairy, avocat associé, Bensaid Avocats
```

**Jeux de hashtags (piocher 3 à 5)**
```
#TVA #EtablissementStable #FiscaliteInternationale #ContentieuxFiscal #DroitFiscal #Fiscalite #ConseildEtat #CJUE
```

## Exemple de référence (version resserrée, établissement stable IS)

**POST**
```
Établissement stable et siège de direction effective : la CAA de Toulouse confirme (11 juin 2026, n° 24TL01418, Mark Holding / Little Marcel).

Siège transféré au Luxembourg en 2013, mais décisions stratégiques prises depuis la France : direction effective en France, imposition à l'IS confirmée. L'immatriculation ne fait pas le siège.

Côté pénalités, la requalification est maintenue mais les manœuvres frauduleuses (80 %) sont écartées au profit du manquement délibéré (40 %). La contestation du taux garde tout son intérêt, même quand l'établissement stable est acquis.

François Ouairy, avocat associé, Bensaid Avocats
bensaid-avocats.fr/domicile-fiscal-etablissement-stable/

#EtablissementStable #FiscaliteInternationale #ContentieuxFiscal #IS
```

**Accroche alternative**
```
Transfert de siège au Luxembourg, direction effective en France : la CAA de Toulouse requalifie en établissement stable (11 juin 2026, Mark Holding).
```

**Points à vérifier** : référence et date exactes (CAA Toulouse, 1re ch., 11 juin 2026,
n° 24TL01418), réalité de la substitution 80 % vers 40 %, lien vers la bonne page pilier.
