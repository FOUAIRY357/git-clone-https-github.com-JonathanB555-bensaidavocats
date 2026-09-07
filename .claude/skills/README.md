# Skills BENSAID AVOCATS - quel skill pour quel écrit

Deux jeux de skills coexistent. Cette page dit lequel gouverne quoi, pour ne plus avoir à le
chercher.

## 1. Les skills du dépôt (ce dossier)
Ils vivent dans `.claude/skills/` et sont disponibles dans toute session qui clone ce dépôt.
Ce sont eux qui produisent les **écrits du cabinet**.

| Écrit à produire | Skill |
|---|---|
| **Charte de style** (typographie, formules, anti-marqueurs IA) | **[charte-cabinet](charte-cabinet/)** - source unique, prévaut sur tout |
| Mail (client, prospect, confrère, administration) | [redaction-mail](redaction-mail/) |
| Premier mail à un prospect ou apporteur entrant | [premier-contact](premier-contact/) |
| Lettre adressée à un destinataire nommé | [courrier](courrier/) |
| Note juridique, **consultation**, compte rendu, rapport | [template-cabinet](template-cabinet/) |
| Lettre de mission, convention d'honoraires | [lettre-mission](lettre-mission/) |
| RDV de cadrage (dates, confirmation, agenda, facture) | [rdv-cadrage](rdv-cadrage/) |
| Support de présentation d'un RDV de cadrage | [support-cadrage](support-cadrage/) |
| Fiche client, devis, facture dans Sellsy | [fiche-sellsy](fiche-sellsy/) |
| Enquête sur un prospect avant rendez-vous | [fiche-prospect](fiche-prospect/) |
| Post LinkedIn | [post-linkedin](post-linkedin/) |
| Page d'expertise sur bensaid-avocats.fr | [page-expertise](page-expertise/) |

**Il n'y a pas de skill « consultation ».** Une consultation passe par
[template-cabinet](template-cabinet/), qui la coule dans le gabarit de note juridique. Si sa
structure vient d'un modèle extérieur (modèle client, précédent d'un confrère), ce plan est
conservé, mais le style reste celui de la charte.

## 2. Les skills du MCP Bensaid
Chargés à la demande via `mcp__Bensaid_MCP__bensaid_skill`, ils portent le **site web** et
quelques outils d'analyse : `bensaid-design`, `bensaid-fr`, `bensaid-ch`, `bensaid-voice`,
`bensaid-validate`, `bensaid-translate`, `bensaid-deploy`, `fiche-prospect`,
`evaluation-entreprise`, `controle-blanc-particulier`. Le MCP Paperasse expose en plus les skills
métier (`paperasse_skill` : fiscaliste, notaire, comptable, contrôleur fiscal, commissaire aux
comptes, syndic), à charger pour le **fond** juridique et fiscal.

Aucun de ces skills ne produit un écrit du cabinet. En particulier, `bensaid-voice` est la voix
de la copy des sites `.fr` et `.ch` : sa typographie éditoriale ne gouverne aucun mail, courrier,
note ou consultation.

## 3. Règle de préséance
1. **[charte-cabinet](charte-cabinet/) prévaut sur tout autre skill**, du dépôt comme du MCP.
2. Un skill de production (mail, courrier, note) ne porte que le **format** de son écrit. La
   typographie et le style sont transverses et appartiennent à la charte.
3. En cas de divergence entre deux skills, la charte tranche. La divergence connue avec
   `bensaid-voice` sur le tiret cadratin est tranchée au § 0 de la charte.

## 4. Contrôle avant livraison
Tout écrit se contrôle avec le même script, quel que soit son format :

```bash
python3 .claude/skills/charte-cabinet/charte_check.py <fichier>   # .docx, .json, .txt, .md
```

Les renderers du cabinet (`redaction-mail`, `template-cabinet`, `courrier`) l'appellent déjà
avant de générer : un tiret cadratin ou un demi-cadratin bloque la génération.
