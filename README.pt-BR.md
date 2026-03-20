<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/dogfood-labs/readme.png" width="400" alt="dogfood-labs" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml"><img src="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/dogfood-labs/"><img src="https://img.shields.io/badge/Landing_Page-live-brightgreen" alt="Landing Page" /></a>
</p>

Sistema centralizado de evidências para testes internos (dogfood) para mcp-tool-shop-org.

Comprova, com evidências auditáveis, que cada repositório foi realmente utilizado de forma adequada para testes internos. Permite consultar esse status em toda a organização.

## Cobertura

13 repositórios em 8 áreas de produtos, todos verificados como aprovados, todos com aplicação obrigatória.

| Área | Repositórios |
|---------|-------|
| cli | shipcheck, ai-loadout, tool-scan, zip-meta-map, code-batch |
| desktop | glyphstudio |
| mcp-server | claude-guardian, repo-crawler-mcp |
| api | vocal-synth-engine |
| npm-package | site-theme |
| library | voice-soundboard |
| web | a11y-demo-site |
| plugin | polyglot-vscode |

## Arquitetura

- Os **repositórios de origem** definem cenários (`dogfood/scenarios/*.yaml`) e executam os fluxos de trabalho de testes internos.
- Os **fluxos de trabalho de origem** emitem dados estruturados via `repository_dispatch`.
- O **verificador central** valida o esquema, a origem (API do GitHub) e a conformidade com as políticas.
- Os **registros aceitos** são armazenados em `records/<org>/<repo>/YYYY/MM/DD/`.
- Os **registros rejeitados** são armazenados em `records/_rejected/` com motivos legíveis por máquina.
- Os **índices gerados** fornecem leituras rápidas sem a necessidade de escanear o histórico.

## Contratos

O produto é definido por três contratos:

| Contrato | O que ele define | Esquema |
|----------|----------------|--------|
| [Record](docs/record-contract.md) | O que uma execução de teste interno representa | `schemas/dogfood-record.schema.json` |
| [Scenario](docs/scenario-contract.md) | O que constitui um exercício real de teste interno | `schemas/scenario.schema.json` |
| [Policy](docs/policy-contract.md) | O que as regras impostas pelo verificador abrangem | `schemas/policy.schema.json` |

## Níveis de Aplicação

| Modo | Comportamento | Quando usar |
|------|----------|-------------|
| `required` | Falha em caso de violação | Padrão para todos os repositórios |
| `warn-only` | Aviso, mas sem bloqueio | Novos repositórios com motivo documentado + data de revisão |
| `exempt` | Ignorar a avaliação | Repositórios com motivo + data de revisão |

Consulte [enforcement-tiers.md](docs/enforcement-tiers.md) para obter detalhes.

## Integração

| Sistema | Função |
|--------|------|
| dogfood-labs | Armazenamento de dados autorizado + autoridade de políticas |
| shipcheck | Consumidor de aplicação (Gate F) |
| repo-knowledge | Espelho de consulta/índice (modelo de leitura SQLite) |
| org audit | Consumidor de portfólio |

## Verify

```bash
bash verify.sh
```

Executa todos os testes nos verificadores, ingestão, relatórios e ferramentas de portfólio (mais de 76 testes).

## Estrutura do Repositório

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

## Modelo de Confiança

**Dados acessados:** Dados de envio de testes internos dos repositórios de origem (JSON), arquivos YAML de políticas, arquivos de registro e índice gerados. Todos os dados são persistidos no Git — sem bancos de dados externos.

**Dados NÃO acessados:** Credenciais de usuário, tokens de autenticação (além de segredos de CI gerenciados pelo GitHub), APIs externas (além da API do GitHub Actions para `repository_dispatch`), dados pessoais, telemetria, análises.

**Permissões:** Os fluxos de trabalho do GitHub Actions requerem `contents: write` para que o bot de ingestão possa gravar registros aceitos. Os repositórios de origem requerem um segredo `DOGFOOD_TOKEN` para o envio. Nenhuma outra permissão elevada é necessária.

**Sem telemetria.** Sem análises. Sem chamadas de rede além da API do GitHub.

## Ciclo de Operação

- **Semanalmente:** Revisão de atualização — sinaliza repositórios com mais de 14 dias de inatividade, violação após mais de 30 dias.
- **Mensalmente:** Calibração de políticas — revisão de avisos/isenções para promoção.
- **Em caso de falha:** Investigue a causa raiz, atualize a documentação apenas com base em problemas reais.
- **Novos repositórios:** Padrão é obrigatório, documente o motivo para qualquer nível mais fraco.

Consulte [operating-cadence.md](docs/operating-cadence.md) para obter todos os detalhes.

## Princípios

A política de implementação resume 10 regras aprendidas a partir de falhas reais durante a expansão. Consulte [rollout-doctrine.md](docs/rollout-doctrine.md).

---

Desenvolvido por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
