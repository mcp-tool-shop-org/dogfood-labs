import type { SiteConfig } from '@mcptoolshop/site-theme';

export const config: SiteConfig = {
  title: 'dogfood-labs',
  description: 'Centralized dogfood evidence system — proves every repo was actually exercised in a dogfood-worthy way.',
  logoBadge: 'DL',
  brandName: 'dogfood-labs',
  repoUrl: 'https://github.com/mcp-tool-shop-org/dogfood-labs',
  footerText: 'MIT Licensed — built by <a href="https://github.com/mcp-tool-shop-org" style="color:var(--color-muted);text-decoration:underline">mcp-tool-shop-org</a>',

  hero: {
    badge: 'Org Governance',
    headline: 'dogfood-labs',
    headlineAccent: 'proves it ships.',
    description: 'Centralized dogfood evidence system. 13 repos, 8 surfaces, all verified pass, all enforcement required.',
    primaryCta: { href: '#architecture', label: 'How it works' },
    secondaryCta: { href: 'handbook/', label: 'Read the Handbook' },
    previews: [
      { label: 'Verify', code: 'bash verify.sh' },
      { label: 'Portfolio', code: 'node tools/portfolio/generate.js' },
      { label: 'Sync', code: 'rk sync-dogfood --local F:/AI/dogfood-labs' },
    ],
  },

  sections: [
    {
      kind: 'features',
      id: 'features',
      title: 'What It Does',
      subtitle: 'Auditable dogfood governance for the entire org.',
      features: [
        { title: 'Evidence-Based', desc: 'Every dogfood run produces a structured record with schema validation, provenance checks, and policy compliance.' },
        { title: 'Policy-Driven', desc: 'Per-repo enforcement tiers (required, warn-only, exempt) with promotion paths and review dates.' },
        { title: 'Full Coverage', desc: '13 repos across 8 product surfaces: CLI, desktop, web, API, MCP server, npm package, plugin, library.' },
      ],
    },
    {
      kind: 'code-cards',
      id: 'architecture',
      title: 'Architecture',
      cards: [
        { title: 'Three Contracts', code: '# Record — what a dogfood run looks like\n# Scenario — what constitutes real exercise\n# Policy — what rules the verifier enforces' },
        { title: 'Data Flow', code: 'Source repo → repository_dispatch\n  → Central verifier (schema + provenance + policy)\n  → Accepted record → records/<org>/<repo>/\n  → Rebuilt indexes → latest-by-repo.json' },
        { title: 'Consumers', code: 'shipcheck   → Gate F enforcement\nrepo-knowledge → SQLite mirror\norg audit   → Portfolio consumer' },
      ],
    },
  ],
};
