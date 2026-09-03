// Génère les deux versions de la tribune Dutreil (Carrez x Ouairy) en .docx
// et affiche le compte de signes (espaces comprises) de chaque version.
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require("docx");
const fs = require("fs");
const path = require("path");

const OUT = __dirname;

// ---------- VERSION LES ECHOS (~4 000 signes) ----------
const echos = {
  meta: "Projet de tribune, cosignature Gilles Carrez / François Ouairy. Calibrage ~4 000 signes (Les Échos, Le Cercle). 3 septembre 2026.",
  titre: "Le pacte Dutreil exige huit ans des familles. L'État, lui, ne tient pas huit mois.",
  chapo: null,
  corps: [
    "Le 30 septembre, le projet de loi de finances pour 2027 arrive en Conseil des ministres. Comme chaque automne depuis vingt ans, le pacte Dutreil, cette exonération de 75 % des droits qui permet de transmettre une entreprise familiale sans la vendre pour payer l'impôt, servira de cible. Cette année, les artilleurs disposent d'une munition neuve. La Cour des comptes évalue désormais le coût réel du dispositif à 5,5 milliards d'euros pour 2024, très loin des 800 millions affichés dans les documents budgétaires, et concentré sur une poignée de très grandes transmissions. Le plafonnement de l'avantage figure déjà dans les amendements qui circulent.",
    "Ces chiffres méritent mieux qu'un haussement d'épaules. L'un de nous a défendu ce dispositif dès l'origine. L'autre le met en œuvre chaque semaine, pour des entreprises de toutes tailles. Nous n'avons aucun intérêt à nier ce que la Cour documente : une dépense fiscale multipliée par plus de quatre en quatre ans, des montages qui logent dans l'exonération de la trésorerie ou de l'immobilier étrangers à l'activité, un avantage très concentré. Qui veut sauver la transmission doit commencer par combattre ces dérives.",
    "Rappelons pourquoi ce pacte existe. En France, à peine une entreprise sur cinq est transmise dans le cercle familial, contre plus d'une sur deux en Allemagne. Avant 2003, la mort du fondateur emportait trop souvent l'entreprise. Pour payer des droits assis sur une valeur qu'ils ne détenaient qu'en titres, les héritiers vendaient, à un concurrent ou à un fonds, et l'ancrage local disparaissait avec eux. Le pacte a corrigé cela, sous une condition exigeante : conserver les titres et diriger l'entreprise pendant des années. La loi de finances pour 2026 vient encore de durcir l'exercice, avec un engagement porté à huit ans au minimum et l'exclusion explicite des actifs étrangers à l'exploitation. Ces règles ont trois mois. Laissons-les produire leurs effets avant d'en écrire d'autres.",
    "La maladie française se loge ailleurs, dans l'instabilité. Un dirigeant qui signe un pacte aujourd'hui s'engage jusqu'en 2034. Sur cette période, il traversera huit lois de finances, autant de doctrines administratives et une jurisprudence mouvante jusque sur des notions aussi centrales que la holding animatrice. Au contentieux, des redressements lourds se jouent sur des définitions que la loi n'a jamais arrêtées. Chaque automne, un plafond circule, un amendement surgit, une suppression se vote en commission avant de disparaître en séance. Les familles, elles, restent engagées. On demande aux familles un engagement de huit ans que l'État se montre incapable de tenir huit mois. L'insécurité juridique décourage la transmission plus sûrement que l'impôt.",
    "Trois décisions mettraient fin à ce désordre. Garantir d'abord à chaque pacte les règles en vigueur au jour de sa signature, pour toute sa durée. Un engagement de long terme le commande, et cela ne coûte rien au budget. Un rescrit renforcé et une doctrine publiée en temps utile compléteraient cette garantie pour les situations complexes. Cibler ensuite, plutôt que raboter : 75 % d'exonération sans plafond pour l'outil productif réellement transmis et dirigé, et rien pour ce qui s'en éloigne. Ce ciblage assumé rapporterait davantage qu'une baisse de taux, qui frapperait d'abord les PME. Évaluer enfin, publiquement, tous les trois ans. On ne pilote pas cinq milliards de dépense fiscale à coups d'amendements nocturnes.",
    "Le budget vit à l'année. Une transmission se prépare sur une décennie. Si le PLF 2027 veut vraiment servir les finances publiques, qu'il fasse du Dutreil ce que son nom promet depuis vingt-trois ans : un pacte, c'est-à-dire une parole tenue des deux côtés."
  ],
  signature: "Gilles Carrez, ancien rapporteur général du budget, ancien président de la commission des finances de l'Assemblée nationale, et François Ouairy, avocat fiscaliste (BENSAID Avocats)"
};

