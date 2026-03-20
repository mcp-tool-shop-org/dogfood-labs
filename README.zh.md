<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/dogfood-labs/readme.png" width="400" alt="dogfood-labs" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml"><img src="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/dogfood-labs/"><img src="https://img.shields.io/badge/Landing_Page-live-brightgreen" alt="Landing Page" /></a>
</p>

用于 mcp-tool-shop-org 的集中式内部测试证据系统。

它通过可审计的证据证明，每个代码仓库都以适合内部测试的方式进行了使用。 并且，该状态可以在整个组织内进行查询。

## 覆盖范围

8 个产品线下的 13 个代码仓库，所有仓库均已验证通过，所有仓库均强制执行。

| 产品线 | 代码仓库 |
|---------|-------|
| 命令行工具 | shipcheck, ai-loadout, tool-scan, zip-meta-map, code-batch |
| 桌面应用 | glyphstudio |
| mcp-server | claude-guardian, repo-crawler-mcp |
| API | vocal-synth-engine |
| npm 包 | 网站主题 |
| 库 | 语音合成器 |
| 网页 | a11y-demo-site |
| 插件 | polyglot-vscode |

## 架构

- **源代码仓库** 定义场景 (`dogfood/scenarios/*.yaml`) 并运行内部测试流程。
- **源流程** 通过 `repository_dispatch` 发送结构化数据。
- **中心验证器** 验证模式、来源（GitHub API）和策略合规性。
- **已接受的记录** 存储在 `records/<org>/<repo>/YYYY/MM/DD/` 目录下。
- **已拒绝的记录** 存储在 `records/_rejected/` 目录下，并附带机器可读的拒绝原因。
- **生成的索引** 提供快速读取，无需扫描历史记录。

## 协议

该产品由三个协议定义：

| 协议 | 定义的内容 | 模式 |
|----------|----------------|--------|
| [Record](docs/record-contract.md) | 内部测试流程的执行方式 | `schemas/dogfood-record.schema.json` |
| [Scenario](docs/scenario-contract.md) | 什么是真正的内部测试 | `schemas/scenario.schema.json` |
| [Policy](docs/policy-contract.md) | 验证器强制执行的规则 | `schemas/policy.schema.json` |

## 强制执行级别

| 模式 | 行为 | 使用场景 |
|------|----------|-------------|
| `required` | 违反时失败 | 所有代码仓库的默认设置 |
| `warn-only` | 警告但不阻止 | 具有记录原因和审查日期的代码仓库 |
| `exempt` | 跳过评估 | 具有原因和审查日期的代码仓库 |

有关详细信息，请参阅 [enforcement-tiers.md](docs/enforcement-tiers.md)。

## 集成

| 系统 | 角色 |
|--------|------|
| dogfood-labs | 权威数据存储 + 策略管理 |
| shipcheck | 强制执行消费者 (Gate F) |
| repo-knowledge | 查询/索引镜像 (SQLite 读模型) |
| org audit | 产品组合消费者 |

## 验证

```bash
bash verify.sh
```

运行所有测试，包括验证器、数据导入、报告和产品组合工具（76 多个测试）。

## 代码仓库布局

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

## 信任模型

**涉及的数据：** 来自源代码仓库的内部测试提交数据（JSON）、策略 YAML 文件、生成的记录和索引文件。 所有数据都以 Git 形式存储，不使用外部数据库。

**未涉及的数据：** 用户凭据、身份验证令牌（仅限于 GitHub 管理的 CI 密钥）、外部 API（仅限于用于 `repository_dispatch` 的 GitHub Actions API）、个人数据、遥测、分析。

**权限：** GitHub Actions 工作流需要 `contents: write` 权限，以便数据导入机器人提交已接受的记录。 源代码仓库需要一个 `DOGFOOD_TOKEN` 密钥用于分发。 没有其他提升的权限。

**无遥测。** 无分析。 仅有超出 GitHub API 的网络调用。

## 运行周期

- **每周：** 检查新鲜度 — 标记超过 14 天未更新的代码仓库，超过 30 天则视为违反。
- **每月：** 策略校准 — 审查警告/豁免状态，以便进行推广。
- **发生错误时：** 调查根本原因，仅从实际问题中更新策略。
- **新代码仓库：** 默认设置为强制执行，并记录任何较弱级别的理由。

请参阅 [operating-cadence.md](docs/operating-cadence.md) 以获取完整详情。

## 原则

部署原则总结了在扩展过程中从实际失败中吸取的 10 条经验。请参阅 [rollout-doctrine.md](docs/rollout-doctrine.md)。

---

由 <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> 构建。
