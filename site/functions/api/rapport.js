/**
 * « Recevoir ce rapport » : capture du contact avec consentement, envoi du
 * rapport de scan au cabinet via Slack (SLACK_WEBHOOK_URL), et, lorsque la
 * variable BREVO_API_KEY est configurée, envoi d'une copie par e-mail au
 * prospect. Voir docs/rapport-email-sellsy.md pour la phase Sellsy.
 */

const reponse = (corps, statut = 200) =>
  new Response(JSON.stringify(corps), {
    status: statut,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });

const champ = (valeur, max) => (typeof valeur === 'string' ? valeur.trim().slice(0, max) : '');

export async function onRequestPost({ request, env }) {
  let donnees;
  try {
    donnees = await request.formData();
  } catch {
    return reponse({ ok: false, erreur: 'format' }, 400);
  }

  if (champ(donnees.get('site_web'), 10).length > 0) return reponse({ ok: true });
  const depuis = Number(donnees.get('depuis') || 0);
  if (!depuis || Date.now() - depuis < 3000) return reponse({ ok: false, erreur: 'invalide' }, 400);

  const email = champ(donnees.get('email'), 160);
  const consentement = donnees.get('consentement') === 'oui';
  const lettre = donnees.get('lettre') === 'oui';
  if (!consentement || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return reponse({ ok: false, erreur: 'invalide' }, 400);
  }

  let rapport;
  try {
    rapport = JSON.parse(champ(donnees.get('rapport'), 12000) || '{}');
  } catch {
    rapport = {};
  }
  const operations = Array.isArray(rapport.operations) ? rapport.operations.slice(0, 30) : [];

  if (!env.SLACK_WEBHOOK_URL) return reponse({ ok: false, erreur: 'non-configure' }, 501);

  const pourcent = (valeur) =>
    typeof valeur === 'number' ? (valeur * 100).toFixed(1).replace('.', ',') + ' %' : 'n. c.';
  const lignes = [
    '*Rapport de scan demandé — taxesalaire.com*',
    `*E-mail :* ${email}${lettre ? ' (souhaite recevoir la lettre du cabinet)' : ''}`,
    rapport.caTotal ? `*CA total déclaré :* ${rapport.caTotal} €` : '',
    rapport.coefTaxation !== undefined ? `*Coefficient de taxation estimé :* ${pourcent(rapport.coefTaxation)}` : '',
    rapport.rapportTs !== undefined ? `*Rapport taxe sur les salaires estimé :* ${pourcent(rapport.rapportTs)}` : '',
    rapport.tvaAmont ? `*TVA d'amont déclarée :* ${rapport.tvaAmont} €` : '',
    '',
    ...operations.map(
      (op) =>
        `• ${champ(op.libelle, 80)} : ${champ(op.qualification, 90)}${op.montant ? ` (${op.montant} €)` : ''}`
    ),
  ].filter(Boolean);

  const envoiSlack = await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: lignes.join('\n').slice(0, 8000) }),
  });
  if (!envoiSlack.ok) return reponse({ ok: false, erreur: 'notification' }, 502);

  // Copie e-mail au prospect, si un fournisseur transactionnel est branché.
  let courriel = false;
  if (env.BREVO_API_KEY) {
    const detail = operations
      .map((op) => `<li><strong>${champ(op.libelle, 80)}</strong> : ${champ(op.qualification, 90)}</li>`)
      .join('');
    const envoiMail = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': env.BREVO_API_KEY },
      body: JSON.stringify({
        sender: { name: 'Taxe sur les Salaires & TVA', email: env.EMAIL_EXPEDITEUR || 'contact@taxesalaire.com' },
        to: [{ email }],
        subject: 'Votre rapport de scan TVA',
        htmlContent: `<p>Bonjour,</p><p>Voici la synthèse de votre scan sur taxesalaire.com :</p><ul>${detail}</ul><p>Un avocat du cabinet BENSAID AVOCATS peut fiabiliser ce diagnostic : répondez simplement à ce message.</p><p>BENSAID AVOCATS, 49 rue de Courcelles, 75008 Paris</p>`,
      }),
    });
    courriel = envoiMail.ok;
  }

  return reponse({ ok: true, courriel });
}
