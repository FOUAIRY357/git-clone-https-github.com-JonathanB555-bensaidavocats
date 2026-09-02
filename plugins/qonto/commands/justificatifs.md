---
description: Débits Qonto sans justificatif joint (défaut — 90 derniers jours)
argument-hint: [période — ex. « août 2026 », « depuis janvier »]
---

Prépare la chasse aux justificatifs avant la comptabilité.

Période demandée : $ARGUMENTS (défaut : 90 derniers jours)

Étapes :

1. Applique le skill `qonto` du plugin (voies d'accès et règles).
2. Récupère les transactions `side=debit` réglées sur la période, en paginant.
3. Retiens celles dont `attachment_ids` est vide, en écartant les frais Qonto
   (`operation_type` = `qonto_fee`), qui n'appellent pas de pièce.
4. Tableau : Date | Libellé | Type | Montant — trié du plus gros montant au plus
   petit. **Total des débits non justifiés** en gras.
5. Ajoute une ligne de suite utile : qui détient probablement chaque pièce
   (croiser `initiator_id` avec `/memberships` pour les paiements par carte,
   si l'information aide).

Lecture seule : aucune écriture.
