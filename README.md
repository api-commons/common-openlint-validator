# API Commons OpenLint Validator

A browser-based API governance playground — lint **thirteen artifact types**
(APIs.json, OpenAPI 3.x, Swagger 2.0, MCP, Arazzo, AsyncAPI, JSON Schema, JSON
Structure, JSON-LD, Plans, Rate Limits, FinOps, Agent Skills) with API Commons
rules, on the [OpenLint](https://openlint.org) engine.
Live at **[validator.apicommons.org](https://validator.apicommons.org)**.

- **Search APIs.io and load real artifacts** — pick an artifact type, search the
  [APIs.io](https://apis.io) catalog, and load any result straight into the
  editor. The validator is a first-class internal consumer of the APIs.io API.
  (Requires the apis-io-aws deploy that enables CORS + the internal-tier origin.)
- **Toggle YAML ⇄ JSON** — the editor converts the artifact in place.
- **A default API Commons ruleset per artifact type** — see
  [`rules/defaults/`](./rules/defaults); OpenAPI/AsyncAPI/Arazzo extend the
  built-in OpenLint rulesets, the rest are starter rulesets to build on.
- **Powered by OpenLint** — runs the published
  `@openlint/openlint-*` engine entirely in the browser (no backend).
- **Best-of-breed rules** compiled from the first-party
  [API Evangelist](https://github.com/api-evangelist/rules) OpenAPI governance
  ruleset plus public, redistribution-compatible Spectral rulesets (SPS Commerce,
  Adidas, Trimble, Paystack, DigitalOcean, Microcks, Baloise, Team Digitale,
  Schwarz IT — all Apache-2.0 or MIT). Attribution and vendored licenses are in
  [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) and
  [`rules/sources/`](./rules/sources). The AGPL-3.0 Italian Government ruleset is
  intentionally excluded.
- **Swagger 2.0 and OpenAPI 3.x as separate groupings** — both share the
  `openapi` rule catalog, which is format-scoped (46 `oas2` twins, 138
  `oas3`-only, 285 format-agnostic), so each grouping runs only the rules for its
  major version. Pasting or uploading a `swagger: "2.0"` document selects the
  Swagger 2.0 grouping. See
  [`rules/SWAGGER-2.0-PARITY.md`](./rules/SWAGGER-2.0-PARITY.md).
- **Run locally / offline** — the **Run Locally** link downloads the whole app
  as a single self-contained `index.html` (all JS, CSS, and workers inlined) that
  runs from a double-click, no server required.
- **Select rules by tag** (`source:*`, `category:*`, `format:*`) or **edit your
  own ruleset** in a Monaco editor.

## Develop

```bash
npm install
npm run compile-rules   # rebuild rules/api-commons-recommended.yaml + src/compiled-ruleset.ts
npm run dev
npm run build           # dist/ (the site) + single-file dist-local/ zipped into dist/common-openlint-validator.zip
npm run check           # catalog sync, every format (plus Swagger 2.0) against the engine, skill sync, verify:oas2
npm run verify:oas2     # lint Swagger 2.0 docs through the app path; oas2 twins must fire, no oas3-only misfires
npm run parity:oas2     # re-run the Swagger 2.0 <-> 3.x classify/tag pass over rules/all-rules.yaml
```

Rules use built-in OpenLint functions only (so the compiled set runs with no
custom JS); rules needing custom functions are kept in `rules/sources/` for
future curation. Deployed to GitHub Pages via `.github/workflows/pages.yml`.

## Privacy

Everything runs client-side. Search and Git tokens, AI API keys, saved artifacts,
and rule overrides are stored only in your browser's local storage and are sent
directly from your browser to the services you use (APIs.io, GitHub/GitLab/Bitbucket,
your chosen model provider) — never to a validator server (there isn't one).
**Reset** clears it all.

## The tags, and the why

The rule catalog's tag vocabulary — `format:` / `experience:` / `spec:` / `topic:` /
`owasp:` — is the canonical reference in [`rules/TAG-TAXONOMY.md`](./rules/TAG-TAXONOMY.md);
filter and group rules by any of them. Each rule is a machine-executable check; for the
human *why* behind them, see the [governance guidance](https://guidance.apievangelist.com/store/rules/)
at guidance.apievangelist.com.

---

Part of the [API Commons rule catalog](https://apicommons.org/rules/) — a project of [API Evangelist](https://apievangelist.com), maintained openly under [API Commons](https://apicommons.org).

## Part of API Commons

A browser-first tool from **[API Commons](https://apicommons.org)** — everything runs locally in your browser, so your tokens and data never leave it. See every tool at **[apicommons.org/tools](https://apicommons.org/tools/)** and the machine-readable building blocks at **[apicommons.org](https://apicommons.org)**.

**Related tools**
- [API Governance MCP](https://github.com/api-commons/api-governance-mcp) — the same governance as an MCP server for any AI client
- [Ruleset Commons](https://rulesets.apicommons.org) — a registry of adoptable, provenanced rulesets
- [Spectral Ruleset Studio](https://studio.apicommons.org) — turn a prose style guide into an owned ruleset
- [Governance Coverage](https://coverage.apicommons.org) — how much of your API your rules actually check
- [Spectral Reporter](https://reporter.apicommons.org) — Spectral JSON → self-contained HTML report

Free to fork; API Evangelist offers expert governance services when you want help.

## License

**[Apache-2.0](LICENSE).**

API Commons licenses **code** under Apache-2.0 and **artifacts** — schemas, rulesets,
examples and API descriptions — under CC BY-NC-SA 4.0.
