<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/dogfood-labs/readme.png" width="400" alt="dogfood-labs" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml"><img src="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/dogfood-labs/"><img src="https://img.shields.io/badge/Landing_Page-live-brightgreen" alt="Landing Page" /></a>
</p>

mcp-tool-shop-org 用の一元化された内部テストシステム。

各リポジトリが、実際に内部テストに適した方法で利用されていることを、監査可能な証拠とともに証明します。組織全体でこの状態を問い合わせ可能にします。

## カバレッジ

8つの製品領域にまたがる13のリポジトリ。すべて検証済みで、すべて必須です。

| 製品領域 | リポジトリ |
|---------|-------|
| cli | shipcheck, ai-loadout, tool-scan, zip-meta-map, code-batch |
| デスクトップ | glyphstudio |
| mcp-server | claude-guardian, repo-crawler-mcp |
| API | vocal-synth-engine |
| npm-package | site-theme |
| ライブラリ | voice-soundboard |
| ウェブ | a11y-demo-site |
| プラグイン | polyglot-vscode |

## アーキテクチャ

- **ソースリポジトリ** は、シナリオ (`dogfood/scenarios/*.yaml`) を定義し、内部テストのワークフローを実行します。
- **ソースワークフロー** は、`repository_dispatch` を介して構造化されたデータを送信します。
- **中央の検証システム** は、スキーマ、信頼性 (GitHub API)、およびポリシーへの準拠を検証します。
- **承認されたレコード** は、`records/<組織名>/<リポジトリ名>/YYYY/MM/DD/` に保存されます。
- **拒否されたレコード** は、機械可読な理由とともに `records/_rejected/` に保存されます。
- **生成されたインデックス** は、履歴をスキャンせずに高速な読み込みを可能にします。

## 契約

この製品は、次の3つの契約によって定義されます。

| 契約 | 定義内容 | スキーマ |
|----------|----------------|--------|
| [Record](docs/record-contract.md) | 内部テストの実行内容 | `schemas/dogfood-record.schema.json` |
| [Scenario](docs/scenario-contract.md) | 実際の内部テストとは何か | `schemas/scenario.schema.json` |
| [Policy](docs/policy-contract.md) | 検証システムが強制するルール | `schemas/policy.schema.json` |

## 強制レベル

| モード | 動作 | 使用するタイミング |
|------|----------|-------------|
| `required` | 違反があった場合、エラーにする | すべてのリポジトリのデフォルト |
| `warn-only` | 警告は表示するが、処理を中断しない | 理由が文書化され、レビュー日がある新しいリポジトリ |
| `exempt` | 評価をスキップする | 理由とレビュー日があるリポジトリ |

詳細は、[enforcement-tiers.md](docs/enforcement-tiers.md) を参照してください。

## 統合

| システム | 役割 |
|--------|------|
| dogfood-labs | 認証された書き込みストア + ポリシー管理 |
| shipcheck | 強制の実行対象 (Gate F) |
| repo-knowledge | クエリ/インデックスのミラー (SQLite 読み込みモデル) |
| 組織監査 | ポートフォリオの利用 |

## 検証

```bash
bash verify.sh
```

検証システム、データ取り込み、レポート、およびポートフォリオツール (76種類以上のテスト) をすべて実行します。

## リポジトリの構成

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

## 信頼モデル

**処理されるデータ:** ソースリポジトリからの内部テストの送信データ (JSON)、ポリシー YAML ファイル、生成されたレコードファイルとインデックスファイル。 すべてのデータは Git で管理されます。外部データベースは使用しません。

**処理されないデータ:** ユーザーの認証情報、認証トークン (GitHub で管理される CI シークレットを除く)、外部 API (GitHub Actions API を除く)、個人情報、テレメトリー、分析。

**権限:** GitHub Actions ワークフローでは、取り込みボットが承認されたレコードをコミットするために、`contents: write` 権限が必要です。 ソースリポジトリでは、`DOGFOOD_TOKEN` シークレットが必要です。 その他の特権は必要ありません。

**テレメトリーは行いません。** 分析も行いません。 GitHub API 以外のネットワーク接続もありません。

## 運用サイクル

- **毎週:** 最新性の確認 — 14日以上経過したリポジトリをフラグ付けし、30日を超過した場合はエラーにします。
- **毎月:** ポリシーの調整 — 警告のみ/除外対象のリポジトリを昇格するかどうかを検討します。
- **エラーが発生した場合:** 根本原因を調査し、実際の状況に基づいてのみポリシーを更新します。
- **新しいリポジトリ:** デフォルトでは必須とし、弱いレベルに設定する場合は理由を文書化します。

詳細については、[operating-cadence.md](docs/operating-cadence.md) を参照してください。

## 原則

展開に関する原則は、拡張時の実際の失敗から得られた10のルールをまとめたものです。詳細は、[rollout-doctrine.md](docs/rollout-doctrine.md) をご覧ください。

---

<a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> が作成しました。
