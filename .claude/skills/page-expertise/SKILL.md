---
name: page-expertise
description: Crée une page d'expertise au design "corridor" sur le site WordPress bensaid-avocats.fr (titre serif, sommaire latéral, sections numérotées, FAQ + schema, CTA), et la publie EN BROUILLON via l'API REST WordPress. Déclencher quand l'utilisateur veut créer/ajouter une page d'expertise, un pôle, un article corridor, ou "une page comme Genève". Argument = le sujet (ex: "fiscalité des SCPI pour non-résidents").
---

# Skill : page-expertise (pages corridor Bensaid Avocats)

Objectif : rendre François autonome pour créer des pages d'expertise au design "corridor"
du cabinet, sans dépendre de Jonathan, en publiant via l'API REST WordPress.

## Prérequis (vérifié une fois)
- Le modèle de page **"Corridor"** existe dans le thème (`page-corridor.php`), créé par Jonathan.
  Il charge le CSS corridor + Cormorant Garamond, et rend le contenu HTML brut (sans wpautop)
  dans `<main class="ba-art ba-expertise">`. La valeur `template` côté API = `page-corridor.php`.
- Accès WordPress : être connecté à `https://www.bensaid-avocats.fr/wp-admin/` dans Chrome
  (utiliser l'outil Claude in Chrome). Les écritures REST utilisent `X-WP-Nonce: wpApiSettings.nonce`
  depuis une page d'admin (le tableau de bord `/wp-admin/index.php` expose le nonce et est léger ;
  éviter l'éditeur Gutenberg qui peut geler l'exécution JS).

## Règles de contenu (IMPÉRATIF)
- **Aucun tiret cadratin (-) ni demi-cadratin (-)**. Utiliser virgule, deux-points, parenthèses,
  tiret simple collé (ex: "France-USA", "France-États-Unis"), ou middot `&middot;`.
  Ne jamais écrire " - " (espace tiret espace) : risque de conversion automatique en tiret long.
- **Vérité juridique** : baliser chaque référence (CGI, BOFiP, jurisprudence) et lister en fin de
  réponse les points à faire valider par François AVANT publication. Toujours publier en `draft`.
- Préfixe de classes : réutiliser EXACTEMENT les classes du thème (`ba-art-hero`, `ba-sommaire`,
  `ba-section`, `ba-h2`, `ba-faq`, `ba-final-card`, etc.). Ne jamais inventer de classes `ba-*`
  (collision avec le framework du cabinet) ni de `<style>` maison.
