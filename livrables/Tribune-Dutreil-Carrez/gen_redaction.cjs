// Produit le fichier remis à la rédaction : texte de la tribune (crochets résolus,
// sans en-tête interne) suivi d'une annexe de sourçage, hors texte.
const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak } = require("docx");
const fs = require("fs");
const path = require("path");
const { monde } = require("./build_tribunes.cjs");

const SOURCES = [
  "Coût et concentration du dispositif, rapport de la Cour des comptes réalisé avec l'Institut des politiques publiques, 18 novembre 2025. Il retient 5,5 milliards d'euros en 2024 contre 1,2 milliard en 2020, face aux 800 millions inscrits au projet de loi de finances pour 2025. Il établit que 1 % des bénéficiaires capte 65 % de l'avantage, pour un avantage moyen proche de trente millions d'euros.",
  "Taux marginal de 40 % en ligne directe avant 2011, article 777 du code général des impôts, le taux de 45 % résultant de la loi de finances rectificative du 29 juillet 2011.",
  "Exemple chiffré sur une entreprise valorisée vingt millions d'euros, application du barème de l'article 777 et de l'abattement de l'article 779 du même code, transmission au décès au profit d'un enfant unique.",
  "Origine du régime, article 11 de la loi de finances pour 2000 du 30 décembre 1999, créant les articles 789 A et 789 B du code général des impôts, sur amendement de Didier Migaud, alors rapporteur général.",
  "Appellation « Gattaz-Migaud », rapport du Sénat n° 381 de juin 2005 sur le projet de loi en faveur des petites et moyennes entreprises.",
  "Extension aux donations, article 43 de la loi du 1er août 2003, codifié à l'article 787 B du code général des impôts. Relèvement de l'abattement à 75 %, article 28 de la loi du 2 août 2005 en faveur des petites et moyennes entreprises.",
  "Assouplissements et simplifications ultérieurs, article 12 de la loi de finances rectificative du 29 juillet 2011 et article 40 de la loi de finances pour 2019.",
  "Durcissement de 2026, loi de finances du 19 février 2026. L'engagement individuel est porté à six ans, qui s'ajoutent aux deux années de l'engagement collectif. La fraction de valeur représentative des biens étrangers à l'exploitation est exclue, article 787 B dans sa version en vigueur.",
  "Régime allemand, paragraphes 13a et 13b de l'Erbschaftsteuergesetz, exonération de 85 % ou de 100 % sous condition de maintien de la masse salariale.",
  "Cession du laboratoire UPSA au groupe Bristol-Myers Squibb en 1994, cinq ans après le décès de son dirigeant.",
  "Part des entreprises transmises dans le cercle familial en France, en Allemagne et en Italie. Sources, rapports parlementaires de 2003 sur le projet de loi pour l'initiative économique et recommandation 94/1069/CE de la Commission européenne du 7 décembre 1994."
];

const clean = s => s.replace(/[\[\]]/g, "");

function para(text, o = {}) {
  return new Paragraph({
    alignment: o.align || AlignmentType.JUSTIFIED,
    spacing: { line: o.line || 360, after: o.after || 200, before: o.before || 0 },
    children: [new TextRun({ text, font: "Times New Roman", size: o.size || 24, bold: !!o.bold, italics: !!o.italics })]
  });
}

function build(v) {
  const c = [para(v.titre, { align: AlignmentType.LEFT, size: 28, bold: true })];
  v.corps.forEach(p => c.push(typeof p === "string"
    ? para(clean(p))
    : para(p.sub, { align: AlignmentType.LEFT, bold: true, before: 160 })));
  c.push(para(v.signature, { align: AlignmentType.LEFT, italics: true }));
  // Annexe, hors texte
  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(para("Annexe, hors texte, non destinée à la publication", { align: AlignmentType.LEFT, size: 20, italics: true }));
  c.push(para("Sources des données chiffrées", { align: AlignmentType.LEFT, size: 24, bold: true, before: 120 }));
  SOURCES.forEach(s => c.push(para("- " + s, { align: AlignmentType.LEFT, size: 20, line: 280, after: 140 })));
  return new Document({
    creator: "François Ouairy",
    lastModifiedBy: "François Ouairy",
    title: "Pacte Dutreil : ni rabot ni statu quo",
    description: "Tribune de Gilles Carrez et François Ouairy",
    sections: [{ children: c }]
  });
}

const signes = v => [...[v.titre, ...v.corps.map(x => (typeof x === "string" ? clean(x) : x.sub))].join(" ")].length;

(async () => {
  const name = "Tribune_Carrez-Ouairy_Pacte-Dutreil_texte-definitif.docx";
  fs.writeFileSync(path.join(__dirname, name), await Packer.toBuffer(build(monde)));
  console.log(`Écrit : ${name}`);
  console.log(`Texte : ${signes(monde)} signes, hors annexe. Annexe : ${SOURCES.length} entrées.`);
})();