// ---------- VERSION LE MONDE (~6 000 signes) ----------
const monde = {
  meta: "Projet de tribune, cosignature Gilles Carrez / François Ouairy. Calibrage ~6 000 signes (Le Monde, pages Débats). 3 septembre 2026.",
  titre: "Le pacte Dutreil ne survivra ni au rabot ni au statu quo",
  chapo: "À la veille d'un projet de loi de finances qui rouvrira le procès de la principale exonération sur les transmissions d'entreprise, l'ancien rapporteur général du budget et un avocat fiscaliste plaident pour un ciblage strict et des règles enfin stables.",
  corps: [
    "Le 30 septembre, le projet de loi de finances pour 2027 sera présenté en Conseil des ministres. Le pacte Dutreil, cette exonération de 75 % des droits de mutation qui permet de transmettre une entreprise familiale sans la démanteler pour payer l'impôt, y affrontera son procès annuel. L'audience de cette année s'ouvre avec une pièce nouvelle au dossier. Dans un rapport publié en novembre 2025 avec l'Institut des politiques publiques, la Cour des comptes évalue le coût réel du dispositif à 5,5 milliards d'euros pour 2024, contre 800 millions affichés dans les documents budgétaires, et constate que 1 % des bénéficiaires capte 65 % de l'avantage.",
    "Nous connaissons ce dispositif de l'intérieur. L'un de nous a défendu sa création dès 2003, comme rapporteur général du budget. L'autre le met en œuvre chaque semaine, pour des entreprises moyennes comme pour des groupes familiaux. Ce que la Cour documente est exact. La dépense fiscale a été multipliée par plus de quatre en quatre ans. Des montages logent dans l'exonération de la trésorerie ou de l'immobilier sans lien avec l'activité. L'avantage moyen des foyers les mieux servis approche trente millions d'euros. Qui veut sauver la transmission doit commencer par combattre ces dérives.",
    "Rappelons l'objet du pacte. En France, moins d'une entreprise sur cinq est transmise dans le cercle familial, contre une sur deux en Allemagne et près de deux sur trois en Italie. Avant la loi Dutreil de 2003, la mort du fondateur emportait souvent l'entreprise. Pour acquitter des droits calculés sur une valeur qu'ils ne détenaient qu'en titres, les héritiers vendaient, à un concurrent ou à un fonds, et l'ancrage territorial disparaissait avec eux. L'exonération répond à cette réalité, sous une condition exigeante : conserver les titres et diriger l'entreprise pendant des années. En 2003, le choix d'économie politique était assumé. Mieux vaut une entreprise conservée et des emplois maintenus qu'un impôt théorique payé par liquidation. La loi de finances pour 2026 vient de durcir encore l'exercice, avec un engagement porté à huit ans au minimum et l'exclusion explicite des actifs étrangers à l'exploitation, trésorerie excédentaire et immobilier de jouissance en tête. Ces règles ont trois mois d'existence. La rigueur commanderait de les laisser produire leurs effets, et de les mesurer, avant d'en écrire de nouvelles.",
    "Reste l'objection d'équité, et elle pèse. Une exonération dont 1 % des bénéficiaires capte les deux tiers interroge le consentement à l'impôt, au moment où chacun est appelé à l'effort. Nous la prenons au sérieux. Le rabot uniforme y répond mal. Un plafonnement brutal ou une baisse du taux frapperaient d'abord les entreprises moyennes, dont les héritiers n'ont ni la trésorerie pour payer ni l'ingénierie pour s'organiser, tandis que les très grands patrimoines disposent du temps, des conseils et de la mobilité nécessaires pour s'adapter. L'Allemagne montre une autre voie. Son exonération de l'outil de travail atteint 100 %, en contrepartie d'engagements contrôlés de maintien de l'emploi et de la masse salariale. Le débat français gagnerait à porter sur ces contreparties réelles, emploi, investissement, gouvernance, au lieu de se réduire chaque automne à un taux et à un plafond.",
    "La seconde faiblesse du dispositif tient à l'instabilité. Un dirigeant qui signe un pacte aujourd'hui s'engage jusqu'en 2034. Sur cette durée, il traversera huit lois de finances, plusieurs doctrines administratives et une jurisprudence mouvante jusque sur des notions aussi structurantes que la holding animatrice. Au contentieux, des redressements lourds se jouent sur des définitions que la loi n'a jamais arrêtées. Les praticiens le constatent chaque semaine. Des transmissions se reportent, des réorganisations se figent, dans l'attente d'un cadre que chaque automne remet en question. On exige des familles un engagement de huit ans que l'État se montre incapable de tenir huit mois. Cette insécurité décourage la transmission plus sûrement que le niveau de l'impôt, et elle profite aux seuls contribuables les mieux conseillés.",
    "Trois décisions rendraient au dispositif sa légitimité. La première, garantir à chaque pacte les règles en vigueur au jour de sa signature, pour toute sa durée. C'est la contrepartie loyale d'un engagement de long terme, et son coût budgétaire est nul. La deuxième, cibler au lieu de raboter, en réservant l'exonération de 75 %, sans plafond, à l'outil productif réellement transmis et dirigé, assorti le cas échéant d'engagements sur l'emploi, et en excluant tout le reste avec constance. Ce ciblage rapporterait davantage au budget qu'une baisse de taux, et il répond à l'objection d'équité par la structure même du dispositif. La troisième, instituer une évaluation publique tous les trois ans, chiffres à l'appui, pour sortir du rituel des amendements nocturnes. Cinq milliards et demi de dépense fiscale se pilotent avec des données. Le travail mené avec l'Institut des politiques publiques montre que l'appareil statistique existe. Il reste à l'institutionnaliser.",
    "Le budget vit à l'année. Une transmission d'entreprise se prépare sur une décennie. La campagne présidentielle qui s'annonce placera les droits de succession au centre du débat, entre promesses de suppression et projets de taxation renforcée. Les programmes qui s'écrivent promettent déjà tout et son contraire, exonération des successions en ligne directe d'un côté, imposition minimale des hauts patrimoines de l'autre. Le pacte Dutreil mérite d'échapper à ce balancier. Qu'il redevienne ce que son nom promet depuis vingt-trois ans : un pacte, c'est-à-dire une parole tenue des deux côtés."
  ],
  signature: "Gilles Carrez, ancien rapporteur général du budget, ancien président de la commission des finances de l'Assemblée nationale, et François Ouairy, avocat fiscaliste (BENSAID Avocats)"
};

function signes(v) {
  const parts = [v.titre, v.chapo || "", ...v.corps];
  return [...parts.join(" ")].length;
}

function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 200 },
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
  v.corps.forEach(p => children.push(para(p)));
  children.push(para(v.signature, { align: AlignmentType.LEFT, italics: true }));
  return new Document({ sections: [{ children }] });
}

(async () => {
  console.log("Signes (titre + chapô + corps, hors signature) :");
  console.log("  Version Les Échos :", signes(echos));
  console.log("  Version Le Monde  :", signes(monde));
  for (const [v, name] of [[echos, "Tribune-Dutreil_Version-Echos_4000-signes.docx"], [monde, "Tribune-Dutreil_Version-Le-Monde_6000-signes.docx"]]) {
    const buf = await Packer.toBuffer(buildDoc(v));
    fs.writeFileSync(path.join(OUT, name), buf);
    console.log("Écrit :", name);
  }
})();
