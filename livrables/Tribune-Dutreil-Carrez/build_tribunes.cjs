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
  meta: "Projet de tribune, cosignature Gilles Carrez / François Ouairy. Version courte ~4 500 signes. Les passages entre crochets sont à votre main. Version 9 du 4 septembre 2026.",
  titre: "Pacte Dutreil : ni rabot ni statu quo",
  chapo: null,
  corps: [
    "Le 30 septembre, le projet de loi de finances pour 2027 arrive en Conseil des ministres. Comme chaque automne depuis vingt ans, le pacte Dutreil, cette exonération de 75 % des droits qui permet de transmettre une entreprise familiale sans la vendre pour payer l'impôt, servira de cible. Cette année, les artilleurs disposent d'une munition neuve. La Cour des comptes évalue désormais la dépense fiscale à 5,5 milliards d'euros pour 2024, très au-dessus des 800 millions retenus jusque-là dans les documents budgétaires, et concentrée sur une poignée de très grandes transmissions. Le plafonnement de l'avantage figure déjà dans les amendements qui circulent.",
    "Ces chiffres méritent mieux qu'un haussement d'épaules. [L'un de nous fut co-rapporteur de la loi de 2003 qui a créé ce dispositif ; l'autre le met en œuvre chaque semaine, pour des entreprises de toutes tailles.] Ce que la Cour documente est exact. La dépense a plus que quadruplé en quatre ans. Des montages logent dans l'exonération de la trésorerie ou de l'immobilier qui n'ont rien à voir avec l'activité. L'avantage moyen des 1 % de bénéficiaires les mieux servis approche trente millions d'euros. Ces montages doivent sortir du régime. Il y survivra très bien.",
    "Rappelons d'où vient le pacte. En 1994, le laboratoire UPSA, fleuron familial d'Agen, passait sous pavillon américain cinq ans après la mort de son dirigeant, droits de succession et ISF aidant. La France taxait alors la ligne directe jusqu'à 40 %, et à peine une entreprise sur cinq restait familiale, contre plus d'une sur deux en Allemagne. Yvon Gattaz conçoit alors le pacte d'actionnaires ; Didier Migaud, rapporteur général socialiste, l'inscrit dans la loi de finances pour 2000, un abattement de 50 % sur les successions en échange d'un engagement de conservation. La loi Dutreil de 2003 l'étend aux donations, la loi PME du 2 août 2005 porte l'abattement à 75 %. Le dispositif a été créé sous un gouvernement de gauche, puis étendu et porté à 75 % par la droite. Personne ne l'a remis en cause depuis. Concrètement, pour une entreprise valorisée vingt millions d'euros et un enfant repreneur, les droits au décès, sans pacte, sont de l'ordre de huit millions d'euros. Avec un pacte, ils retombent autour de deux millions. Personne n'a huit millions sur un compte courant. Les héritiers empruntent, ponctionnent la trésorerie, ou vendent.",
    "Le législateur vient encore de durcir l'exercice. L'engagement est porté à huit ans au total, et les résidences, yachts et autres biens de confort logés dans les sociétés sortent de l'assiette exonérée. Ces règles ont quelques mois. Personne n'en a mesuré les effets. En écrire de nouvelles dès cet automne, c'est légiférer à l'aveugle.",
    "Le vrai problème est plus bête. Les règles ne tiennent pas en place. Un pacte signé aujourd'hui court jusqu'en 2034 ; d'ici là, huit lois de finances, des doctrines administratives qui bougent, les contours encore discutés de la holding animatrice, cette société de tête dont dépend l'accès au régime pour des milliers de groupes familiaux. Chaque automne, un plafond circule, un amendement surgit, une suppression se vote en commission avant de disparaître en séance. Les familles, elles, restent engagées. L'État leur demande de tenir huit ans ; la règle fiscale ne tient pas huit mois.",
    "Que faire ? Il ne faut ni raboter ni sanctuariser. Le rabot punirait les PME sans fermer un seul montage ; le statu quo laisserait prospérer ce que la Cour documente. D'abord, ce que les fiscalistes appellent une clause de grand-père. Un pacte signé est un contrat, et un contrat oblige les deux parties. Les familles tiennent huit ans ; l'État tient les règles en vigueur au jour de la signature, jusqu'au terme. Cela ne coûte rien au budget. Pour les pactes nouveaux, la loi fixe ses conditions et le taux de 75 % est maintenu. Ensuite, achever le ciblage. La loi écarte désormais de l'exonération les résidences, les yachts ou les œuvres d'art logés dans les sociétés. Elle ne dit toujours rien de la trésorerie de placement ni de l'immobilier de rapport. Le même mécanisme, étendu à ces actifs, donnerait au régime sa forme aboutie, 75 % sans plafond pour l'outil professionnel, rien pour le reste. Ce ciblage rapporterait plus qu'un rabot. Et une évaluation publique tous les trois ans, chiffres sur la table, seule occasion de retoucher le régime. Entre deux rendez-vous, le régime ne bouge pas.",
    "La discussion budgétaire s'ouvre dans quatre semaines. Elle peut corriger les abus et resserrer l'avantage sur l'outil de travail. Elle peut aussi tout remettre en jeu, une fois de plus, pour un rendement incertain. Les chefs d'entreprise trancheront à leur façon, en signant ou en s'abstenant."
  ],
  signature: "Gilles Carrez, ancien rapporteur général du budget, ancien président de la commission des finances de l'Assemblée nationale, et François Ouairy, avocat fiscaliste (BENSAID Avocats)"
};

