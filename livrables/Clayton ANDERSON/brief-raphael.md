# Brief de délégation - dossier ANDERSON

Destinataire : Raphaël. Émetteur : François Ouairy. 31 août 2026.

## 1. Le dossier en bref
Clayton ANDERSON, ressortissant américain, résident fiscal français depuis le 16 novembre 2020,
domicilié 32 rue de l'Ourcq, 75019 Paris, 06 31 11 51 74.

Salarié de **BWH Development**, S-Corp américaine (Austin, EIN 81-4878445) immatriculée en France
comme société étrangère sans établissement, SIRET 90981200000018, URSSAF firmes étrangères. Il en
détient **6,04 %** et y est directeur de l'ingénierie depuis le 21 mars 2022. Avant cela il
travaillait chez Datadog, d'où ses RSU.

Mission : régularisation des millésimes **2020 à 2024**. Le millésime 2025 est en ordre.
Convention signée, temps 1 réglé le 31 août. Honoraires 13 500 € HT en quatre temps.

## 2. À lire avant toute chose, et à ne pas refaire
Dans `livrables/Clayton ANDERSON/` du dépôt :
- `analyse-pieces-drive-2026-08-28.md`, avec la section de corrections du 29 août ;
- `echanges-dgfip-analyse.md`, la chronologie complète avec le SIP Paris 19e ;
- `proposition-mission.md`, le périmètre et les honoraires ;
- `Convention d'honoraires - Clayton ANDERSON.txt`.

Les pièces du client sont sur le Drive du cabinet, dossier `CLAYTON/Bensaid/`, et dans son Dropbox
partagé, qu'il alimente encore. Refaire une copie datée du Dropbox avant de commencer.

## 3. Ce qu'il faut produire

### Livrable 1, urgent, avant le 6 septembre
Le message à déposer dans la **demande n° 1233188128** du SIP Paris 19e. Il répond à la demande du
26 mai, à savoir le report des montants portés en rubrique 6 des 2047 vers la rubrique 2, et
annonce une soumission complète à venir sur les millésimes antérieurs, **sans aucun chiffre**.
Rédigé à la voix du client, qui le dépose lui-même dans sa messagerie sécurisée.

### Livrable 2, le chiffrage, cœur du temps 2
Un tableau par millésime de 2020 à 2024, portant pour chaque année les comptes détenus et leur
solde maximal, les revenus de source étrangère par nature, les gains d'acquisition de RSU, puis
l'impôt en principal, les prélèvements sociaux, les intérêts de retard, les majorations et les
amendes, en hypothèse haute et en hypothèse basse.

Accompagné d'une note de synthèse de trois pages, arrêtant la stratégie et le calendrier.

### Livrable 3
Les projets de déclarations rectificatives de 2020 à 2022, et les 2047 corrigées de 2023 à 2025.

## 4. Les cinq points techniques à instruire

**a) La qualification de la S-Corp.** Le client a porté ses distributions en rubrique 6 des 2047,
comme revenus exonérés : 31 000 $ en 2023, 47 700 $ en 2024, 67 222 $ en 2025. Le service a écrit
le 26 mai qu'il s'agit de dividendes imposables en France, à porter en ligne 210 et lignes
221/222 puis en 2DC, la double imposition étant éliminée par un crédit d'impôt égal à l'impôt
français. Vérifier cette position au regard de la convention franco-américaine du 31 août 1994.
Vérifier aussi si la quote-part d'ordinary business income du K-1 (76 205 $ en 2025) reste hors
champ, la S-Corp étant opaque en droit français.

**b) Les taux de change.** Le client a retenu la moyenne mensuelle de décembre publiée par la
Banque de France : 1,0903 en 2023, 1,0479 en 2024, 1,1709 en 2025. L'arithmétique est juste, la
méthode est contestable, le principe étant la conversion à la date d'encaissement. Vérifier les
taux avec l'outil `taux_change` et recalculer selon la méthode retenue.

**c) Les gains d'acquisition des RSU Datadog**, poste le plus lourd et le plus discret. Les dates
d'attribution et d'acquisition figurent dans `Travail/Datadog`, fichiers
`3139_Anderson_2022_RSU.pdf` et `3139_Clayton_ANDERSON_Annual_Statement_2021_RSU.pdf`. Le plus
ancien relevé ETrade est de janvier 2022, cohérent avec une première acquisition douze mois après
son entrée fin 2020. Établir le régime des attributions gratuites d'actions étrangères et
ventiler le gain selon la résidence aux dates d'attribution et d'acquisition définitive. Ces gains
n'apparaissent dans aucune déclaration ni dans aucun échange avec le service.

**d) Les comptes et l'amende.** Dix comptes, neuf bancaires ou de titres plus Coinbase. Deux
points d'attention. Le compte **Wise**, ouvert le 25 novembre 2020, est sans activité jusqu'en
2022 : il reste à déclarer, l'article 1649 A du CGI visant les comptes ouverts, détenus, utilisés
ou clos. Le **401(k) Vanguard** n'a aucun relevé avant 2023, à reconstituer ou à traiter comme une
inconnue. Chiffrer l'amende de 1 500 € par compte et par année de l'article 1736, IV, 2, en
retenant pour chaque année les seuls comptes alors existants.

