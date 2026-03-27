---
title: Welcome
description: dogfood-labs handbook — centralized dogfood governance for mcp-tool-shop-org
sidebar:
  order: 0
---

dogfood-labs is the centralized dogfood evidence system for mcp-tool-shop-org. It proves, with auditable evidence, that each repo was actually exercised in a dogfood-worthy way.

## What This System Does

- **Source repos** define scenarios and run dogfood workflows
- **Central verifier** validates schema, provenance, and policy compliance
- **Accepted records** are persisted with full audit trail
- **Generated indexes** make dogfood status queryable across the org

## Key Concepts

| Concept | What It Means |
|---------|---------------|
| **Record** | A structured JSON document proving a dogfood run happened |
| **Scenario** | A YAML definition of what constitutes real exercise |
| **Policy** | Per-repo rules governing enforcement and freshness |
| **Surface** | The product type being dogfooded (CLI, desktop, web, etc.) |

## Current Coverage

13 repos across 8 product surfaces, all verified pass, all enforcement: required.

## Getting Started

- [Beginner's Guide](./beginners/) -- new to dogfood-labs? start here
- [Architecture](./architecture/) -- how the system works
- [Contracts](./contracts/) -- the three defining contracts
- [Operating Guide](./operating-guide/) -- day-to-day operations
- [Integration](./integration/) -- how other systems consume dogfood status
