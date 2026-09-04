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
    { p: "Le 30 septembre, la présentation du projet de loi de finances pour 2027 rouvrira la bataille du pacte Dutreil. Nous vous proposons sur ce débat une tribune exclusive, cosignée par Gilles Carrez et François Ouairy." },
    { p: "Gilles Carrez est ancien rapporteur général du budget et ancien président de la commission des finances. Il fut co-rapporteur de la loi du 1er août 2003 qui a créé le dispositif. François Ouairy est avocat fiscaliste associé au sein de BENSAID Avocats et met ces pactes en œuvre." },
    { p: "La ligne tient dans le titre, ni rabot ni statu quo. Le texte suit ci-dessous, 5 800 signes environ. Une version de 4 800 signes est à votre disposition si l'espace le demande. Nous vous en réservons la primeur jusqu'à mardi 8 septembre en fin de journée." },
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
    disponibilite: "",
    signoff: "Bien à vous,",
    corps
  };
  fs.writeFileSync(path.join(__dirname, "mail_redaction_spec.json"), JSON.stringify(spec, null, 2));
  console.log("Écrit : mail_redaction_spec.json");
})();
