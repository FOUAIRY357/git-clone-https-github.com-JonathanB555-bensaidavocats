// Génère les deux versions de la tribune Dutreil (Carrez x Ouairy) en .docx
// et affiche le compte de signes (espaces comprises) de chaque version.
// v2 : phrase pré-2003 sourcée, passages Carrez entre crochets, format Le Monde
// (4 000-5 000 signes, intertitres, chapô supprimé), triptyque saillant.
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require("docx");
const fs = require("fs");
const path = require("path");

const OUT = __dirname;

// Les entrées de corps peuvent être une chaîne (paragraphe) ou { sub: "..." } (intertitre).

// ---------- VERSION LES ECHOS (~4 000 signes) ----------
const echos = {
  meta: "Projet de tribune, cosignature Gilles Carrez / François Ouairy. Calibrage ~4 000 signes (Les Échos, Le Cercle). Les passages entre crochets sont à la main de M. Carrez. 3 septembre 2026.",
  titre: "Le pacte Dutreil exige huit ans des familles. L'État, lui, ne tient pas huit mois.",
  chapo: null,
  corps: [
    "Le 30 septembre, le projet de loi de finances pour 2027 arrive en Conseil des ministres. Comme chaque automne depuis vingt ans, le pacte Dutreil, cette exonération de 75 % des droits qui permet de transmettre une entreprise familiale sans la vendre pour payer l'impôt, servira de cible. Cette année, les artilleurs disposent d'une munition neuve. La Cour des comptes évalue désormais le coût réel du dispositif à 5,5 milliards d'euros pour 2024, très loin des 800 millions affichés dans les documents budgétaires, et concentré sur une poignée de très grandes transmissions. Le plafonnement de l'avantage figure déjà dans les amendements qui circulent.",
    "Ces chiffres méritent mieux qu'un haussement d'épaules. [L'un de nous fut co-rapporteur de la loi de 2003 qui a créé ce dispositif ; l'autre le met en œuvre chaque semaine, pour des entreprises de toutes tailles.] Nous n'avons aucun intérêt à nier ce que la Cour documente, une dépense fiscale multipliée par plus de quatre en quatre ans, des montages qui logent dans l'exonération de la trésorerie ou de l'immobilier étrangers à l'activité, un avantage très concentré. Qui veut sauver la transmission doit commencer par combattre ces dérives.",
    "Rappelons pourquoi ce pacte existe. Dès 1994, la Commission européenne constatait que des milliers d'entreprises disparaissaient chaque année en Europe, avec leurs emplois, faute d'avoir surmonté le passage d'une génération à l'autre, et désignait le droit fiscal parmi les causes. La France taxait alors la transmission en ligne directe jusqu'à 40 %, et à peine une entreprise sur cinq restait familiale, contre plus d'une sur deux en Allemagne. Pour payer des droits assis sur une valeur détenue en titres, les héritiers vendaient, à un concurrent ou à un fonds, et l'ancrage local disparaissait avec eux. Le pacte a corrigé cela, sous une condition exigeante, conserver les titres et diriger l'entreprise pendant des années. La loi de finances pour 2026 vient encore de durcir l'exercice, avec un engagement porté à huit ans au minimum et l'exclusion explicite des actifs étrangers à l'exploitation. Ces règles ont trois mois. Laissons-les produire leurs effets avant d'en écrire d'autres.",
    "La maladie française se loge ailleurs, dans l'instabilité. Un dirigeant qui signe un pacte aujourd'hui s'engage jusqu'en 2034. Sur cette période, il traversera huit lois de finances, autant de doctrines administratives et une jurisprudence mouvante jusque sur des notions aussi centrales que la holding animatrice. Au contentieux, des redressements lourds se jouent sur des définitions que la loi n'a jamais arrêtées. Chaque automne, un plafond circule, un amendement surgit, une suppression se vote en commission avant de disparaître en séance. Les familles, elles, restent engagées. On demande aux familles un engagement de huit ans que l'État se montre incapable de tenir huit mois. L'insécurité juridique décourage la transmission plus sûrement que l'impôt.",
    "Trois décisions mettraient fin à ce désordre, et chacune tient en un mot. La clause de grand-père : tout pacte signé reste régi, pendant toute sa durée, par les règles en vigueur au jour de sa signature. Coût budgétaire nul. Le 75/0 : 75 % d'exonération, sans plafond, pour l'outil productif réellement transmis et dirigé, zéro pour la trésorerie de placement et l'immobilier de confort. Ce ciblage rapporterait davantage qu'une baisse de taux, qui frapperait d'abord les PME. Le rendez-vous triennal : une évaluation publique tous les trois ans, seule occasion de retoucher le régime. On ne pilote pas cinq milliards de dépense fiscale à coups d'amendements nocturnes.",
    "Le budget vit à l'année. Une transmission se prépare sur une décennie. Si le PLF 2027 veut vraiment servir les finances publiques, qu'il fasse du Dutreil ce que son nom promet depuis vingt-trois ans, un pacte, c'est-à-dire une parole tenue des deux côtés."
  ],
  signature: "Gilles Carrez, ancien rapporteur général du budget, ancien président de la commission des finances de l'Assemblée nationale, et François Ouairy, avocat fiscaliste (BENSAID Avocats)"
};

