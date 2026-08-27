# HANDOFF — dossier Borozanov

Reprise en local. Tout est sur la branche `claude/bouboulis-succession-analysis-lcet1y`.

```bash
git fetch origin
git checkout claude/bouboulis-succession-analysis-lcet1y
git pull
open livrables/Bouboulis
```

---

## Le dossier en dix lignes

Alexander Borozanov, **héritier unique** de son père Borislav (décédé le **2 juillet 2024**), nous saisit le 26 août 2026.

Sa tante **Krassimira Bouboulis Borozanova**, sœur de Borislav, est morte vers 2022. Sa succession valaisanne a versé au canton un acompte de **CHF 436 495** le 4 novembre 2022. La taxation définitive n'était que de **CHF 133 625**. Le canton a donc notifié un solde de **CHF 302 870** en faveur de la succession, remboursable par mandat postal. **Aucune trace de ce remboursement.**

Second point, que son mémorandum ne fait pas : dans l'inventaire au 30 juin 2024, l'acompte est déduit au passif **pour son montant intégral**, sans réintégration apparente de la créance. Si c'est confirmé, le solde net partagé est minoré de CHF 302 870, soit **près de 18 % de la masse**.

Volet français : des droits de succession ont été acquittés depuis la succession de Borislav sur des biens situés en France **jamais reçus**, dont un **appartement à Neuilly-sur-Seine**.

---

## Le fait qui commande tout

| Date | |
|---|---|
| 2 juillet 2024 | Décès de Borislav |
| 29 novembre 2024 | Premier projet de transaction |
| 12 février 2025 | Transaction signée |

