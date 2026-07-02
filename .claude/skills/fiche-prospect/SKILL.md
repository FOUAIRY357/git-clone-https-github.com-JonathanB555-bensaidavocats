---
name: fiche-prospect
description: >
  Enquête extensive sur un prospect (personne physique + ses sociétés) avant un rendez-vous
  au cabinet. Produit une fiche de renseignement structurée : identité, sociétés détenues,
  poids financier, contentieux, conformité (PPE/sanctions), points de vigilance, et verdict
  sur l'intérêt du dossier. Déclencher quand l'utilisateur annonce un RDV avec un prospect/client
  et demande une recherche sur la personne ou ses sociétés ("le créateur de X vient nous voir",
  "fais une recherche sur ce prospect", "/fiche-prospect ..."). L'argument peut être un nom,
  une société, un SIREN ou un site web.
---

# Fiche prospect - méthodologie d'enquête pré-RDV

Objectif : livrer une fiche exploitable en RDV, avec un **TL;DR en tête** (qui est la personne,
ce qu'elle pèse, le point de vigilance principal) puis le détail sourcé.

## Phase 1 - Identifier les entités juridiques

Ne jamais se fier au nom commercial : remonter à la raison sociale.

1. **Sites web** : fetcher le site + pages légales (mentions légales, CGV, souvent
   `/content/N-...` sur Prestashop, `/pages/...` sur Shopify). Les CGV contiennent presque
   toujours le SIRET même quand les mentions légales sont introuvables. Si le fetch direct
   échoue, `curl -A "Mozilla/5.0"` puis grep sur `siret|siren|rcs|immatriculée|capital`.
2. **WHOIS** (Bash `whois`) : pour les .fr, l'AFNIC donne le titulaire réel (holder-c),
   très précieux. Pour les .com, voir registrar/parking. Un domaine parqué (parklogic,
   domainnamesales) = ancien site ou erreur de l'utilisateur sur le nom de domaine :
   chercher les variantes proches (ex. neontuning → neotuning).
3. **Wayback Machine** si l'histoire d'un domaine compte :
   `curl "https://web.archive.org/cdx/search/cdx?url=DOMAIN&output=json&limit=20&collapse=timestamp:4"`
   (WebFetch est bloqué sur web.archive.org, passer par curl).
4. Attention aux marques étrangères distribuées en France : le site .fr peut être exploité
   par un distributeur français ≠ le propriétaire de la marque. Vérifier qui détient quoi
   (domaine, marque, exploitation), c'est souvent là que gît le litige.

## Phase 2 - Pappers : la personne et ses sociétés

1. `pappers_sirenisateur` ou `pappers_recherche-entreprises` pour trouver le SIREN
   (si le nom exact échoue, essayer `precision: "approximative"` et les variantes).
2. `pappers_informations-entreprise` sur chaque SIREN avec notamment :
   `representants, beneficiaires_effectifs, finances, finances_estimations, comptes,
   procedures_collectives, publications_bodacc, marques, sites_internet, parcelles_detenues,
   depots_actes, etablissements`.
3. `pappers_recherche-dirigeants` avec le nom complet du dirigeant → **toutes** ses sociétés
   (actives, radiées, EI). Les dates de radiation/création récentes sont des signaux de timing.
4. `pappers_cartographie-entreprise` → liens entre sociétés (détentions croisées).
5. `pappers_conformite-personne-physique` (nom, prénom, date de naissance trouvée dans les
   représentants) → PPE + sanctions. Toujours le faire, toujours le mentionner dans la fiche.
6. `pappers_recherche-decisions-justice` avec `entreprise_siren` → contentieux. Pour les
   décisions récentes/pertinentes, `pappers_details-decision-justice` et lire les motifs
   (noter l'avocat habituel de la cible).

## Phase 3 - Poids financier (même si comptes confidentiels)

- Comptes confidentiels ≠ impasse. Trois bornes :
  - Le **régime de confidentialité** lui-même borne la taille (L. 232-25 al. 1 =
    micro-entreprise : CA < ~900 k€, bilan < ~450 k€, < 10 salariés).
  - `finances_estimations` de Pappers (à présenter comme estimations).
  - Dernier CA public historique (societe.com via WebSearch).
- Croiser avec tranche d'effectif, capital, conventions collectives.
- **Immobilier** : `parcelles_detenues` sur chaque société, puis `pappers_recherche-parcelles`
  avec `parcelle_cadastrale` → historique DVF des ventes (prix et dates réels d'acquisition).
  C'est souvent la donnée patrimoniale la plus dure du dossier.
- Conclure par une fourchette de valorisation et un **verdict honnête** : gros/petit dossier,
  d'où viendront les honoraires, synergie entre bureaux ou non.

## Phase 4 - Restitution

Structure de la fiche :
1. **TL;DR** (3-4 lignes : qui, quoi, combien, vigilance principale).
2. La personne (état civil, adresse, PPE/sanctions).
3. Les sociétés (tableau : entité, SIREN, statut, détail).
4. Poids financier (chiffres + bornes + estimations clairement signalées).
5. Contentieux.
6. ⚠️ Points de vigilance / probable objet du RDV (formuler des questions à poser en RDV).
7. Verdict client.
8. Sources en liens.

Toujours distinguer **fait établi** (registre, DVF, jugement) / **estimation** (Pappers,
WHOIS daté) / **hypothèse** (déductions). Indiquer les premières pièces à demander en RDV
(liasses fiscales, contrats clés).

## Phase 5 - Persistance et diffusion

1. Sauvegarder la fiche en mémoire : `~/.claude/projects/<projet>/memory/dossier-<nom>.md`
   (type: project, description avec l'essentiel) + ligne dans MEMORY.md.
2. Si l'utilisateur le demande, envoyer la note sur Slack (chercher le destinataire avec
   `slack_search_users` ; en cas d'homonymes, demander lequel). Format Slack : markdown,
   < 5000 caractères, TL;DR en tête.
3. Si l'objet du RDV est fiscal, charger le skill d'expertise adapté (fiscaliste,
   notaire, comptable) avant l'analyse, s'il est disponible.

## Réflexes qui ont fait leurs preuves

- Un SIRET dans des CGV vaut mieux que dix recherches Google.
- DBE récemment refaites + EI radiée = le client a déjà commencé à exécuter son projet.
- Vérifier qui détient le domaine vs qui exploite le site : les divergences sont des dossiers.
- Le verdict doit aider à calibrer l'honoraire, pas flatter le prospect.