// ---------- VERSION LE MONDE (~5 000 signes) ----------
const monde = {
  meta: "Projet de tribune, cosignature Gilles Carrez / François Ouairy. Calibrage ~5 000 signes (Le Monde, pages Idées ; le chapô est rédigé par la rédaction ; titre proposé, la rédaction le met entre guillemets). Les passages entre crochets sont à la main de M. Carrez. 3 septembre 2026.",
  titre: "Le pacte Dutreil ne survivra ni au rabot ni au statu quo",
  chapo: null,
  corps: [
    "Le 30 septembre, le projet de loi de finances pour 2027 sera présenté en Conseil des ministres. Le pacte Dutreil, cette exonération de 75 % des droits de mutation qui permet de transmettre une entreprise familiale sans la démanteler pour payer l'impôt, y affrontera son procès annuel. La pièce nouvelle au dossier est lourde. Dans un rapport publié en novembre 2025 avec l'Institut des politiques publiques, la Cour des comptes évalue le coût réel du dispositif à 5,5 milliards d'euros pour 2024, contre 800 millions affichés dans les documents budgétaires, et constate que 1 % des bénéficiaires capte 65 % de l'avantage.",
    { sub: "Ce que la Cour documente" },
    "Nous connaissons ce dispositif de l'intérieur. [L'un de nous fut co-rapporteur de la loi du 1er août 2003 qui l'a créé ; l'autre le met en œuvre chaque semaine, pour des entreprises moyennes comme pour des groupes familiaux.] Ce que la Cour documente est exact. La dépense fiscale a été multipliée par plus de quatre en quatre ans. Des montages logent dans l'exonération de la trésorerie ou de l'immobilier sans lien avec l'activité. L'avantage moyen des foyers les mieux servis approche trente millions d'euros. Qui veut sauver la transmission doit commencer par combattre ces dérives.",
    "Rappelons pourtant d'où vient ce régime. Dès 1994, la Commission européenne constatait que des milliers d'entreprises disparaissaient chaque année en Europe, avec leurs emplois, faute d'avoir surmonté le passage d'une génération à l'autre, et désignait le droit fiscal parmi les causes. La France taxait alors la transmission en ligne directe jusqu'à 40 %, pour un actif détenu en titres et sans liquidités. Moins d'une entreprise sur cinq restait familiale, contre une sur deux en Allemagne et près de deux sur trois en Italie. Le socle du régime est né en 1999 d'un amendement de Didier Migaud, rapporteur général socialiste, avant d'être étendu en 2003. La transmission de l'outil de travail n'a jamais été une cause partisane.",
    "La loi de finances pour 2026 vient de durcir l'exercice, avec un engagement porté à huit ans au minimum et l'exclusion explicite des actifs étrangers à l'exploitation. Ces règles ont trois mois d'existence. La rigueur commanderait de les laisser produire leurs effets, et de les mesurer, avant d'en écrire de nouvelles.",
    { sub: "L'objection d'équité" },
    "Reste l'objection d'équité, et elle pèse. Une exonération dont 1 % des bénéficiaires capte les deux tiers interroge le consentement à l'impôt, au moment où chacun est appelé à l'effort. Nous la prenons au sérieux. Le rabot uniforme y répond mal. Un plafonnement brutal frapperait d'abord les entreprises moyennes, dont les héritiers n'ont ni la trésorerie pour payer ni l'ingénierie pour s'organiser, quand les très grands patrimoines disposent du temps, des conseils et de la mobilité nécessaires pour s'adapter. L'Allemagne a choisi une autre voie, une exonération de l'outil de travail qui atteint 100 %, en contrepartie d'engagements contrôlés de maintien de l'emploi. Voilà le débat qui vaut d'être ouvert, des contreparties réelles plutôt qu'un taux et un plafond.",
    "[L'un de nous répète depuis vingt ans que derrière chaque niche fiscale aboie un chien.] Le Dutreil ne fait pas exception, et la réponse tient en une méthode, évaluer, cibler, stabiliser. Or l'instabilité est devenue la règle. Un dirigeant qui signe un pacte aujourd'hui s'engage jusqu'en 2034 ; sur cette durée, il traversera huit lois de finances, plusieurs doctrines administratives et une jurisprudence mouvante jusque sur la notion de holding animatrice. Des transmissions se reportent, des réorganisations se figent. On exige des familles un engagement de huit ans que l'État se montre incapable de tenir huit mois.",
    { sub: "Trois décisions, un mot chacune" },
    "La clause de grand-père, d'abord : tout pacte reste régi, pendant toute sa durée, par les règles en vigueur au jour de sa signature. C'est la contrepartie loyale d'un engagement de huit ans, et son coût budgétaire est nul. Le 75/0, ensuite : 75 % d'exonération, sans plafond, pour l'entreprise réellement transmise et dirigée, zéro pour la trésorerie de placement, l'immobilier de jouissance et les actifs de confort. Ce ciblage rapporterait davantage qu'une baisse de taux et répond à l'objection d'équité par la structure même du régime. Le rendez-vous triennal, enfin : une évaluation publique et indépendante tous les trois ans, seule occasion de retoucher le dispositif. Le travail de la Cour et de l'Institut des politiques publiques prouve que l'appareil statistique existe. Il reste à en faire une institution.",
    "Le budget vit à l'année. Une transmission se prépare sur une décennie. La campagne présidentielle placera les droits de succession au centre du débat, entre promesses de suppression et projets de taxation renforcée. Le pacte Dutreil mérite d'échapper à ce balancier. Qu'il redevienne ce que son nom promet depuis vingt-trois ans, un pacte, c'est-à-dire une parole tenue des deux côtés."
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
