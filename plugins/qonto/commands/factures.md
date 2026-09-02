---
description: Factures Qonto — clients (défaut) ou fournisseurs, impayées ou toutes
argument-hint: "[clients|fournisseurs] [impayées|payées|toutes]"
---

État des factures suivies dans Qonto.

Demande : $ARGUMENTS (défaut : factures clients impayées)

Étapes :

1. Applique le skill `qonto` du plugin (voies d'accès et règles).
2. Clients : `client_invoices` (statut `unpaid` par défaut) ; fournisseurs :
   `supplier_invoices`. Paginer si nécessaire.
3. Tableau : N° | Client (ou fournisseur) | Émise le | Échéance | Montant TTC |
   Statut — trié par échéance croissante, factures **en retard** (échéance
   dépassée) mises en évidence.
4. Totaux : encours, dont en retard.
5. Lecture seule : ne jamais créer, finaliser ni marquer payée une facture sans
   demande explicite puis confirmation.
