<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/dogfood-labs/readme.png" width="400" alt="dogfood-labs" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml"><img src="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/dogfood-labs/"><img src="https://img.shields.io/badge/Landing_Page-live-brightgreen" alt="Landing Page" /></a>
</p>

Sistema centralizado de evidencia de pruebas internas para mcp-tool-shop-org.

Demuestra, con evidencia verificable, que cada repositorio fue realmente utilizado de una manera adecuada para pruebas internas. Permite consultar este estado en toda la organización.

## Cobertura

13 repositorios en 8 áreas de productos, todos verificados como exitosos, todos con cumplimiento obligatorio.

| Área | Repositorios |
|---------|-------|
| cli | shipcheck, ai-loadout, tool-scan, zip-meta-map, code-batch |
| escritorio | glyphstudio |
| mcp-server | claude-guardian, repo-crawler-mcp |
| API | vocal-synth-engine |
| npm-package | site-theme |
| biblioteca | voice-soundboard |
| web | a11y-demo-site |
| plugin | polyglot-vscode |

## Arquitectura

- Los **repositorios de origen** definen escenarios (`dogfood/scenarios/*.yaml`) y ejecutan flujos de trabajo de pruebas internas.
- Los **flujos de trabajo de origen** emiten datos estructurados a través de `repository_dispatch`.
- El **verificador central** valida el esquema, el origen (API de GitHub) y el cumplimiento de las políticas.
- Los **registros aceptados** se almacenan en `records/<org>/<repo>/YYYY/MM/DD/`.
- Los **registros rechazados** se almacenan en `records/_rejected/` con razones legibles por máquina.
- Los **índices generados** proporcionan lecturas rápidas sin necesidad de escanear el historial.

## Contratos

El producto se define por tres contratos:

| Contrato | Lo que define | Esquema |
|----------|----------------|--------|
| [Record](docs/record-contract.md) | Cómo se ve una ejecución de pruebas internas. | `schemas/dogfood-record.schema.json` |
| [Scenario](docs/scenario-contract.md) | Qué constituye una prueba interna real. | `schemas/scenario.schema.json` |
| [Policy](docs/policy-contract.md) | Qué reglas aplica el verificador. | `schemas/policy.schema.json` |

## Niveles de cumplimiento

| Modo | Comportamiento | Cuándo usar |
|------|----------|-------------|
| `required` | Fallar en caso de violación | Por defecto para todos los repositorios. |
| `warn-only` | Advertir, pero no bloquear | Nuevos repositorios con una razón documentada y fecha de revisión. |
| `exempt` | Omitir la evaluación | Repositorios con una razón y fecha de revisión. |

Consulte [enforcement-tiers.md](docs/enforcement-tiers.md) para obtener más detalles.

## Integración

| Sistema | Rol |
|--------|------|
| dogfood-labs | Almacén de escritura autorizado + autoridad de políticas. |
| shipcheck | Consumidor de cumplimiento (Gate F). |
| repo-knowledge | Espejo de consulta/índice (modelo de lectura SQLite). |
| org audit | Consumidor de portafolio. |

## Verificar

```bash
bash verify.sh
```

Ejecuta todas las pruebas en el verificador, la ingesta, la generación de informes y las herramientas de portafolio (más de 76 pruebas).

## Estructura del repositorio

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

## Modelo de confianza

**Datos accedidos:** Cargas útiles de envío de pruebas internas desde los repositorios de origen (JSON), archivos de políticas YAML, archivos de registro e índice generados. Todos los datos se almacenan en Git; no se utilizan bases de datos externas.

**Datos NO accedidos:** Credenciales de usuario, tokens de autenticación (más allá de los secretos de CI administrados por GitHub), API externas (más allá de la API de GitHub Actions para `repository_dispatch`), datos personales, telemetría, análisis.

**Permisos:** Los flujos de trabajo de GitHub Actions requieren `contents: write` para que el bot de ingesta pueda confirmar los registros aceptados. Los repositorios de origen requieren un secreto `DOGFOOD_TOKEN` para el envío. No se requieren otros permisos elevados.

**Sin telemetría.** Sin análisis. Sin llamadas de red más allá de la API de GitHub.

## Ciclo de operación

- **Semanalmente:** Revisión de frescura: se marcan los repositorios inactivos por más de 14 días, se produce una violación si están inactivos por más de 30 días.
- **Mensualmente:** Calibración de políticas: se revisa el estado de advertencia/exención para la promoción.
- **En caso de fallo:** Se investiga la causa raíz, se actualiza la doctrina solo a partir de problemas reales.
- **Nuevos repositorios:** Por defecto, se requiere el cumplimiento; se documenta la razón de cualquier nivel menos restrictivo.

Consulte [operating-cadence.md](docs/operating-cadence.md) para obtener todos los detalles.

## Principios

La doctrina de implementación captura 10 reglas aprendidas a partir de fallos reales durante la expansión. Consulte [rollout-doctrine.md](docs/rollout-doctrine.md).

---

Creado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
