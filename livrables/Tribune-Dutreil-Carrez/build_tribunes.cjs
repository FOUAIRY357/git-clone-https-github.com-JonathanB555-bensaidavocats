// Génère les deux versions de la tribune Dutreil (Carrez x Ouairy) en .docx
// et affiche le compte de signes (espaces comprises) de chaque version.
// v3 : dé-lissage. Une seule antithèse conservée par version, séries ternaires
// cassées, exemple chiffré concret, chutes aplaties, intertitre « Ce que nous
// proposons », suppression du passage « chien qui aboie / évaluer, cibler,
// stabiliser ». Les entrées de corps sont une chaîne (paragraphe) ou
// { sub: "..." } (intertitre).
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require("docx");
const fs = require("fs");
const path = require("path");

const OUT = __dirname;

// ---------- VERSION LES ECHOS (~4 000 signes) ----------
const echos = {
  meta: "Projet de tribune, cosignature Gilles Carrez / François Ouairy. Calibrage ~4 000 signes (Les Échos, Le Cercle). Les passages entre crochets sont à la main de M. Carrez. Version 3 du 3 septembre 2026.",
  titre: "Le pacte Dutreil exige huit ans des familles. L'État, lui, ne tient pas huit mois.",
  chapo: null,
  corps: [
    "Le 30 septembre, le projet de loi de finances pour 2027 arrive en Conseil des ministres. Comme chaque automne depuis vingt ans, le pacte Dutreil, cette exonération de 75 % des droits qui permet de transmettre une entreprise familiale sans la vendre pour payer l'impôt, servira de cible. Cette année, les artilleurs disposent d'une munition neuve. La Cour des comptes évalue désormais le coût réel du dispositif à 5,5 milliards d'euros pour 2024, très loin des 800 millions affichés dans les documents budgétaires, et concentré sur une poignée de très grandes transmissions. Le plafonnement de l'avantage figure déjà dans les amendements qui circulent.",
    "Ces chiffres méritent mieux qu'un haussement d'épaules. [L'un de nous fut co-rapporteur de la loi de 2003 qui a créé ce dispositif ; l'autre le met en œuvre chaque semaine, pour des entreprises de toutes tailles.] Ce que la Cour documente est exact. La dépense a plus que quadruplé en quatre ans. Des montages logent dans l'exonération de la trésorerie ou de l'immobilier qui n'ont rien à voir avec l'activité. L'avantage moyen des foyers les mieux servis approche trente millions d'euros. Ces montages doivent sortir du régime. Il y survivra très bien.",
    "Rappelons d'où vient le pacte. Dès 1994, la Commission européenne constatait que des milliers d'entreprises disparaissaient chaque année en Europe, avec leurs emplois, faute d'avoir passé le cap d'une génération, et désignait le droit fiscal parmi les causes. La France taxait alors la transmission en ligne directe jusqu'à 40 %, et à peine une entreprise sur cinq restait familiale, contre plus d'une sur deux en Allemagne. Concrètement, pour une entreprise valorisée vingt millions d'euros et un enfant repreneur, les droits sans pacte sont de l'ordre de huit millions d'euros. Avec un pacte, autour de deux. Personne n'a huit millions sur un compte courant. On emprunte, on ponctionne la trésorerie, ou on vend. Le régime existe pour fermer cette impasse, en échange d'années de conservation des titres et de direction effective.",
    "La loi de finances pour 2026 vient encore de durcir l'exercice. Engagement porté à huit ans au minimum, exclusion explicite des actifs étrangers à l'exploitation. Ces règles ont trois mois. Laissons-les produire leurs effets avant d'en écrire d'autres.",
    "Le vrai problème est plus bête. Les règles ne tiennent pas en place. Un pacte signé aujourd'hui court jusqu'en 2034 ; d'ici là, huit lois de finances, des doctrines administratives qui bougent, une jurisprudence qui n'a toujours pas fixé ce qu'est une holding animatrice, cette société de tête dont dépend l'accès au régime pour des milliers de groupes familiaux. Chaque automne, un plafond circule, un amendement surgit, une suppression se vote en commission avant de disparaître en séance. Les familles, elles, restent engagées.",
    "Que faire ? D'abord ce que les fiscalistes appellent une clause de grand-père. Les règles en vigueur au jour de la signature valent jusqu'au terme du pacte. Cela ne coûte rien au budget. Ensuite un principe simple, 75/0. L'exonération pleine pour l'entreprise réellement transmise et dirigée, rien pour la trésorerie de placement ni l'immobilier de confort. Ce ciblage rapporterait plus qu'un rabot, qui toucherait d'abord les PME. Et une évaluation publique tous les trois ans, chiffres sur la table, seule occasion de retoucher le régime. Entre deux rendez-vous, qu'on le laisse tranquille.",
    "La discussion budgétaire s'ouvre dans quatre semaines. Elle peut corriger les abus et resserrer l'avantage sur l'outil de travail. Elle peut aussi tout remettre en jeu, une fois de plus, pour un rendement incertain. Les chefs d'entreprise trancheront à leur façon, en signant ou en s'abstenant."
  ],
  signature: "Gilles Carrez, ancien rapporteur général du budget, ancien président de la commission des finances de l'Assemblée nationale, et François Ouairy, avocat fiscaliste (BENSAID Avocats)"
};

