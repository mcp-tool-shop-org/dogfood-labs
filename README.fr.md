<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/dogfood-labs/readme.png" width="400" alt="dogfood-labs" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml"><img src="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/dogfood-labs/"><img src="https://img.shields.io/badge/Landing_Page-live-brightgreen" alt="Landing Page" /></a>
</p>

Système centralisé de preuves pour les tests internes (dogfood) pour mcp-tool-shop-org.

Il prouve, avec des preuves vérifiables, que chaque dépôt a été réellement utilisé de manière appropriée pour les tests internes. Cela permet de vérifier cet état pour toute l'organisation.

## Couverture

13 dépôts répartis sur 8 domaines de produits, tous vérifiés comme conformes, application obligatoire.

| Domaine | Dépôts |
|---------|-------|
| cli | shipcheck, ai-loadout, tool-scan, zip-meta-map, code-batch |
| desktop | glyphstudio |
| mcp-server | claude-guardian, repo-crawler-mcp |
| api | vocal-synth-engine |
| npm-package | site-theme |
| library | voice-soundboard |
| web | a11y-demo-site |
| plugin | polyglot-vscode |

## Architecture

- Les **dépôts sources** définissent les scénarios (`dogfood/scenarios/*.yaml`) et exécutent les workflows de tests internes.
- Les **workflows sources** émettent des données structurées via `repository_dispatch`.
- Le **vérificateur central** valide le schéma, l'origine (API GitHub) et la conformité aux politiques.
- Les **enregistrements acceptés** sont stockés dans `records/<org>/<repo>/YYYY/MM/DD/`.
- Les **enregistrements rejetés** sont stockés dans `records/_rejected/` avec des raisons lisibles par machine.
- Les **index générés** permettent des lectures rapides sans avoir à parcourir l'historique.

## Contrats

Le produit est défini par trois contrats :

| Contrat | Ce qu'il définit | Schéma |
|----------|----------------|--------|
| [Record](docs/record-contract.md) | Ce à quoi ressemble une exécution de test interne. | `schemas/dogfood-record.schema.json` |
| [Scenario](docs/scenario-contract.md) | Ce qui constitue un véritable exercice de test interne. | `schemas/scenario.schema.json` |
| [Policy](docs/policy-contract.md) | Ce que les règles appliquées par le vérificateur. | `schemas/policy.schema.json` |

## Niveaux d'application

| Mode | Comportement | Quand l'utiliser |
|------|----------|-------------|
| `required` | Échec en cas de violation | Par défaut pour tous les dépôts. |
| `warn-only` | Avertissement mais pas de blocage | Nouveaux dépôts avec raison documentée + date de révision. |
| `exempt` | Ignorer l'évaluation | Dépôts avec raison + date de révision. |

Voir [enforcement-tiers.md](docs/enforcement-tiers.md) pour plus de détails.

## Intégration

| Système | Rôle |
|--------|------|
| dogfood-labs | Magasin d'écriture autoritaire + autorité de politique. |
| shipcheck | Consommateur d'application (Gate F). |
| repo-knowledge | Miroir de requête/index (modèle de lecture SQLite). |
| org audit | Consommateur de portfolio. |

## Verify

```bash
bash verify.sh
```

Exécute tous les tests sur le vérificateur, l'ingestion, le reporting et les outils de portfolio (76+ tests).

## Structure du dépôt

```
dogfood-labs/
├─ schemas/                          # JSON Schema contracts
├─ records/                          # Accepted records (sharded)
│  └─ _rejected/                     # Rejected records
├─ indexes/                          # Generated read indexes
├─ policies/
│  ├─ global-policy.yaml
│  └─ repos/<org>/<repo>.yaml        # Per-repo policies
├─ tools/
│  ├─ ingest/                        # Central ingestion pipeline
│  ├─ verify/                        # Verifier
│  ├─ report/                        # Submission builder
│  └─ portfolio/                     # Portfolio generator
├─ reports/                          # Generated reports
├─ docs/                             # Contract + operating docs
└─ dogfood/                          # Self-dogfood scenario
```

## Modèle de confiance

**Données traitées :** Payloads de soumission de tests internes provenant des dépôts sources (JSON), fichiers YAML de politique, fichiers d'enregistrement et d'index générés. Toutes les données sont persistées dans Git – aucune base de données externe.

**Données NON traitées :** Identifiants utilisateur, jetons d'authentification (au-delà des secrets CI gérés par GitHub), API externes (au-delà de l'API GitHub Actions pour `repository_dispatch`), données personnelles, télémétrie, analyses.

**Permissions :** Les workflows GitHub Actions nécessitent `contents: write` pour que le bot d'ingestion puisse commettre les enregistrements acceptés. Les dépôts sources nécessitent un secret `DOGFOOD_TOKEN` pour la diffusion. Aucune autre permission élevée n'est requise.

**Aucune télémétrie.** Aucune analyse. Aucun appel réseau autre que l'API GitHub.

## Rythme de fonctionnement

- **Hebdomadaire :** Vérification de la fraîcheur – signalement des dépôts > 14 jours obsolètes, violation pour les dépôts > 30 jours.
- **Mensuel :** Calibrage des politiques – révision des avertissements/exemptions pour la promotion.
- **En cas d'échec :** Enquête sur la cause profonde, mise à jour de la doctrine uniquement à partir de cas réels.
- **Nouveaux dépôts :** Par défaut, application obligatoire, documentation de la raison pour tout niveau moins contraignant.

Consultez [operating-cadence.md](docs/operating-cadence.md) pour obtenir tous les détails.

## Principes directeurs

La doctrine de déploiement résume 10 règles tirées de véritables échecs survenus lors de l'expansion. Consultez [rollout-doctrine.md](docs/rollout-doctrine.md).

---

Créé par <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