// ---------- VERSION LE MONDE (~5 000 signes) ----------
const monde = {
  meta: "Projet de tribune, cosignature Gilles Carrez / François Ouairy. Version longue ~5 500 signes (le chapô sera rédigé par la rédaction). Les passages entre crochets sont à votre main. Version 9 du 4 septembre 2026.",
  titre: "Pacte Dutreil : ni rabot ni statu quo",
  chapo: null,
  corps: [
    "Le 30 septembre, le projet de loi de finances pour 2027 sera présenté en Conseil des ministres. Le pacte Dutreil, cette exonération de 75 % des droits de mutation qui permet de transmettre une entreprise familiale sans la démanteler pour payer l'impôt, y affrontera son procès annuel. Dans un rapport publié en novembre 2025 avec l'Institut des politiques publiques, la Cour des comptes évalue la dépense fiscale à 5,5 milliards d'euros pour 2024, très au-dessus des 800 millions retenus jusque-là dans les documents budgétaires, et constate que 1 % des bénéficiaires capte 65 % de l'avantage.",
    { sub: "Ce que la Cour documente" },
    "Nous connaissons ce dispositif de l'intérieur. [L'un de nous fut co-rapporteur de la loi du 1er août 2003 qui l'a créé ; l'autre le met en œuvre chaque semaine, pour des entreprises moyennes comme pour des groupes familiaux.] Ce que la Cour documente est exact. La dépense fiscale a plus que quadruplé en quatre ans. Des montages logent dans l'exonération de la trésorerie ou de l'immobilier sans lien avec l'activité. L'avantage moyen des 1 % de bénéficiaires les mieux servis approche trente millions d'euros. Ces montages doivent sortir du régime. Il y survivra très bien.",
    "Rappelons d'où vient ce régime. En 1994, le laboratoire UPSA, fleuron familial d'Agen, passait sous pavillon américain cinq ans après la mort de son dirigeant, droits de succession et ISF aidant. La France taxait alors la transmission en ligne directe jusqu'à 40 %, et moins d'une entreprise sur cinq restait familiale, contre une sur deux en Allemagne. Yvon Gattaz et les entreprises familiales conçoivent alors le pacte d'actionnaires ; Didier Migaud, rapporteur général socialiste, l'inscrit dans la loi de finances pour 2000, un abattement de 50 % sur les successions en échange d'un engagement collectif de conservation. La loi Dutreil du 1er août 2003 l'étend aux donations. La loi PME du 2 août 2005 porte l'abattement à 75 %. Le dispositif a été créé sous un gouvernement de gauche, puis étendu par la droite. Nicolas Sarkozy l'a assoupli, François Hollande l'a maintenu intact, et il a encore été simplifié en 2019. Depuis 1999, quatre présidents se sont succédé sans jamais le remettre en cause. L'idée s'était imposée à tous.",
    "L'ordre de grandeur mérite d'être posé. Pour une entreprise valorisée vingt millions d'euros et un enfant repreneur, les droits au décès, sans pacte, atteignent de l'ordre de huit millions d'euros. Avec un pacte, ils retombent autour de deux millions. Personne n'a huit millions sur un compte courant. Les héritiers empruntent, ponctionnent la trésorerie de l'entreprise, ou vendent. Le législateur vient d'ailleurs de durcir l'exercice. L'engagement est porté à huit ans au total, et les résidences, yachts ou œuvres d'art logés dans les sociétés sortent de l'assiette exonérée. Ces règles ont quelques mois. Personne n'en a mesuré les effets. En écrire de nouvelles dès cet automne, c'est légiférer à l'aveugle.",
    { sub: "La question de l'équité" },
    "Reste l'objection d'équité, et elle pèse. Une exonération dont 1 % des bénéficiaires capte les deux tiers interroge le consentement à l'impôt, au moment où chacun est appelé à l'effort. Le rabot uniforme y répond mal. Un plafonnement brutal frapperait d'abord les entreprises moyennes, dont les héritiers n'ont ni la trésorerie pour payer ni l'ingénierie pour s'organiser, quand les très grands patrimoines ont du temps et des conseils pour s'adapter. L'Allemagne exonère l'outil de travail jusqu'à 100 %, contre des engagements contrôlés de maintien de l'emploi. On aimerait que l'automne budgétaire porte sur ce genre de contreparties. Il portera, sauf surprise, sur le taux.",
    "Puis il y a l'instabilité. Un pacte signé aujourd'hui court jusqu'en 2034 ; d'ici là, huit lois de finances, des doctrines qui bougent, les contours encore discutés de la holding animatrice, cette société de tête dont dépend l'accès au régime pour des milliers de groupes familiaux. Des transmissions se reportent, des réorganisations se figent. L'État demande aux familles de tenir huit ans. La règle fiscale, elle, ne tient pas huit mois.",
    { sub: "Ce que nous proposons" },
    "Il ne faut ni raboter ni sanctuariser. Le rabot frapperait à côté ; le statu quo laisserait prospérer ce que la Cour documente. D'abord, ce que les fiscalistes appellent une clause de grand-père. Un pacte signé est un contrat, et un contrat oblige les deux parties. Les familles tiennent huit ans ; l'État doit tenir les règles en vigueur au jour de la signature, jusqu'au terme, pour tous les pactes en cours. Son coût budgétaire est nul. Aux pactes nouveaux, la loi fixera les conditions qu'elle voudra, et le taux de 75 % sera maintenu. Ensuite, achever le ciblage. La loi écarte désormais de l'exonération les résidences, les yachts ou les œuvres d'art logés dans les sociétés. Elle ne dit toujours rien de la trésorerie de placement ni de l'immobilier de rapport. Le même mécanisme, étendu à ces actifs, donnerait au régime sa forme aboutie, 75 % sans plafond pour l'outil professionnel réellement transmis et dirigé, au besoin assorti d'engagements sur l'emploi, rien pour le reste. Ce ciblage rapporterait davantage qu'une baisse de taux, et il répond à la question d'équité par la structure même du régime. Enfin une évaluation publique et indépendante tous les trois ans, seule occasion de retoucher le dispositif. La matière statistique existe, le travail de la Cour et de l'Institut des politiques publiques vient de le montrer. Il manque le rendez-vous.",
    "La campagne présidentielle promet déjà tout et son contraire sur les successions. Ce que demande le pacte Dutreil tient en peu de mots. Il lui faut des règles fermes sur ce qu'il couvre, et dix ans de calme."
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
  for (const [v, name] of [[echos, "Tribune-Dutreil_Version-courte_4000-signes.docx"], [monde, "Tribune-Dutreil_Version-longue_5000-signes.docx"]]) {
    const buf = await Packer.toBuffer(buildDoc(v));
    fs.writeFileSync(path.join(OUT, name), buf);
    console.log("Écrit :", name);
  }
})();