// ---------- VERSION LE MONDE (~5 000 signes) ----------
const monde = {
  meta: "Projet de tribune, cosignature Gilles Carrez / François Ouairy. Calibrage ~5 000 signes (Le Monde, pages Idées ; le chapô est rédigé par la rédaction ; titre proposé, la rédaction le met entre guillemets). Les passages entre crochets sont à la main de M. Carrez. Version 3 du 3 septembre 2026.",
  titre: "Le pacte Dutreil ne survivra ni au rabot ni au statu quo",
  chapo: null,
  corps: [
    "Le 30 septembre, le projet de loi de finances pour 2027 sera présenté en Conseil des ministres. Le pacte Dutreil, cette exonération de 75 % des droits de mutation qui permet de transmettre une entreprise familiale sans la démanteler pour payer l'impôt, y affrontera son procès annuel. Avec, cette fois, une pièce lourde au dossier. Dans un rapport publié en novembre 2025 avec l'Institut des politiques publiques, la Cour des comptes évalue le coût réel du dispositif à 5,5 milliards d'euros pour 2024, contre 800 millions affichés dans les documents budgétaires, et constate que 1 % des bénéficiaires capte 65 % de l'avantage.",
    { sub: "Ce que la Cour documente" },
    "Nous connaissons ce dispositif de l'intérieur. [L'un de nous fut co-rapporteur de la loi du 1er août 2003 qui l'a créé ; l'autre le met en œuvre chaque semaine, pour des entreprises moyennes comme pour des groupes familiaux.] Ce que la Cour documente est exact. La dépense fiscale a plus que quadruplé en quatre ans. Des montages logent dans l'exonération de la trésorerie ou de l'immobilier sans lien avec l'activité. L'avantage moyen des foyers les mieux servis approche trente millions d'euros. Ces montages doivent sortir du régime. Il y survivra très bien.",
    "Rappelons pourtant d'où vient ce régime. Dès 1994, la Commission européenne constatait que des milliers d'entreprises disparaissaient chaque année en Europe, avec leurs emplois, faute d'avoir passé le cap d'une génération, et désignait le droit fiscal parmi les causes. La France taxait alors la transmission en ligne directe jusqu'à 40 %. Moins d'une entreprise sur cinq restait familiale, contre une sur deux en Allemagne et près de deux sur trois en Italie. L'idée ne vient d'ailleurs d'aucun camp. Le socle du régime est né en 1999 d'un amendement de Didier Migaud, rapporteur général socialiste, avant l'extension de 2003.",
    "L'ordre de grandeur mérite d'être posé. Pour une entreprise valorisée vingt millions d'euros et un enfant repreneur, les droits sans pacte atteignent de l'ordre de huit millions d'euros. Avec un pacte, autour de deux. Personne n'a huit millions sur un compte courant. On emprunte, on ponctionne la trésorerie de l'entreprise, ou on vend. Le régime existe pour fermer cette impasse, en échange d'années de conservation des titres et de direction effective. La loi de finances pour 2026 vient d'ailleurs de durcir l'exercice, engagement porté à huit ans au minimum et exclusion des actifs étrangers à l'exploitation. Ces règles ont trois mois. Qu'on les laisse produire leurs effets, et qu'on les mesure, avant d'en écrire de nouvelles.",
    { sub: "La question de l'équité" },
    "Reste l'objection d'équité, et elle pèse. Une exonération dont 1 % des bénéficiaires capte les deux tiers interroge le consentement à l'impôt, au moment où chacun est appelé à l'effort. Nous la prenons au sérieux. Le rabot uniforme y répond mal. Un plafonnement brutal frapperait d'abord les entreprises moyennes, dont les héritiers n'ont ni la trésorerie pour payer ni l'ingénierie pour s'organiser, quand les très grands patrimoines ont du temps et des conseils pour s'adapter. L'Allemagne exonère l'outil de travail jusqu'à 100 %, contre des engagements contrôlés de maintien de l'emploi. On aimerait que l'automne budgétaire porte sur ce genre de contreparties. Il portera, sauf surprise, sur le taux.",
    "Puis il y a l'instabilité, qui ne figure dans aucun rapport. Un pacte signé aujourd'hui court jusqu'en 2034 ; d'ici là, huit lois de finances, des doctrines qui bougent, une jurisprudence qui n'a toujours pas fixé ce qu'est une holding animatrice, cette société de tête dont dépend l'accès au régime pour des milliers de groupes familiaux. Des transmissions se reportent, des réorganisations se figent. On demande aux familles de tenir huit ans. La règle fiscale, elle, ne tient pas huit mois.",
    { sub: "Ce que nous proposons" },
    "D'abord ce que les fiscalistes appellent une clause de grand-père. Les règles en vigueur au jour de la signature valent jusqu'au terme du pacte, pour tous les pactes en cours. C'est la contrepartie loyale d'un engagement de huit ans, et son coût budgétaire est nul. Ensuite un principe simple, 75/0. L'exonération pleine, sans plafond, pour l'entreprise réellement transmise et dirigée, au besoin assortie d'engagements sur l'emploi. Rien pour la trésorerie de placement ni l'immobilier de confort. Ce ciblage rapporterait davantage qu'une baisse de taux, et il répond à la question d'équité par la structure même du régime. Enfin une évaluation publique et indépendante tous les trois ans, seule occasion de retoucher le dispositif. La matière statistique existe, le travail de la Cour et de l'Institut des politiques publiques vient de le montrer. Il manque le rendez-vous.",
    "La campagne présidentielle promet déjà tout et son contraire sur les successions, suppression en ligne directe d'un côté, imposition minimale des hauts patrimoines de l'autre. Ce que demande le pacte Dutreil tient en peu de mots. Des règles fermes sur ce qu'il couvre. Et dix ans de calme."
  ],
  signature: "Gilles Carrez, ancien rapporteur général du budget, ancien président de la commission des finances de l'Assemblée nationale, et François Ouairy, avocat fiscaliste (BENSAID Avocats)"
};