- Contenu HTML brut (le modèle Corridor n'applique pas wpautop). Pas de Markdown.

## Procédure
1. Clarifier avec l'utilisateur : sujet, mot-clé cible, 4 à 7 sections, FAQ (4-5 Q/R),
   pages connexes (slugs réels du site).
2. Générer le HTML corridor à partir du gabarit ci-dessous (adapter sommaire/ancres/sections).
3. Publier via REST (Claude in Chrome, depuis /wp-admin/index.php) :
   `POST /wp-json/wp/v2/pages` avec `{title, slug, status:'draft', content, template:'page-corridor.php'}`.
   En-tête `X-WP-Nonce: wpApiSettings.nonce`, `credentials:'same-origin'`.
   Pour gros contenu, passer par base64 (atob + TextDecoder) pour éviter les soucis d'échappement.
4. Vérifier le rendu via l'aperçu `/?page_id=<ID>&preview=true` : 1 seul H1, 0 tiret long,
   sommaire et CTA présents.
5. Rendre à l'utilisateur : lien éditer + aperçu, liste des références juridiques à valider,
   rappel de régler Yoast (focus keyphrase, titre, meta, déjà suggérés dans le commentaire d'en-tête).

## Gabarit HTML corridor (contenu de la page, sans le wrapper <main> fourni par le modèle)
```html
<!--
  Title tag: {{TITLE_SEO}}
  Meta description: {{META}}
  Focus keyword: {{KEYWORD}}
  Slug: {{SLUG}}
-->
<section class="ba-section-breadcrumb"><div class="ba-art-container">
  <nav class="ba-page-breadcrumb" aria-label="Fil d'ariane">
    <a href="/" data-hover>Accueil</a>
    <span class="ba-page-breadcrumb-sep" aria-hidden="true">&rsaquo;</span>
    <a href="{{PARENT_URL}}" data-hover>{{PARENT_LABEL}}</a>
    <span class="ba-page-breadcrumb-sep" aria-hidden="true">&rsaquo;</span>
    <span aria-current="page">{{TITRE_COURT}}</span>
  </nav>
</div></section>

<section class="ba-art-hero ba-art-hero-with-aside"><div class="ba-art-container">
  <div class="ba-hero-grid">
    <div class="ba-hero-main">
      <div class="ba-eyebrow">{{EYEBROW}}</div>
      <h1 class="ba-art-hero-title"><span class="accent">{{H1_ACCENT}}</span> {{H1_SUITE}}</h1>
      <p class="ba-art-hero-lede">{{LEDE}}</p>
      <div class="ba-art-hero-actions">
        <a class="ba-btn ba-btn-primary" href="/contact/">{{CTA_PRIMAIRE}} <span class="ba-arrow" aria-hidden="true">&rarr;</span></a>
      </div>
      <div class="ba-art-hero-trust">Echange confidentiel &middot; Reponse sous 24 h ouvrees &middot; Honoraires annonces avant intervention</div>
    </div>
    <aside class="ba-sommaire ba-sommaire-aside">
      <div class="ba-sommaire-label">Sommaire</div>
      <ul class="ba-sommaire-list">
        <!-- répéter par section -->
        <li><a href="#{{ANCRE}}"><span class="ba-sommaire-num">01</span><span class="ba-sommaire-name">{{NOM_SECTION}}</span><span class="ba-sommaire-arrow" aria-hidden="true">&rarr;</span></a></li>
      </ul>
    </aside>
  </div>
</div></section>

<nav class="ba-art-anchornav" aria-label="Navigation de la page"><div class="ba-art-container">
  <ul class="ba-chiplist">
    <li><a href="#{{ANCRE}}" class="ba-chip">{{CHIP}}</a></li>
  </ul>
</div></nav>

<!-- répéter par section -->
<section id="{{ANCRE}}" class="ba-section"><div class="ba-art-container">
  <div class="ba-eyebrow">{{NN}}</div>
  <h2 class="ba-h2">{{TITRE_SECTION}}</h2>
  <p>{{PARAGRAPHE}}</p>
  <ul class="ba-check-list"><li>{{PUCE}}</li></ul>
</div></section>

<section id="faq" class="ba-section ba-section-faq"><div class="ba-art-container">
  <header class="ba-section-head ba-section-head-centered">
    <div class="ba-eyebrow">Questions frequentes</div>
    <h2 class="ba-h2">{{TITRE_FAQ}}</h2>
  </header>
  <div class="ba-faq">
    <details class="ba-faq-item" open><summary><span class="ba-faq-q">{{Q}}</span></summary>
      <div class="ba-faq-a"><p>{{R}}</p></div></details>
  </div>
</div></section>

<section class="ba-section ba-section-finalcta"><div class="ba-art-container">
  <div class="ba-final-card">
    <h2 class="ba-final-title">{{CTA_TITRE}}</h2>
    <p class="ba-final-body">{{CTA_TEXTE}}</p>
    <div class="ba-art-hero-actions">
      <a class="ba-btn ba-btn-primary" href="/contact/">Demander un rendez-vous <span class="ba-arrow" aria-hidden="true">&rarr;</span></a>
    </div>
  </div>
</div></section>

<section id="voir-aussi" class="ba-section"><div class="ba-art-container">
  <div class="ba-eyebrow">Voir aussi</div>
  <div class="ba-grid-cards ba-grid-2">
    <a class="ba-card" href="{{SLUG_CONNEXE}}"><h3 class="ba-card-title">{{TITRE_CONNEXE}}</h3></a>
  </div>
</div></section>

<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"{{Q}}","acceptedAnswer":{"@type":"Answer","text":"{{R}}"}}
]}
</script>
```

## Notes
- Si le modèle "Corridor" n'existe pas encore (Jonathan pas encore intervenu), prévenir
  l'utilisateur : la page se créera mais sans le style corridor tant que le modèle n'est pas en place.
- Référence vivante de structure : page Genève `/avocat-fiscaliste-geneve/` (mêmes classes).
- Pages connexes utiles (slugs réels) : `/fiscalite-non-residents/`,
  `/preparer-son-expatriation-fiscale/`, `/declarer-comptes-bancaires-a-letranger/`,
  `/avocat-fiscaliste-geneve/`, `/fiscalite-immobiliere/`, `/droit-et-fiscalite-de-lart/`.
