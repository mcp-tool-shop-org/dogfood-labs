<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/dogfood-labs/readme.png" width="400" alt="dogfood-labs" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml"><img src="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/dogfood-labs/"><img src="https://img.shields.io/badge/Landing_Page-live-brightgreen" alt="Landing Page" /></a>
</p>

Sistema centralizzato di tracciamento delle attività di test interni per mcp-tool-shop-org.

Dimostra, con prove verificabili, che ogni repository è stato effettivamente utilizzato in modo appropriato per i test interni. Permette di interrogare questo stato all'interno dell'organizzazione.

## Copertura

13 repository su 8 aree di prodotto, tutti verificati come conformi, applicazione obbligatoria.

| Area | Repository |
|---------|-------|
| cli | shipcheck, ai-loadout, tool-scan, zip-meta-map, code-batch |
| desktop | glyphstudio |
| mcp-server | claude-guardian, repo-crawler-mcp |
| api | vocal-synth-engine |
| npm-package | site-theme |
| library | voice-soundboard |
| web | a11y-demo-site |
| plugin | polyglot-vscode |

## Architettura

- I **repository di origine** definiscono gli scenari (`dogfood/scenarios/*.yaml`) ed eseguono i workflow di test interni.
- I **workflow di origine** emettono dati strutturati tramite `repository_dispatch`.
- Il **verificatore centrale** convalida lo schema, la provenienza (tramite l'API di GitHub) e la conformità alle policy.
- I **record accettati** vengono salvati in `records/<org>/<repo>/YYYY/MM/DD/`.
- I **record rifiutati** vengono salvati in `records/_rejected/` con motivazioni leggibili dalle macchine.
- Gli **indici generati** consentono letture rapide senza dover scansionare la cronologia.

## Contratti

Il prodotto è definito da tre contratti:

| Contratto | Cosa definisce | Schema |
|----------|----------------|--------|
| [Record](docs/record-contract.md) | Come appare un'esecuzione di test interni | `schemas/dogfood-record.schema.json` |
| [Scenario](docs/scenario-contract.md) | Cosa costituisce una vera attività di test interni | `schemas/scenario.schema.json` |
| [Policy](docs/policy-contract.md) | Cosa le policy imposte dal verificatore definiscono | `schemas/policy.schema.json` |

## Livelli di applicazione

| Modalità | Comportamento | Quando utilizzarlo |
|------|----------|-------------|
| `required` | Errore in caso di violazione | Impostazione predefinita per tutti i repository |
| `warn-only` | Avviso, ma senza bloccare | Nuovi repository con motivazione documentata e data di revisione |
| `exempt` | Escludi la valutazione | Repository con motivazione e data di revisione |

Consultare [enforcement-tiers.md](docs/enforcement-tiers.md) per i dettagli.

## Integrazione

| Sistema | Ruolo |
|--------|------|
| dogfood-labs | Archiviazione dati autorevole + autorità delle policy |
| shipcheck | Consumatore dell'applicazione (Gate F) |
| repo-knowledge | Specchio di query/indice (modello di lettura SQLite) |
| org audit | Consumatore del portfolio |

## Verify

```bash
bash verify.sh
```

Esegue tutti i test sui componenti verificatore, ingestione, reporting e strumenti del portfolio (oltre 76 test).

## Struttura del repository

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

## Modello di fiducia

**Dati elaborati:** Payload di invio dei test interni dai repository di origine (JSON), file YAML delle policy, file di record e indici generati. Tutti i dati sono persistiti tramite Git, senza database esterni.

**Dati NON elaborati:** Credenziali utente, token di autenticazione (oltre ai segreti CI gestiti da GitHub), API esterne (oltre all'API di GitHub Actions per `repository_dispatch`), dati personali, telemetria, analisi.

**Permessi:** I workflow di GitHub Actions richiedono `contents: write` per il bot di ingestione per salvare i record accettati. I repository di origine richiedono un segreto `DOGFOOD_TOKEN` per la dispatch. Nessun altro permesso elevato.

**Nessuna telemetria.** Nessuna analisi. Nessuna chiamata di rete oltre all'API di GitHub.

## Cadenza operativa

- **Settimanale:** Revisione della freschezza: segnala i repository inattivi da più di 14 giorni, violazione se inattivi da più di 30 giorni.
- **Mensile:** Calibrazione delle policy: revisione delle impostazioni "avviso solo" o "esenti" per la promozione.
- **In caso di errore:** Indaga sulla causa principale, aggiorna le policy solo in base a problemi reali.
- **Nuovi repository:** Impostazione predefinita su "obbligatorio", documenta la motivazione per qualsiasi livello meno restrittivo.

Per tutti i dettagli, consultare [operating-cadence.md](docs/operating-cadence.md).

## Principi guida

La "rollout doctrine" raccoglie 10 regole apprese da errori reali durante le fasi di espansione. Consultare [rollout-doctrine.md](docs/rollout-doctrine.md).

---

Creato da <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