function signes(v) {
  const parts = [v.titre, v.chapo || "", ...v.corps.map(c => (typeof c === "string" ? c : c.sub))];
  return [...parts.join(" ")].length;
}

function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 200, before: opts.before || 0 },
    children: [new TextRun({
      text,
      font: "Times New Roman",
      size: opts.size || 24,
      bold: !!opts.bold,
      italics: !!opts.italics,
      color: opts.color || "000000"
    })]
  });
}

function buildDoc(v) {
  const children = [];
  children.push(para(v.meta, { align: AlignmentType.LEFT, size: 18, italics: true, color: "808080" }));
  children.push(para(v.titre, { align: AlignmentType.LEFT, size: 28, bold: true }));
  if (v.chapo) children.push(para(v.chapo, { align: AlignmentType.LEFT, italics: true }));
  v.corps.forEach(p => {
    if (typeof p === "string") children.push(para(p));
    else children.push(para(p.sub, { align: AlignmentType.LEFT, bold: true, before: 160 }));
  });
  children.push(para(v.signature, { align: AlignmentType.LEFT, italics: true }));
  return new Document({ sections: [{ children }] });
}

(async () => {
  console.log("Signes (titre + intertitres + corps, hors signature) :");
  console.log("  Version Les Échos :", signes(echos));
  console.log("  Version Le Monde  :", signes(monde));
  for (const [v, name] of [[echos, "Tribune-Dutreil_Version-Echos_4000-signes.docx"], [monde, "Tribune-Dutreil_Version-Le-Monde_5000-signes.docx"]]) {
    const buf = await Packer.toBuffer(buildDoc(v));
    fs.writeFileSync(path.join(OUT, name), buf);
    console.log("Écrit :", name);
  }
})();
