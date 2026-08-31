---
name: fiche-sellsy
description: >
  Prépare la saisie d'un dossier dans Sellsy (fiche client, devis, factures) sous forme de blocs
  copier-coller rubrique par rubrique, pour un remplissage champ par champ sans rien retaper.
  Calcule la TVA et les totaux TTC à partir des montants HT de la mission, et signale les champs
  manquants au lieu de les inventer. Déclencher quand l'utilisateur veut « la fiche Sellsy »,
  « remplir Sellsy », « créer le client dans Sellsy », « le devis Sellsy », « la facture Sellsy »,
  ou tape "/fiche-sellsy <nom du client>". S'utilise en aval de [[lettre-mission]], dont elle
  reprend le forfait et l'échéancier.
---

# Fiche Sellsy - saisie rubrique par rubrique

Sellsy se remplit **champ par champ**. La fiche doit donc se coller **rubrique par rubrique**,
sans jamais obliger à retaper une valeur ni à supprimer un marqueur.

Style et typographie : cf [[charte-cabinet]]. Accents obligatoires, aucun tiret cadratin.

## Format de sortie, non négociable

**Un bloc de code par champ Sellsy, contenant la seule valeur à coller.** Le nom du champ est en
gras au-dessus du bloc, il n'entre jamais dans le bloc. Un clic sur le bloc doit suffire à
remplir le champ, sans rien retirer ni retaper.

Donc ceci :

**Civilité**
```
Monsieur
```
**Prénom**
```
Clayton
```

Et jamais ceci, qui obligerait à retaper la valeur :

```
Civilité : Monsieur
Prénom : Clayton
```

Regrouper les champs dans un même bloc est proscrit, même pour des valeurs courtes.

Ordre imposé, chaque rubrique introduite par un titre :

1. **Fiche client**, un bloc par champ.
2. **Devis, en-tête**, un bloc par champ.
3. **Devis, ligne 1**, puis ligne 2 et suivantes. Pour chaque ligne, un bloc pour la désignation
   et un bloc pour le prix unitaire HT. Les valeurs identiques sur toutes les lignes (quantité,
   unité, taux de TVA) se rappellent une seule fois en clair, hors bloc.
4. **Devis, mentions**, un bloc par mention à reporter.
5. **Facture à émettre**, même découpage.
6. **Totaux**, en clair et hors bloc. Sellsy les calcule, ils ne servent qu'au contrôle.
7. **Factures suivantes**, tableau en clair, avec le fait déclencheur de chacune.

Un champ dont la valeur est inconnue **ne reçoit pas de bloc vide** : il figure dans la rubrique
« À compléter », en clair, après les blocs. Aucun crochet, aucun `<champ>`, aucune mention
« à compléter » à l'intérieur d'un bloc.

Après les blocs, hors de tout bloc :
- **À compléter**, la liste des champs que les pièces du dossier ne donnent pas.
- **Hypothèses retenues**, notamment le régime de TVA et l'échéancier.

## Champs Sellsy à couvrir

### Client particulier
Type de client, Civilité, Prénom, Nom, Email, Téléphone, Adresse, Complément d'adresse,
Code postal, Ville, Pays, Langue de facturation, Devise, Régime de TVA, Conditions de règlement,
Origine du contact, Avocat en charge, Étiquettes, Note interne.

### Client société
Type de client, Raison sociale, Forme juridique, Capital, SIREN ou SIRET, RCS, Numéro de TVA
intracommunautaire, Représentant légal et sa qualité, puis les mêmes champs de contact, d'adresse
et de facturation que ci-dessus.

### Devis
Objet, Référence, Date, Date de validité, puis pour chaque ligne Désignation, Quantité, Unité,
Prix unitaire HT, Taux de TVA, Remise. Enfin Conditions particulières et Note de bas de document.

### Facture
Objet, Référence, Date, Échéance, lignes au même format, Mentions.

## Régime de TVA, à trancher avant de produire
Les honoraires du cabinet se raisonnent en HT (cf [[charte-cabinet]]), mais Sellsy exige un taux.
Déterminer le régime au jour de la facturation :
- preneur particulier ou professionnel **établi en France** : 20 % ;
- preneur **établi hors de l'Union européenne** : hors champ de la TVA française (article 259 B du
  CGI pour un particulier non assujetti, article 259-1 pour un professionnel) ;
- preneur **assujetti établi dans l'Union européenne** : autoliquidation par le preneur ;
- **outre-mer** : taux spécifiques, à vérifier au cas par cas.
Cas limite à signaler systématiquement : un client qui s'expatrie en cours de mission, la
facturation avant et après le départ ne relevant pas du même régime.

## Échéancier
Reprendre celui de la convention d'honoraires, sans le réinventer. Trois cas courants :
- intégralité avant le début de la mission (défaut du cabinet) ;
- forfait découpé en temps ou en phases, chacun réglé **avant l'ouverture** du temps concerné ;
- acompte à la signature et solde à la remise du livrable.
Pour un forfait découpé, produire une facture pour le temps ouvert et un tableau des suivantes,
en nommant le **fait déclencheur** de chacune plutôt qu'une date.

## Méthode
1. Rassembler les données depuis `livrables/<nom-client>/` et depuis la convention d'honoraires.
2. Reprendre l'adresse et l'état civil des **pièces officielles** du dossier (déclaration
   fiscale, bulletin de paie, pièce d'identité) plutôt que d'une signature de mail.
3. Trancher le régime de TVA et l'échéancier. Calculer la TVA et les totaux TTC, et vérifier que
   la somme des lignes HT égale le forfait de la convention.
4. Produire les blocs dans l'ordre imposé.
5. Enregistrer la fiche dans `livrables/<nom-client>/fiche-sellsy.md`.

## Rappels
- Sellsy n'a pas de connecteur, la saisie reste manuelle. Ce skill produit la matière, il ne
  crée rien dans l'outil.
- La facture part **avant** le rendez-vous ou l'ouverture du temps concerné (cf [[rdv-cadrage]]).
- Ne jamais inventer un numéro de téléphone, un SIREN, une référence de dossier ni un numéro de
  TVA. Un champ inconnu se signale.
