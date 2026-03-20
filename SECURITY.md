# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| main branch | Yes |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing:

**64996768+mcp-tool-shop@users.noreply.github.com**

### Response Timeline

- **Acknowledgment:** Within 48 hours
- **Assessment:** Within 7 days
- **Fix timeline:** Depends on severity; critical issues prioritized

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment

## Security Scope

dogfood-labs is a governance data store. Its security surface is:

- **GitHub Actions workflows** that ingest and verify submissions
- **JSON Schema validation** of incoming records
- **Policy evaluation** of dogfood compliance
- **Git-based persistence** of records and indexes

### What This Repo Touches

- Reads submission payloads from `repository_dispatch` events
- Validates against JSON Schema (AJV)
- Writes accepted records to the `records/` directory via git commit
- Rebuilds read indexes from accepted records
- Reads policy YAML files for enforcement evaluation

### What This Repo Does NOT Touch

- No user credentials or authentication tokens (beyond CI secrets)
- No external APIs or network calls (beyond GitHub Actions API for dispatch)
- No databases or persistent state beyond git
- No telemetry or analytics
- No user-facing UI

### No Telemetry

This repository collects no telemetry, analytics, or usage data.
