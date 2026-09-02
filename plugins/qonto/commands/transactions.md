---
description: Transactions du compte Qonto (période, sens ou texte libre en argument)
argument-hint: [période / filtre — ex. « juillet », « débits > 1 000 € », « URSSAF »]
---

Liste les transactions du compte Qonto du cabinet.

Demande : $ARGUMENTS

Étapes :

1. Applique le skill `qonto` du plugin (voies d'accès, règles, pagination).
2. Interprète la demande : période (défaut : 30 derniers jours), sens
   (débit/crédit), compte (défaut : compte principal, `main: true`), montant
   minimal, texte à rechercher — le rapprochement texte se fait côté client sur
   `label`, `reference` et `note`.
3. Récupère les transactions (statuts `completed` et `pending`, tri
   `settled_at:desc`), en paginant si nécessaire.
4. Tableau : Date | Libellé | Type | Montant signé | Justif. (✓/✗) — puis
   totaux : crédits, débits, net sur la période, nombre d'opérations.
5. Signale en fin de réponse les opérations encore en attente (`pending`) et les
   débits sans justificatif.

Lecture seule : aucune écriture.