**e) Le bouclier de l'article L. 80 B du LPF.** Le client a interrogé le service par écrit le
18 avril, en mentionnant expressément 2020 à 2024, et le service a répondu le 21 avril que seules
les deux dernières années plus 2026 pouvaient être reprises. Instruire si cette réponse constitue
une prise de position formelle sur l'appréciation d'une situation de fait. Chercher la
jurisprudence relative aux réponses délivrées par la messagerie sécurisée.

## 5. Les pièges du dossier
- **Rien ne part à l'administration sans validation de François.** Le client a déjà écrit seul et
  figé par écrit une qualification erronée.
- **Le client répond de mémoire et se trompe.** Trois de ses affirmations ont été démenties par
  ses propres pièces, notamment l'absence de conseil américain et le dossier Datadog prétendument
  documenté. Tout vérifier sur pièces.
- **Aucun engagement sur le droit américain.** Périmètre français, coordination seulement.
- Sa démarche spontanée du 18 avril est l'atout du dossier. Ne rien faire qui l'abîme, en
  particulier une régularisation partielle présentée comme complète.

## 6. Comment fonctionne le MCP Bensaid

Le MCP expose les outils du cabinet dans la session. Les noms sont préfixés `Bensaid_MCP`.

### Le fond, d'abord
`paperasse_skill(name)` charge une expertise complète avant de répondre. Pour ce dossier,
`fiscaliste` couvre l'IR, les RSU et les BSPCE, les prélèvements sociaux et les revenus
étrangers ; `controleur-fiscal` simule un redressement avec chefs et base légale, utile pour
l'hypothèse haute. **Ne jamais répondre de mémoire sur le fond fiscal.**

### La vérité juridique
- `legifrance_get_article_by_num(code, article)` pour un article précis, par exemple
  `("Code général des impôts", "1736")`. Lire le texte jusqu'au bout, les dérogations sont dans
  les derniers alinéas.
- `legifrance_search(recherche, fond)` quand le numéro est inconnu, fond `CODE_DATE` pour les
  codes en vigueur, `LODA_DATE` pour les lois et décrets.
- `bofip_search` et `bofip_get` pour la doctrine administrative.
- `judilibre_search` pour la jurisprudence judiciaire, `eurlex_search` pour le droit de l'Union.

**Règle absolue : toute référence est vérifiée avant citation.** C'est ainsi que nous avons
découvert que la majoration de l'article 1758 du CGI est passée à 40 % avec la loi n° 2026-534 du
25 juin 2026, alors que la mémoire disait 80 %.

### Les pièces du dossier
Le chaînage est en deux temps. `drive_search(query, name_only)` ou `drive_semantic_search` pour
trouver le fichier et récupérer son `id`, puis `drive_read(file_id)`. Pour un Google Doc le texte
revient directement ; pour un PDF, une image ou un fichier Office, `drive_read` renvoie une **URL
temporaire** valable sept jours, qu'il faut passer à `document_read(url, instructions)` pour l'OCR.

`document_read` accepte des instructions ciblées, et c'est là qu'il devient puissant. Plutôt que
de demander le texte intégral d'une liasse, demander l'extraction utile, par exemple
« extrais le pourcentage de détention, l'ordinary business income de la case 1 et les
distributions de la case 16 code D ».

Le compte de service ne voit que les dossiers partagés avec lui. Un résultat vide signifie
souvent un défaut de partage, non une absence de pièce.

### Le calcul
- `taux_change` et `taux_fred` pour les taux de change et les séries économiques.
- `openfisca_calculate`, `openfisca_parameter` et `openfisca_variable` pour simuler l'impôt sur le
  revenu d'un foyer, utile au chiffrage millésime par millésime.

### Les sociétés
`pappers_informations-entreprise`, `pappers_comptes-entreprise`, `pappers_cartographie-entreprise`
et `rne_company` pour une société française. Pour BWH Development, société étrangère non
immatriculée au RCS, ces outils ne renverront rien d'utile : s'en tenir à l'avis de situation
Insee versé au dossier.

## 7. Les skills du cabinet à utiliser
- `charte-cabinet` avant tout écrit. Elle prévaut sur les autres skills. Accents obligatoires,
  aucun tiret cadratin, aucune antithèse en miroir, aucune injonction au destinataire.
- `redaction-mail` pour tout mail, avec son renderer
  (`python3 .claude/skills/redaction-mail/render_mail.py spec.json sortie.html`), qui contrôle
  automatiquement les marqueurs interdits.
- `template-cabinet` pour la note de synthèse au gabarit du cabinet.
- `courrier` pour un écrit adressé à l'administration sur papier à en-tête.
- `fiche-sellsy` pour la facturation des temps suivants.

Tout livrable se range dans `livrables/Clayton ANDERSON/` et se pousse sur une branche du dépôt.
