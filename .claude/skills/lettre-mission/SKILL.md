---
name: lettre-mission
description: >
  Produit une lettre de mission / convention d'honoraires BENSAID AVOCATS complète, prête
  à copier-coller, à partir du modèle officiel du cabinet. Déclencher quand l'utilisateur
  demande « la lettre de mission », « la LM », « la convention d'honoraires » d'un client,
  ou tape "/lettre-mission <client>". S'utilise dès que la mission est connue (souvent en
  aval de [[rdv-cadrage]] / [[support-cadrage]]). L'utilisateur précise à chaque fois la
  LANGUE (français ou anglais) et le montant du forfait ; parfois un honoraire de résultat
  (success fee) à sécuriser sur l'évènement déclencheur.
---

# Lettre de mission - convention d'honoraires BENSAID AVOCATS

Objectif : sortir **la LM entière, prête à copier-coller** (bloc texte unique), dans la langue
demandée, à partir du modèle maison. On adapte le **contenu** (parties, mission, honoraires),
jamais la structure des clauses.

## Ce que l'utilisateur fournit / ce qu'on déduit
1. **Client** : personne physique (civilité, prénom, nom) OU société (dénomination + son
   représentant : « représentée par M./Mme … en qualité de … »). Toujours l'adresse complète.
2. **Langue** : FR ou EN (l'utilisateur le précise à chaque appel ; en cas de doute, demander).
3. **Mission** : la reprendre du contexte du dossier (RDV, échanges, deck). La formuler en
   phrases d'avocat, puis en 2 à 5 puces précises sous « il s'agit pour l'Avocat de : ».
   Adapter la 1re phrase de la section 1 au type de livrable (consultation, mémorandum,
   accompagnement, dossier de preuve, courrier à l'administration…), pas seulement
   « une consultation fiscale détaillée ».
4. **Honoraires** : montant du forfait en chiffres ET en toutes lettres. Taux horaire de
   référence = **600,00 € HT (valeur 2026)** (déjà dans le modèle).
   - **TVA : les montants de la LM sont toujours exprimes HT**, et la clause dit « la TVA est
     due en sus, selon le régime applicable au jour de la facturation ». On ne fige donc **pas**
     de taux dans la LM (l'economie du deal est identique, c'est du HT). Ne renseigner un taux
     precis dans la LM que si l'utilisateur le demande expressement. Le regime reel se determine
     au moment de la facturation (Sellsy) : 20 % pour un preneur en France ; **hors champ de la
     TVA francaise pour un preneur etabli hors UE** (art. 259 B CGI pour un particulier non
     assujetti, art. 259-1 pour un professionnel) ; DOM = regles specifiques ; preneur assujetti
     dans l'UE = autoliquidation. Cas limite a signaler : un client qui s'expatrie (facturation
     avant/apres le depart).
5. **Règlement** : **par défaut, l'intégralité des honoraires est réglée AVANT le début de la
   mission.** Mais **toujours demander à l'utilisateur** l'échéancier retenu pour chaque LM
   (avant le début de la mission / acompte X % à la signature et solde à la remise / à réception
   des factures / autre).
6. **Signataire** : choisir selon le pilote du dossier. Cartes professionnelles connues :
   - **Me Jonathan BENSAID** - carte professionnelle **n° 9395226** (signataire par défaut du modèle).
   - **Me François OUAIRY** - carte professionnelle **n° 30850074**.
   Renseigner le nom ET la carte pro correspondante. Pour tout autre associé, **demander le
   n° de carte** s'il n'est pas connu, ne jamais l'inventer.
7. **Date / lieu** : « Fait à Paris, le <date> » (date du jour si non précisée).

## Format de sortie (IMPORTANT)
- **DEMANDER AVANT, PAS DE CROCHETS DANS LE BLOC.** Toute variable ou tout choix (montant du
  forfait, signataire + carte pro, TVA si client étranger/outre-mer, échéancier de règlement,
  bloc optionnel honoraire de résultat / médiateur conso, formulation d'une diligence…) doit être
  **tranché AVANT de produire la LM** : si un élément n'est pas déterminé, **poser la question à
  l'utilisateur** (regrouper les questions). Ne jamais émettre de 【…】, de <champ> ni de « à
  compléter » dans le bloc livré.
- **Rendre ensuite la LM directement dans la conversation**, dans un **bloc de code unique**
  (fence ```) : c'est le « module » que l'utilisateur copie-colle tel quel, **entièrement final,
  sans aucun marqueur à supprimer**. Ne pas la livrer en fichier par défaut (proposer
  `.txt`/`.docx` seulement si demandé).
- Après le bloc, on peut rappeler en clair (hors du bloc) les hypothèses retenues (ex. « TVA 20 %,
  règlement avant le début de la mission, signée François Ouairy »), mais **rien de tout cela
  n'apparaît dans le bloc**.
- LM complète, du titre à la date finale. Une seule langue par bloc (FR ou EN selon la demande) ;
  si les deux sont demandées, un bloc par langue.

## Règles d'or
- **Accents obligatoires.** La LM livrée doit être intégralement accentuée (é, è, ê, à, â, î, ô, û, ç, œ). Ne jamais produire de version sans accents, même si d'autres fichiers du dossier sont accentless. Reprendre le modèle ci-dessous tel quel, avec ses accents (cf [[feedback-pas-accents]]).
- **Ne jamais envoyer** : on prépare, François/Jonathan relit et diffuse (cf [[envoi-mails-clients]]).
- **Livrer en module copier-coller** (page Artifact avec bouton Copier) plutôt qu'en simple bloc de chat (cf [[feedback-modules-copier-coller]]).
- **Pas de tiret cadratin/demi-cadratin ni de couleur signature Claude** (cf [[no-ai-style-markers]]).
- **Cohérence des honoraires** : le chiffre en toutes lettres doit correspondre au chiffre en
  chiffres ; TVA « en sus selon le régime applicable » (utile : un client qui devient
  non-résident peut relever de règles de TVA différentes, le préciser si pertinent).
- Version .docx sur gabarit à en-tête/pied : passer par le skill [[courrier]] une fois le texte
  validé. Le présent skill produit le TEXTE.

## Attention particulière aux honoraires (points qui reviennent)
### a. Honoraire de résultat (success fee) - clause à AJOUTER quand demandé
Le modèle évoque « l'honoraire complémentaire de résultat » à la clause dessaisissement, mais ne
le définit pas. Quand l'utilisateur veut un success fee, insérer dans la section 2, après le
forfait, un paragraphe « Honoraire de résultat » qui verrouille TROIS choses :
1. **Taux et assiette** : X % HT calculé sur [économie d'impôt obtenue / sommes récupérées /
   avantage chiffré obtenu] - définir l'assiette précisément, jamais « sur le résultat ».
2. **Évènement déclencheur** : le décrire sans ambiguïté (ex. « obtention d'une position écrite
   favorable de l'administration », « absence de redressement à l'expiration du délai de
   reprise », « signature de l'acte », « encaissement effectif »). C'est LE point sensible.
3. **Blindage dessaisissement / succession d'avocats** : l'honoraire de résultat reste
   **intégralement dû** dès lors que l'évènement déclencheur survient, **y compris après la fin
   de la mission et quel que soit l'avocat ayant finalisé le dossier** (dessaisissement,
   succession, changement de conseil). Cohérent avec la clause 5.

### b. Forfait seul
Si pas de success fee : garder la section 2 « Honoraire au forfait » telle quelle, supprimer
toute référence à l'honoraire de résultat de la clause 5 (sinon incohérence : soit on prévoit un
résultat et on le définit, soit on retire la phrase de la clause 5).

### c. Mention médiateur de la consommation (client particulier)
Pour un client **consommateur** (particulier hors activité pro), ajouter en fin une clause
« Médiation de la consommation » (art. L.612-1 s. code de la consommation) désignant le médiateur
de la consommation de la profession d'avocat. Facultatif pour une clientèle patrimoniale/pro ;
le proposer, ne pas l'imposer.

## MODÈLE - FRANÇAIS
Sortir tel quel en remplaçant les <champs>. Retirer le crochet d'option non retenue.

```
CONVENTION D'HONORAIRES

ENTRE LES SOUSSIGNES

<Personne physique : Civilité Prénom NOM  |  Société : DÉNOMINATION, <forme> au capital de <capital>, immatriculée au RCS de <ville> sous le n° <SIREN>, représentée par <Civilité Prénom NOM> en qualité de <fonction>>, demeurant / dont le siège est :

<adresse ligne 1>
<adresse ligne 2>
<code postal> <ville>
<pays>

Ci-après dénommé(s) « le(s) client(s) »,

ET

BENSAID Avocats, Société d'Avocats au capital de 150 000 € représentée par Maître <Jonathan BENSAID>, Avocat inscrit au Barreau de Paris, dont le cabinet est sis 49 rue de Courcelles 75008 Paris, titulaire de la carte professionnelle n° <9395226>

Ci-après dénommé « l'Avocat ».

IL EST RAPPELÉ CE QUI SUIT :

L'Avocat et le client ont évoqué ensemble la nature de la mission confiée à l'Avocat par la présente convention (ci-après, dénommée "la convention"), ainsi que les différentes modalités de rémunération envisageables en fonction de la loi et des usages.
Dans le cadre de la convention, les parties conviennent de définir la mission et le mode de rémunération de l'Avocat.

1. Mission
Le client charge l'Avocat de <objet de la mission : consultation fiscale détaillée / mémorandum / accompagnement / constitution d'un dossier de preuve / etc.>.

Plus précisément, il s'agit pour l'Avocat de :
- <diligence 1>
- <diligence 2>
- <diligence 3>

L'Avocat s'engage à procéder à toutes les diligences, à mettre en œuvre tous les moyens de droit et de procédure pour garantir les intérêts du client et leur assurer les meilleures chances de succès. L'Avocat mettra en œuvre toutes diligences utiles en accord avec le client. L'Avocat tiendra régulièrement informé le client du déroulement de la mission qui lui est confiée.

2. Détermination de l'honoraire
Honoraire au forfait
Pour l'exécution de la mission, les honoraires sont forfaitairement fixés à la somme de <montant> € HT (<montant en toutes lettres> euros hors taxes). Les montants s'entendent hors taxes ; la TVA est due en sus, selon le régime applicable au jour de la facturation.
A titre indicatif, il est précisé que le taux horaire habituel du Cabinet est fixé à 600,00 euros HT, valeur 2026.

Ces honoraires couvriront toutes les diligences accomplies dans le cadre de la mission : étude du dossier au regard des pièces communiquées par le client, des textes et de la jurisprudence applicables, rédaction et mise au point du <mémorandum / livrable>.

[OPTION SUCCESS FEE - Honoraire de résultat
En complément de l'honoraire forfaitaire ci-dessus, un honoraire de résultat de <X> % HT sera dû à l'Avocat, calculé sur <assiette précise : montant de l'économie d'impôt obtenue / des sommes récupérées / de l'avantage chiffré>. Cet honoraire de résultat deviendra exigible dès la survenance de l'évènement déclencheur suivant : <décrire précisément l'évènement>. Il restera intégralement dû à l'Avocat dès lors que cet évènement survient, y compris postérieurement à la fin ou à l'interruption de la mission, et quel que soit l'avocat ayant finalisé le dossier, nonobstant tout dessaisissement ou toute succession d'avocats.]

3. Règlement
<échéancier tranché en amont, ex. : L'intégralité des honoraires forfaitaires est réglée avant le début de la mission>. Les factures de frais et honoraires sont payables à réception. A défaut de règlement à l'échéance, des intérêts de retard seront légalement dus et calculés sur la base d'un taux égal à 3 fois celui de l'intérêt légal à compter de la date d'échéance mentionnée sur la facture, sans qu'un rappel soit nécessaire.

4. Suspension de la mission
En cas de non-paiement des factures d'honoraires et de frais, l'Avocat se réserve le droit de suspendre l'exécution de la mission, ce dont il informera son client en attirant son attention sur les conséquences éventuelles.

5. Dessaisissement
Dans l'hypothèse où le client souhaiterait dessaisir l'Avocat et transférer son dossier à un autre Avocat, le client s'engage à régler sans délai les honoraires, frais, débours et dépens dus à l'Avocat pour les diligences effectuées antérieurement au dessaisissement. Si le dessaisissement intervient après instruction complète du dossier, l'honoraire complémentaire de résultat restera dû à l'Avocat. L'intégralité de l'honoraire complémentaire de résultat restera due à l'Avocat, nonobstant dessaisissement.

6. Contestation
Toute contestation concernant le montant et le recouvrement des honoraires, frais et débours de l'Avocat ne peut être réglée, à défaut d'accord entre les parties, qu'en recourant à la procédure prévue aux articles 174 et suivants du décret n° 91-1197 du 27 novembre 1991 organisant la profession d'avocat. Le Bâtonnier de l'Ordre des Avocats du Barreau de Paris est saisi à la requête de la partie la plus diligente. Il est expressément convenu entre les parties qu'en cas de contestation, le montant des honoraires, frais et débours calculés comme prévu dans la convention, et restant dus à l'Avocat, doit être consigné entre les mains de Monsieur le Bâtonnier de l'Ordre des Avocats du Barreau de Paris, dans l'attente d'une décision définitive de fixation des honoraires, frais et débours.

7. Loi informatique et libertés
Le client est informé de ce que l'Avocat met en œuvre des traitements de données à caractère personnel afin de lui permettre d'assurer la gestion, la facturation, le suivi des dossiers de ses clients et la prospection. Ces données sont nécessaires pour la bonne gestion des clients et sont destinées aux services habilités de notre cabinet. Conformément à la loi Informatique et libertés, les personnes physiques disposent d'un droit d'accès aux données les concernant, de rectification, d'interrogation, d'opposition pour motif légitime et à la prospection par courrier postal ou à l'adresse électronique suivante : contact@bensaid-avocats.fr accompagné d'une copie d'un titre d'identité signé.

[OPTION CONSOMMATEUR - Médiation de la consommation
Conformément aux articles L.612-1 et suivants du code de la consommation, le client consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige relatif à la présente convention. Le médiateur de la consommation compétent est le médiateur de la consommation de la profession d'avocat, dont les coordonnées sont disponibles sur le site du Conseil National des Barreaux.]

Fait à Paris, le <date>, en 2 exemplaires originaux.


Le client                                   L'Avocat
(lu et approuvé)
```

## MODÈLE - ANGLAIS
Traduction fidèle. Mêmes clauses, mêmes <champs>.

```
FEE AGREEMENT (LETTER OF ENGAGEMENT)

BETWEEN THE UNDERSIGNED

<Individual: Title Forename SURNAME  |  Company: NAME, a <form> with share capital of <capital>, registered with the <city> Trade and Companies Register under no. <number>, represented by <Title Forename SURNAME> in its capacity as <role>>, residing at / whose registered office is at:

<address line 1>
<address line 2>
<postcode> <town>
<country>

Hereinafter referred to as "the Client",

AND

BENSAID Avocats, a law firm (Société d'Avocats) with share capital of EUR 150,000, represented by Maître <Jonathan BENSAID>, Avocat admitted to the Paris Bar, whose offices are located at 49 rue de Courcelles, 75008 Paris, holder of professional card no. <9395226>,

Hereinafter referred to as "the Lawyer".

IT IS FIRST RECALLED THAT:

The Lawyer and the Client have discussed together the nature of the mission entrusted to the Lawyer under this agreement (hereinafter, "the Agreement"), as well as the various methods of remuneration available under the law and professional practice.
Under the Agreement, the parties agree to define the mission and the method of remuneration of the Lawyer.

1. Mission
The Client instructs the Lawyer to <purpose: carry out a detailed tax consultation / prepare a memorandum / provide assistance / build an evidentiary file / etc.>.

More specifically, the Lawyer is to:
- <task 1>
- <task 2>
- <task 3>

The Lawyer undertakes to carry out all due diligence and to implement all legal and procedural means to protect the Client's interests and to give them the best chances of success. The Lawyer will carry out all useful diligence in agreement with the Client. The Lawyer will keep the Client regularly informed of the progress of the mission entrusted to him.

2. Determination of the fee
Fixed fee
For the performance of the mission, the fees are set on a fixed (lump-sum) basis at the sum of EUR <amount> excluding VAT (<amount in words> euros excluding tax). Amounts are stated excluding tax; VAT is due in addition, according to the regime applicable at the date of invoicing.
For information, the firm's usual hourly rate is set at EUR 600.00 excluding VAT, 2026 value.

These fees cover all diligence carried out within the scope of the mission: study of the file in the light of the documents provided by the Client and of the applicable legislation and case law, and the drafting and finalisation of the <memorandum / deliverable>.

[OPTION SUCCESS FEE - Contingency (result) fee
In addition to the fixed fee above, a result fee of <X>% excluding VAT will be due to the Lawyer, calculated on <precise basis: the amount of tax saved / of the sums recovered / of the quantified benefit obtained>. This result fee will fall due upon the occurrence of the following trigger event: <describe the event precisely>. It will remain due to the Lawyer in full once that event occurs, including after the end or the interruption of the mission, and regardless of which lawyer finalised the file, notwithstanding any withdrawal of the mission or any succession of lawyers.]

3. Payment
<payment schedule decided beforehand, e.g.: The fixed fee is paid in full before the mission begins>. Invoices for costs and fees are payable on receipt. Failing payment when due, late-payment interest will be legally due, calculated at a rate equal to three times the legal interest rate as from the due date shown on the invoice, without any reminder being necessary.

4. Suspension of the mission
In the event of non-payment of fee and cost invoices, the Lawyer reserves the right to suspend performance of the mission, of which he will inform the Client, drawing the Client's attention to the possible consequences.

5. Withdrawal of the mission
Should the Client wish to withdraw the mission from the Lawyer and transfer the file to another lawyer, the Client undertakes to pay without delay the fees, costs, disbursements and expenses due to the Lawyer for the diligence carried out prior to the withdrawal. If the withdrawal occurs after complete preparation of the file, the additional result fee will remain due to the Lawyer. The entire additional result fee will remain due to the Lawyer notwithstanding any withdrawal.

6. Disputes
Any dispute concerning the amount and the recovery of the Lawyer's fees, costs and disbursements may only be settled, failing agreement between the parties, by recourse to the procedure provided for in articles 174 et seq. of decree no. 91-1197 of 27 November 1991 organising the profession of lawyer. The President of the Paris Bar (Bâtonnier) is seised at the request of the more diligent party. It is expressly agreed between the parties that, in the event of a dispute, the amount of the fees, costs and disbursements calculated as provided in the Agreement and remaining due to the Lawyer must be deposited in the hands of the President of the Paris Bar, pending a final decision setting the fees, costs and disbursements.

7. Data protection
The Client is informed that the Lawyer carries out processing of personal data in order to manage clients, invoicing, the follow-up of client files and business development. These data are necessary for the proper management of clients and are intended for the authorised departments of our firm. In accordance with the French Data Protection Act and applicable regulations, natural persons have a right of access to the data concerning them, and rights of rectification, enquiry, and objection on legitimate grounds and to business development, by post or at the following email address: contact@bensaid-avocats.fr, together with a signed copy of an identity document.

[OPTION CONSUMER - Consumer mediation
In accordance with articles L.612-1 et seq. of the French Consumer Code, a Client who is a consumer is entitled to have free recourse to a consumer mediator with a view to the amicable resolution of any dispute relating to this Agreement. The competent mediator is the consumer mediator of the legal profession, whose contact details are available on the website of the National Bar Council (Conseil National des Barreaux).]

Done in Paris, on <date>, in 2 original counterparts.


The Client                                  The Lawyer
(read and approved)
```

## Persistance
- Enregistrer la LM générée dans `livrables/<nom-client>/` (`.txt` et/ou `.docx` via [[courrier]]).
  Mettre à jour le suivi du dossier (statut : LM émise / signée).
