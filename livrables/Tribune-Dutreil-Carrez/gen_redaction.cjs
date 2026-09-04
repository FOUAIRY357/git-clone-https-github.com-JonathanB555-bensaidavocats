// Génère les versions "rédaction" (crochets résolus, sans en-tête interne)
// et le spec du mail de proposition à la rédaction (texte collé dans le corps).
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require("docx");
const fs = require("fs");
const path = require("path");
const { echos, monde } = require("./build_tribunes.cjs");

function cleanText(s) { return s.replace(/[\[\]]/g, ""); }

function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 200, before: opts.before || 0 },
    children: [new TextRun({ text, font: "Times New Roman", size: opts.size || 24, bold: !!opts.bold, italics: !!opts.italics })]
  });
}

function buildClean(v) {
  const children = [para(v.titre, { align: AlignmentType.LEFT, size: 28, bold: true })];
  v.corps.forEach(p => {
    if (typeof p === "string") children.push(para(cleanText(p)));
    else children.push(para(p.sub, { align: AlignmentType.LEFT, bold: true, before: 160 }));
  });
  children.push(para(v.signature, { align: AlignmentType.LEFT, italics: true }));
  return new Document({ sections: [{ children }] });
}

function signesClean(v) {
  const parts = [v.titre, ...v.corps.map(c => (typeof c === "string" ? cleanText(c) : c.sub))];
  return [...parts.join(" ")].length;
}

(async () => {
  const outs = [[monde, "Tribune-Carrez-Ouairy_pour-redaction.docx"], [echos, "Tribune-Carrez-Ouairy_pour-redaction_courte.docx"]];
  for (const [v, name] of outs) {
    fs.writeFileSync(path.join(__dirname, name), await Packer.toBuffer(buildClean(v)));
    console.log(`Écrit : ${name} (${signesClean(v)} signes)`);
  }
  // Spec du mail à la rédaction : pitch + texte de la version longue collé dans le corps
  const corps = [
    { p: "Le 30 septembre, la présentation du projet de loi de finances pour 2027 en Conseil des ministres rouvrira la bataille du pacte Dutreil, avec le rapport de la Cour des comptes du 18 novembre 2025 en munition des amendements. Nous vous proposons une tribune exclusive sur ce débat." },
    { p: "Elle est cosignée par Gilles Carrez, ancien rapporteur général du budget, ancien président de la commission des finances et co-rapporteur de la loi du 1er août 2003 qui a créé le dispositif, et par François Ouairy, avocat fiscaliste (BENSAID Avocats), qui met en œuvre ces pactes chaque semaine." },
    { p: "La ligne tient dans le titre, ni rabot ni statu quo. Le texte reconnaît les dérives documentées par la Cour et propose trois décisions, une clause de grand-père pour les pactes en cours, l'extension du ciblage à la trésorerie de placement et à l'immobilier de rapport, une évaluation publique et triennale du dispositif." },
    { p: `Le texte, calibré à ${Math.round(signesClean(monde)/100)*100} signes environ, figure ci-dessous et en pièce jointe. Une version de ${Math.round(signesClean(echos)/100)*100} signes environ est disponible si l'espace le demande. Nous vous en réservons l'exclusivité jusqu'au jeudi 11 septembre au soir.` },
    { titre: monde.titre }
  ];
  monde.corps.forEach(p => {
    if (typeof p === "string") corps.push({ p: cleanText(p) });
    else corps.push({ titre: p.sub });
  });
  corps.push({ em: monde.signature });
  const spec = {
    destinataire: "opinions@lemonde.fr",
    objet: "Tribune exclusive de Gilles Carrez et François Ouairy sur le pacte Dutreil, pour le 30 septembre",
    civilite: "Madame, Monsieur,",
    disponibilite: "Nous restons joignables à tout moment, au [PORTABLE] et par retour de ce mail.",
    corps
  };
  fs.writeFileSync(path.join(__dirname, "mail_redaction_spec.json"), JSON.stringify(spec, null, 2));
  console.log("Écrit : mail_redaction_spec.json");
})();