**Toute la négociation s'est déroulée après le décès du père.** Il n'a donc pas pu signer. Soit Alexander a signé lui-même, soit un tiers a signé pour la succession Borozanov et ses pouvoirs sont à examiner, ce qui est un terrain bien plus favorable (acte inopposable plutôt qu'erreur à invalider).

**Rien ne part vers l'exécuteur testamentaire avant que ce point soit tranché.**

---

## Décisions déjà prises, à ne pas rediscuter

- **Mandat confirmé sur les deux volets** par mail du 26 août à 16h13 UTC.
- **Honoraires : EUR 11 000 HT par mois**, ventilés 7 500 volet suisse et 3 500 volet français. Résiliable en fin de mois, volet par volet. Revue à deux mois.
- **Honoraire de résultat : 10 % HT** sur ce qui est effectivement recouvré.
- **Passage à l'euro au pair** (CHF 7 500 devient EUR 7 500), présenté comme un geste, chiffré au taux BCE du 26 août (EUR 1 = CHF 0,938).
- **Une seule convention bilingue**, français et anglais dans le même document, la version française prévalant. Émise par la structure parisienne.
- **Pas de clause de médiation de la consommation.** Signataire : Me François Ouairy, carte pro n° 30850074.
- **Le client communique en anglais.**

---

## Analyse déjà faite

Son mémorandum de neuf griefs a été **rédigé avec une IA, il le dit lui-même**. Deux d'entre eux ne sont que des erreurs de numérisation.

**À conserver** : n° 1 (le remboursement non documenté) et n° 7 (le débit de l'acompte non produit).
**Bien vus** : n° 6 et n° 8.
**À écarter** : n° 2, 3, 4, 5 et 9. **Ne jamais les adresser à l'exécuteur** : un grief réfutable en une phrase servira à disqualifier celui qui ne l'est pas.

Les deux démonstrations sont écrites en entier dans `DOSSIER-COMPLET.md` :
- **grief n° 2** : le Valais n'a pas de barème progressif, l'art. 116 al. 1 LF/VS fixe le taux d'après la parentèle du bénéficiaire. Deux taux sur une taxation = deux catégories de bénéficiaires ;
- **grief n° 4** : le solde net imprimé se déduit exactement du total d'actifs affiché, donc c'est la composante qui est mal lue, pas le total.

**Règle de méthode : jamais de travail sur les scans, uniquement sur les originaux.**

---

## Délais

| Délai | Fondement | Échéance |
|---|---|---|
| **1 an** | Art. 31 CO, découverte le 25 août 2026 | **25 août 2027** |
| 5 ans, 10 au plus | LF/VS art. 117 al. 3 et 130 | à vérifier sur texte consolidé |
| 5 ans | Art. 2224 C. civ. | responsabilité notaire |
| 30 ans | Art. 2227 C. civ. | action réelle immobilière |
| aucun | Art. 815 C. civ. | le partage se provoque toujours |

Le volet français n'est pas pressé, le volet suisse l'est.

**Précaution.** Le client a écrit qu'il détenait les pièces sans les comprendre. L'art. 31 CO fait courir le délai de la découverte effective, ce qui nous sert, mais un adversaire dira qu'il aurait dû savoir plus tôt. **La rédaction doit rester constante sur ce point.** Son mail du 26 août à 15h24 est la pièce qui date la découverte : à archiver au format original avec ses en-têtes.

---

## Où en est la correspondance

| Mail | Statut |
|---|---|
| Tri des neuf griefs + mandat suisse | **Envoyé** 26.08 15h19. Accepté à 15h21 |
| Proposition volet français + euro | **Envoyé** 26.08 17h05. Accepté à 16h13 UTC |
| Demande de pièces, version allégée | **Prêt**, pas encore envoyé |
| Envoi des deux LM (caduc) | Remplacé par la convention unique |

Le client **demande un appel ou une visio**. Non tranché.

---

## À faire

1. Envoyer le mail de demande de pièces (`mail-Borozanov-demande-pieces.spec.json`).
2. Archiver le mail du 26.08 15h24 et poser l'échéance du 25 août 2027.
3. Récupérer l'adresse postale, finaliser la convention, la faire signer, encaisser la première échéance. KYC.
4. **Établir qui a signé la transaction du 12 février 2025.**
5. **Demande de renseignements au Service de la publicité foncière pour Neuilly.** Ouverte à toute personne, sans justifier de sa qualité d'héritier, donc mobilisable sans attendre le certificat successoral. C'est le résultat le plus rapide du dossier.
6. Lettre au Service cantonal des contributions à Sion, sous la référence 51 10329 20093 73220 00130 56494.
7. Demande art. 400 CO à Lombard Odier, au nom du client seul (TF 4A_522/2018, c. 4.2.1).
8. Courrier à l'exécuteur, trois questions, une fois le point 4 tranché.

---

## Les fichiers

| Fichier | |
|---|---|
| `DOSSIER-COMPLET.md` | **La référence.** Quatorze parties, autoportant |
| `CONVENTION-HONORAIRES-bilingue.txt` | La convention. Reste l'adresse à compléter |
| `mail-Borozanov-demande-pieces.spec.json` | Le mail à envoyer |
| `mission-confirmee.md`, `analyse-memo-ligne-fiscale-valais.md`, `etat-du-dossier-et-programme-de-travail.md` | Notes de travail, reprises dans le dossier complet |
| `LM-1-volet-suisse.txt`, `LM-2-volet-francais.txt` | **Caduques**, remplacées par la convention unique |
| `courrier-Borozanov.spec.json` + `.docx` | Version courrier écartée |

Les mails se régénèrent avec :

```bash
python3 .claude/skills/redaction-mail/render_mail.py livrables/Bouboulis/<fichier>.spec.json /tmp/out.html
```

---

## Liens

- Dossier complet : https://claude.ai/code/artifact/bd4a952a-09be-4ce3-b6e0-343e14bf9b8e
- Convention, module copier-coller : https://claude.ai/code/artifact/86419675-ad20-4f20-9bbd-ebfa53e4e8f6
- Note de mission : https://claude.ai/code/artifact/ed53315e-8122-47aa-a5f5-29f8d2ed5cb1
- Revue du mémorandum : https://claude.ai/code/artifact/f9846f48-c4ae-4e77-bf44-64c82be849e1
- Drive, dans « 1. DOSSIERS PERSOS » : https://drive.google.com/drive/folders/1jTA190KZWaCnTVrVjOIHe74jzMtD3WJJ

---

## Deux choses en suspens

- Les **deux anciennes LM déposées dans le Drive** sont caduques depuis la convention unique. À remplacer, et les anciennes à mettre à la corbeille.
- **L'entretien demandé par le client** n'est ni accepté ni refusé. Huit informations ne se trouvent que chez lui, la liste est au point 11.5 du dossier complet.

---

## Vigilance

- Le mémorandum vise **l'exécuteur testamentaire et l'avocat suisse du dossier**. Toute démarche en ce sens suppose une instruction écrite du client.
- Il a accepté les deux mandats **sans discuter le prix**, en quelques minutes. Cela se lit dans les deux sens. Provision avant démarrage.
- **Trois ordres juridiques au moins** : France, Suisse, Bulgarie, plus un volet grec possible du côté Bouboulis.
- Le cabinet est fort **là où le client ne regarde pas** : le volet français, en juridiction propre, sur sources publiques, où il agit seul.
