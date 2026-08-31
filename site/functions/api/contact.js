/**
 * Réception du formulaire de contact : validation, anti-spam discret
 * (champ pot de miel + délai minimal), puis notification Slack via le
 * webhook stocké dans la variable d'environnement SLACK_WEBHOOK_URL
 * (projet Pages → Settings → Environment variables).
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

  // Pot de miel : un humain ne remplit pas ce champ invisible.
  if (champ(donnees.get('site_web'), 10).length > 0) {
    return reponse({ ok: true });
  }
  // Délai minimal : un formulaire soumis en moins de 3 secondes est un robot.
  const depuis = Number(donnees.get('depuis') || 0);
  if (!depuis || Date.now() - depuis < 3000) {
    return reponse({ ok: false, erreur: 'invalide' }, 400);
  }

  const nom = champ(donnees.get('nom'), 120);
  const email = champ(donnees.get('email'), 160);
  const societe = champ(donnees.get('societe'), 160);
  const telephone = champ(donnees.get('telephone'), 40);
  const secteur = champ(donnees.get('secteur'), 80);
  const message = champ(donnees.get('message'), 4000);

  if (!nom || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return reponse({ ok: false, erreur: 'invalide' }, 400);
  }
  if (!env.SLACK_WEBHOOK_URL) {
    return reponse({ ok: false, erreur: 'non-configure' }, 501);
  }

  const lignes = [
    `*Nouvelle demande de contact — taxesalaire.com*`,
    `*Nom :* ${nom}`,
    societe && `*Société :* ${societe}`,
    `*E-mail :* ${email}`,
    telephone && `*Téléphone :* ${telephone}`,
    secteur && `*Secteur :* ${secteur}`,
    '',
    message,
  ].filter(Boolean);

  const envoi = await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: lignes.join('\n') }),
  });
  if (!envoi.ok) {
    return reponse({ ok: false, erreur: 'notification' }, 502);
  }
  return reponse({ ok: true });
}
